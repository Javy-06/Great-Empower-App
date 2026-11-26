import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import { findProduct } from "@/rewards/catalogue";
import type { OwnedVoucher, RedemptionPass, OwnedBenefit, QuizOutcome, Result, RewardsState, Transaction, WatchOutcome } from "@/rewards/economy";
import { rewardsStore, setRewardsBackend, type RewardsBackend } from "@/rewards/store";
import { learnProgressStore, type LearnProgress, type LessonLanguage } from "@/state/learnProgress";
import { bookingStore, type Booking } from "@/app/guide/SessionsView";
import { checklistStore } from "@/app/GuideCentre";
import { readStore as notificationsReadStore } from "@/data/notifications";
import { readDirty, syncStatusStore, writeDirty } from "./syncStatus";

/**
 * Supabase side of a cloud demo account.
 *
 * One client per account, each with its own auth storage key (`ge-sb-<accountId>`), so
 * anonymous sessions never mix: switching accounts swaps the client, and the session's user id
 * is checked against the account's recorded uid before any data loads.
 *
 * Supabase is authoritative for points/rewards (RPC only) and for synced progress. Analyze /
 * profile inputs are never sent.
 */

export class CloudError extends Error {
  constructor(
    message: string,
    readonly code: "network" | "auth" | "mismatch" | "server",
  ) {
    super(message);
  }
}

let active: { accountId: string; client: SupabaseClient; uid: string } | null = null;

export function clientFor(accountId: string): SupabaseClient {
  return createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
    auth: {
      storageKey: `ge-sb-${accountId}`,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}

const friendlyAuthError = (message: string) => {
  if (/anonymous sign-ins are disabled/i.test(message))
    return "Cloud demo accounts aren't enabled for this project yet (Anonymous sign-ins are off).";
  if (/rate limit|too many/i.test(message))
    return "Too many new accounts were created from this network recently. Please try again later.";
  if (/fetch|network/i.test(message)) return "Couldn't reach the cloud. Check your connection and try again.";
  return "Couldn't create the account in the cloud.";
};

/** Creates a new anonymous Supabase user for this account id. Returns its uid. */
export async function createAnonymousUser(accountId: string): Promise<string> {
  const client = clientFor(accountId);
  try {
    const { data, error } = await client.auth.signInAnonymously();
    if (error || !data.user) throw new CloudError(friendlyAuthError(error?.message ?? ""), "auth");
    return data.user.id;
  } catch (e) {
    if (e instanceof CloudError) throw e;
    throw new CloudError(friendlyAuthError(String(e)), "network");
  } finally {
    client.auth.stopAutoRefresh();
  }
}

/** Calls an RPC; throws CloudError on transport errors, returns the JSON body otherwise. */
async function rpc<T = Record<string, unknown>>(client: SupabaseClient, fn: string, args: Record<string, unknown>) {
  const { data, error } = await client.rpc(fn, args);
  if (error) throw new CloudError(error.message?.includes("fetch") ? "Couldn't reach the cloud." : "The server rejected the request.", error.message?.includes("fetch") ? "network" : "server");
  return data as T & { ok: boolean; code?: string; error?: string };
}

/* ------------------------------------------------------------------------------------------
 * Activation: restore session → verify uid → ensure profile → pull → start sync
 * ---------------------------------------------------------------------------------------- */

export async function activateCloud(accountId: string, expectedUid: string, type: "demo" | "new", displayName?: string) {
  deactivateCloud();
  const client = clientFor(accountId);
  let session;
  try {
    ({ data: { session } } = await client.auth.getSession());
  } catch {
    client.auth.stopAutoRefresh();
    throw new CloudError("Couldn't reach the cloud. Check your connection and try again.", "network");
  }
  if (!session) {
    client.auth.stopAutoRefresh();
    throw new CloudError("This account's saved session is no longer available in this browser.", "auth");
  }
  if (session.user.id !== expectedUid) {
    client.auth.stopAutoRefresh();
    throw new CloudError("The saved session belongs to a different account. It was not opened.", "mismatch");
  }
  // Idempotent: completes setup if a previous attempt stopped between sign-in and seeding.
  const init = await rpc(client, "init_account", { p_type: type, p_display_name: displayName ?? null });
  if (!init.ok) throw new CloudError(init.error ?? "Account setup failed.", "server");

  active = { accountId, client, uid: expectedUid };
  try {
    // Local changes that never reached the cloud (e.g. signed out offline) go up before the pull,
    // so the pull can't overwrite them. If this fails, nothing is overwritten: opening stops.
    await replayDirty(accountId);
  } catch {
    active = null;
    client.auth.stopAutoRefresh();
    throw new CloudError("Couldn't reach the cloud to save your latest changes. Try again when you're online.", "network");
  }
  const profile = await pullAll();
  startSync();
  setRewardsBackend(cloudRewards);
  return profile;
}

export function deactivateCloud() {
  stopSync();
  setRewardsBackend(null);
  if (active) active.client.auth.stopAutoRefresh();
  active = null;
}

export async function resetDemoCloud() {
  if (!active) throw new CloudError("No cloud account is open.", "auth");
  await flushSync();
  const r = await rpc(active.client, "reset_demo", {});
  if (!r.ok) throw new CloudError(r.error ?? "Reset failed.", "server");
  await pullAll();
}

/* ------------------------------------------------------------------------------------------
 * Pull (server → stores). Store writes during a pull are not echoed back.
 * ---------------------------------------------------------------------------------------- */

let suppress = 0;
const withoutEcho = (fn: () => void) => {
  suppress++;
  try {
    fn();
  } finally {
    suppress--;
  }
};

type Row = Record<string, any>;
const learnTimestamps = new Map<string, { started_at: string | null; completed_at: string | null }>();

async function select(table: string, order?: string) {
  const { client } = active!;
  let q = client.from(table).select("*");
  if (order) q = q.order(order, { ascending: false });
  const { data, error } = await q;
  if (error) throw new CloudError("Couldn't load your saved data.", error.message?.includes("fetch") ? "network" : "server");
  return (data ?? []) as Row[];
}

async function pullRewards() {
  const [[profile], ledger, items, watchRows] = await Promise.all([
    select("profiles"),
    select("points_ledger", "created_at"),
    select("reward_items", "issued_at"),
    select("video_watch_progress"),
  ]);
  if (!profile) throw new CloudError("This account has not been set up.", "server");
  const transactions: Transaction[] = ledger.map((l) => ({
    id: l.id,
    requestId: l.request_id,
    kind: l.kind === "pass_used" ? "pass-used" : l.kind,
    at: Date.parse(l.created_at),
    points: l.points,
    title: l.title,
    detail: l.detail ?? undefined,
  }));
  const passes: RedemptionPass[] = items
    .filter((i) => i.item_type === "pass")
    .map((i) => ({
      id: i.id,
      code: i.code,
      productId: i.product_id,
      transactionId: i.ledger_id,
      issuedAt: Date.parse(i.issued_at),
      status: i.status,
      usedAt: i.used_at ? Date.parse(i.used_at) : undefined,
    }));
  const benefits: OwnedBenefit[] = items
    .filter((i) => i.item_type === "benefit" && findProduct(i.product_id)?.benefit)
    .map((i) => ({
      id: i.id,
      productId: i.product_id,
      benefit: findProduct(i.product_id)!.benefit!,
      acquiredAt: Date.parse(i.issued_at),
      status: "stored" as const,
    }));
  const vouchers: OwnedVoucher[] = items
    .filter((i) => i.item_type === "voucher")
    .map((i) => ({
      id: i.id,
      code: i.code,
      productId: i.product_id,
      transactionId: i.ledger_id,
      issuedAt: Date.parse(i.issued_at),
      status: "stored" as const,
    }));
  const watch = Object.fromEntries(watchRows.map((w) => [`${w.content_id}:${w.lang}`, Math.floor(Number(w.watched_seconds))]));
  const state: RewardsState = {
    version: 2,
    points: profile.points_balance,
    transactions,
    passes,
    benefits,
    vouchers,
    watch,
    earned: ledger.filter((l) => l.kind === "earn" && l.earn_key).map((l) => l.earn_key),
    claimedChallenges: ledger
      .filter((l) => l.kind === "challenge" && l.earn_key)
      .map((l) => String(l.earn_key).replace(/^challenge:/, "")),
    welcomeRedeemed: !profile.welcome_offer_available,
  };
  withoutEcho(() => rewardsStore.set(state));
  return profile;
}

async function pullAll() {
  const profile = await pullRewards();
  const [learning, bookings, [appState]] = await Promise.all([
    select("learning_progress"),
    select("guidance_bookings", "created_at"),
    select("user_app_state"),
  ]);
  learnTimestamps.clear();
  learning.forEach((l) => learnTimestamps.set(l.content_id, { started_at: l.started_at, completed_at: l.completed_at }));
  const learn: LearnProgress = {
    language: (profile.language ?? "en") as LessonLanguage,
    bookmarked: learning.filter((l) => l.bookmarked).map((l) => l.content_id),
    started: learning.filter((l) => l.started_at || l.completed_at).map((l) => l.content_id),
    completed: learning.filter((l) => l.completed_at).map((l) => l.content_id),
  };
  const mapped: Booking[] = bookings.map((b) => ({
    id: b.id,
    ref: b.ref,
    topic: b.topic,
    format: b.format,
    area: b.area ?? undefined,
    date: b.session_date,
    time: b.session_time,
    guide: b.advisor_label,
    advisorId: b.advisor_id ?? undefined,
    status: b.status,
    createdAt: Date.parse(b.created_at),
  }));
  withoutEcho(() => {
    learnProgressStore.set(learn);
    bookingStore.set({ bookings: mapped });
    checklistStore.set({ done: appState?.guide_checklist ?? [] });
    notificationsReadStore.set({ read: appState?.notifications_read ?? [] });
  });
  return { displayName: profile.display_name as string | null, accountType: profile.account_type as "demo" | "new" };
}

/* ------------------------------------------------------------------------------------------
 * Push (stores → server), debounced. Only low-risk progress is written directly (RLS-scoped).
 * ---------------------------------------------------------------------------------------- */

type JobName = "learn" | "language" | "bookings" | "app-state";
const jobs: Record<JobName, () => Promise<void>> = {
  learn: () => pushLearn(),
  language: () => pushLanguage(learnProgressStore.get().language),
  bookings: () => pushBookings(),
  "app-state": () => pushAppState(),
};
const isJob = (name: string): name is JobName => name in jobs;

// Jobs re-read the current store state when they run, so a retry always sends the latest data.
const pending = new Set<JobName>();
let timer: number | undefined;
let retryTimer: number | undefined;
let retryAttempt = 0;
let unsubscribers: Array<() => void> = [];
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000, 60_000];

const persistDirty = () => {
  if (active) writeDirty(active.accountId, [...pending]);
};

function schedule(name: JobName) {
  if (suppress || !active) return;
  pending.add(name);
  persistDirty();
  syncStatusStore.set({ state: "saving" });
  window.clearTimeout(timer);
  timer = window.setTimeout(() => void flushSync(), 500);
}

/** Sends queued changes. Failed jobs stay queued (and recorded) and are retried with backoff. */
export async function flushSync() {
  window.clearTimeout(timer);
  window.clearTimeout(retryTimer);
  if (!active || pending.size === 0) return;
  const names = [...pending];
  pending.clear();
  const failed: JobName[] = [];
  for (const name of names) {
    try {
      await jobs[name]();
    } catch {
      failed.push(name);
    }
  }
  failed.forEach((name) => pending.add(name));
  persistDirty();
  if (failed.length) {
    syncStatusStore.set({ state: "error" });
    const delay = RETRY_DELAYS_MS[Math.min(retryAttempt++, RETRY_DELAYS_MS.length - 1)];
    retryTimer = window.setTimeout(() => void flushSync(), delay);
  } else if (pending.size === 0) {
    retryAttempt = 0;
    syncStatusStore.set({ state: "idle" });
  }
}

/** Pushes changes left unsaved by an earlier session (e.g. signed out while offline). */
async function replayDirty(accountId: string) {
  const names = readDirty(accountId).filter(isJob);
  for (const name of names) await jobs[name]();
  writeDirty(accountId, []);
}

const check = async (p: PromiseLike<{ error: unknown }>) => {
  const { error } = await p;
  if (error) throw error;
};

function startSync() {
  stopSync();
  let prevLearn = learnProgressStore.get();
  unsubscribers = [
    learnProgressStore.subscribe(() => {
      const next = learnProgressStore.get();
      if (next.language !== prevLearn.language) schedule("language");
      prevLearn = next;
      schedule("learn");
    }),
    bookingStore.subscribe(() => schedule("bookings")),
    checklistStore.subscribe(() => schedule("app-state")),
    notificationsReadStore.subscribe(() => schedule("app-state")),
  ];
}

/** Stops listening. Unsent jobs remain recorded for this account and are replayed next time. */
function stopSync() {
  unsubscribers.forEach((u) => u());
  unsubscribers = [];
  window.clearTimeout(timer);
  window.clearTimeout(retryTimer);
  pending.clear();
  retryAttempt = 0;
  syncStatusStore.set({ state: "idle" });
}

async function pushLanguage(language: LessonLanguage) {
  const { client, uid } = active!;
  await check(client.from("profiles").update({ language }).eq("user_id", uid));
}

async function pushLearn() {
  const { client, uid } = active!;
  const s = learnProgressStore.get();
  const now = new Date().toISOString();
  const ids = new Set([...s.bookmarked, ...s.started, ...s.completed, ...learnTimestamps.keys()]);
  const rows = [...ids].map((id) => {
    const known = learnTimestamps.get(id);
    const started = s.started.includes(id) || s.completed.includes(id);
    const completed = s.completed.includes(id);
    const row = {
      user_id: uid,
      content_id: id,
      bookmarked: s.bookmarked.includes(id),
      started_at: started ? (known?.started_at ?? now) : null,
      completed_at: completed ? (known?.completed_at ?? now) : null,
    };
    learnTimestamps.set(id, { started_at: row.started_at, completed_at: row.completed_at });
    return row;
  });
  if (rows.length) await check(client.from("learning_progress").upsert(rows, { onConflict: "user_id,content_id" }));
}

async function pushBookings() {
  const { client, uid } = active!;
  const rows = bookingStore.get().bookings.map((b) => ({
    user_id: uid,
    id: b.id,
    ref: b.ref,
    topic: b.topic,
    format: b.format,
    area: b.area ?? null,
    session_date: b.date,
    session_time: b.time,
    advisor_id: b.advisorId ?? null,
    advisor_label: b.guide,
    status: b.status,
  }));
  if (rows.length) await check(client.from("guidance_bookings").upsert(rows, { onConflict: "user_id,id" }));
}

async function pushAppState() {
  const { client, uid } = active!;
  await check(
    client.from("user_app_state").upsert(
      { user_id: uid, guide_checklist: checklistStore.get().done, notifications_read: notificationsReadStore.get().read },
      { onConflict: "user_id" },
    ),
  );
}

/* ------------------------------------------------------------------------------------------
 * Rewards backend: RPC → refresh from server → Result in the app's existing shape
 * ---------------------------------------------------------------------------------------- */

const NETWORK_RETRY = "Couldn't reach the cloud. Please try again — you won't be charged twice.";

async function runRpc(fn: string, args: Record<string, unknown>, pickTx: (body: Row) => string | undefined): Promise<Result> {
  if (!active) return { ok: false, error: "No account is open." };
  let body;
  try {
    body = await rpc(active.client, fn, args);
  } catch (e) {
    return { ok: false, error: e instanceof CloudError && e.code === "network" ? NETWORK_RETRY : "Something went wrong. Nothing was changed." };
  }
  if (!body.ok) return { ok: false, error: body.error ?? "This action wasn't allowed." };
  try {
    await pullRewards();
  } catch {
    /* the action succeeded; the view will refresh on the next pull */
  }
  const state = rewardsStore.get();
  const txId = pickTx(body);
  const transaction =
    state.transactions.find((t) => t.id === txId) ??
    ({ id: txId ?? "unknown", requestId: "", kind: "earn", at: Date.now(), points: Number(body.points ?? 0), title: "" } as Transaction);
  return { ok: true, state, transaction };
}

/** Quiz / watch-time RPCs. Rewards are re-pulled only when points were paid. */
async function verifyRpc(fn: string, args: Record<string, unknown>): Promise<({ ok: true } & Row) | { ok: false; error: string }> {
  if (!active) return { ok: false, error: "No account is open." };
  let body;
  try {
    body = await rpc(active.client, fn, args);
  } catch (e) {
    return { ok: false, error: e instanceof CloudError && e.code === "network" ? "Couldn't reach the cloud. Please try again." : "Something went wrong. Nothing was changed." };
  }
  if (!body.ok) return { ok: false, error: String(body.error ?? "This action wasn't allowed.") };
  if (body.earned) {
    try {
      await pullRewards();
    } catch {
      /* the points were paid; the view will refresh on the next pull */
    }
  }
  return { ...body, ok: true };
}

const cloudRewards: RewardsBackend = {
  earn: (kind, subjectId) => runRpc("earn_points", { p_kind: kind, p_subject: subjectId }, (b) => b.ledger_id),
  claimChallenge: (id) => runRpc("claim_challenge", { p_challenge_id: id }, (b) => b.ledger_id),
  redeem: (productId, welcome, requestId) =>
    runRpc(
      "redeem_reward",
      { p_product_id: productId, p_mode: welcome ? "welcome_offer" : "standard", p_request_id: requestId },
      (b) => b.ledger_id,
    ),
  submitQuiz: async (kind, contentId, answers): Promise<QuizOutcome> => {
    const body = await verifyRpc("submit_quiz", { p_kind: kind, p_content_id: contentId, p_answers: answers });
    if (!body.ok) return body;
    const results = (body.results as { id: string; correct: boolean }[]) ?? [];
    return {
      ok: true,
      score: Number(body.score),
      total: Number(body.total),
      perfect: Boolean(body.passed),
      results,
      earned: Boolean(body.earned),
      alreadyEarned: Boolean(body.already_earned),
      points: Number(body.points ?? 0),
      state: rewardsStore.get(),
    };
  },
  recordWatch: async (videoId, lang, seconds): Promise<WatchOutcome> => {
    const body = await verifyRpc("record_video_watch", { p_video_id: videoId, p_lang: lang, p_seconds: seconds });
    if (!body.ok) return body;
    const s = rewardsStore.get();
    rewardsStore.set({ ...s, watch: { ...(s.watch ?? {}), [`${videoId}:${lang}`]: Math.floor(Number(body.watched_seconds)) } });
    return {
      ok: true,
      watched: Math.floor(Number(body.watched_seconds)),
      required: Number(body.required_seconds),
      earned: Boolean(body.earned),
      alreadyEarned: Boolean(body.already_earned),
      points: Number(body.points ?? 0),
      state: rewardsStore.get(),
    };
  },
  confirmPassUsed: async (passId) => {
    const r = await runRpc("confirm_pass_used", { p_item_id: passId }, () => undefined);
    if (!r.ok) return r;
    const t = r.state.transactions.find((x) => x.kind === "pass-used") ?? r.transaction;
    return { ...r, transaction: t };
  },
};
