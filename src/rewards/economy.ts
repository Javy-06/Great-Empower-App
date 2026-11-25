/**
 * Great Empower rewards economy — pure, framework-free state transitions.
 * Every operation validates first and returns either a complete new state or an error;
 * a failed operation never changes balance, passes, benefits or history (all-or-nothing).
 *
 * Model (v2): Marketplace items are redeemed directly with points. A new player can redeem ONE
 * eligible food or drink item at the welcome price, once. Food, drink and wellness redemptions
 * issue a pass ("ready") that the player later confirms as "used"; game benefits are stored.
 */
import {
  challenges,
  earningRules,
  findProduct,
  isWelcomeEligible,
  WELCOME_PRICE,
  type EarningKind,
  type GameBenefit,
} from "./catalogue.ts";

export interface OwnedBenefit {
  id: string;
  productId: string;
  benefit: GameBenefit;
  acquiredAt: number;
  /** Benefits are stored until the Great Empower game is connected and can apply them. */
  status: "stored";
}

/**
 * A redemption pass for a Marketplace item (food, drink, wellness). Redeeming spends the points
 * and issues the pass as "ready"; it only becomes "used" when the player explicitly confirms
 * they used it at the (fictional) shop. The code is a random in-game token — no personal data.
 */
export interface RedemptionPass {
  id: string;
  code: string;
  productId: string;
  transactionId: string;
  issuedAt: number;
  status: "ready" | "used";
  usedAt?: number;
}

/** "seed" = the demo account's preloaded starting balance (shown honestly in history). */
export type TransactionKind = "seed" | "earn" | "challenge" | "redeem" | "pass-used";

export interface Transaction {
  id: string;
  requestId: string;
  kind: TransactionKind;
  at: number;
  /** Signed points change. */
  points: number;
  title: string;
  detail?: string;
}

export interface RewardsState {
  version: 2;
  points: number;
  benefits: OwnedBenefit[];
  passes: RedemptionPass[];
  transactions: Transaction[];
  /** Activity keys already paid (e.g. "lesson-complete:hospital-bills"). */
  earned: string[];
  claimedChallenges: string[];
  /** True once the one-time welcome redemption has been used. */
  welcomeRedeemed: boolean;
}

export type Result = { ok: true; state: RewardsState; transaction: Transaction } | { ok: false; error: string };

/** Demo account balance (approved seed: 2,290 + 50 + 50 + 40 + 20). Also the economy tests' base. */
export const STARTING_POINTS = 2450;

export const initialRewardsState = (): RewardsState => ({
  version: 2,
  points: STARTING_POINTS,
  benefits: [],
  passes: [],
  transactions: [],
  earned: [],
  claimedChallenges: [],
  welcomeRedeemed: false,
});

/** A brand-new account: 0 points, no history, Welcome Offer available. */
export const emptyRewardsState = (): RewardsState => ({ ...initialRewardsState(), points: 0 });

const duplicate = (state: RewardsState, requestId: string) =>
  state.transactions.some((t) => t.requestId === requestId);

const tx = (state: RewardsState, t: Omit<Transaction, "id">): Transaction => ({
  ...t,
  id: `tx-${state.transactions.length + 1}-${t.at}`,
});

const fmt = (n: number) => n.toLocaleString("en-MY");

/** Pay points once for a real in-app activity. */
export function earn(state: RewardsState, kind: EarningKind, subjectId: string, now: number): Result {
  const key = `${kind}:${subjectId}`;
  if (state.earned.includes(key)) return { ok: false, error: "Already rewarded for this activity." };
  const rule = earningRules[kind];
  const transaction = tx(state, {
    requestId: `earn:${key}`,
    kind: "earn",
    at: now,
    points: rule.points,
    title: rule.label,
  });
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      points: state.points + rule.points,
      earned: [...state.earned, key],
      transactions: [transaction, ...state.transactions],
    },
  };
}

export function challengeProgress(state: RewardsState, challengeId: string) {
  const c = challenges.find((x) => x.id === challengeId);
  if (!c) return { done: 0, target: 0, complete: false, claimed: false };
  const done = state.earned.filter((key) => c.kinds.some((k) => key.startsWith(`${k}:`))).length;
  return {
    done: Math.min(done, c.target),
    target: c.target,
    complete: done >= c.target,
    claimed: state.claimedChallenges.includes(c.id),
  };
}

export function claimChallenge(state: RewardsState, challengeId: string, now: number): Result {
  const c = challenges.find((x) => x.id === challengeId);
  if (!c) return { ok: false, error: "Unknown challenge." };
  const p = challengeProgress(state, challengeId);
  if (p.claimed) return { ok: false, error: "This challenge bonus was already claimed." };
  if (!p.complete) return { ok: false, error: "Finish the challenge before claiming." };
  const transaction = tx(state, {
    requestId: `challenge:${c.id}`,
    kind: "challenge",
    at: now,
    points: c.bonus,
    title: `Challenge complete: ${c.title}`,
  });
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      points: state.points + c.bonus,
      claimedChallenges: [...state.claimedChallenges, c.id],
      transactions: [transaction, ...state.transactions],
    },
  };
}

/** Whether the one-time welcome price can be applied to this product right now. */
export function welcomeAvailableFor(state: RewardsState, productId: string) {
  const product = findProduct(productId);
  return !!product && !state.welcomeRedeemed && isWelcomeEligible(product);
}

/** Price breakdown shown before confirming; mirrors exactly what `redeem` will charge. */
export function quote(state: RewardsState, productId: string, useWelcome: boolean) {
  const product = findProduct(productId);
  if (!product) return null;
  const welcome = useWelcome && welcomeAvailableFor(state, productId);
  const total = welcome ? WELCOME_PRICE : product.price;
  return { price: product.price, total, welcome, affordable: state.points >= total };
}

/** Redeem a Marketplace item directly with points (optionally at the one-time welcome price). */
export function redeem(
  state: RewardsState,
  productId: string,
  options: { welcome: boolean },
  requestId: string,
  now: number,
): Result {
  if (duplicate(state, requestId)) return { ok: false, error: "This redemption was already processed." };
  const product = findProduct(productId);
  if (!product) return { ok: false, error: "This item is not available." };
  if (options.welcome) {
    if (state.welcomeRedeemed) return { ok: false, error: "Your welcome redemption has already been used." };
    if (!isWelcomeEligible(product))
      return { ok: false, error: "The welcome price applies to food and drink items only." };
  }
  const total = options.welcome ? WELCOME_PRICE : product.price;
  if (state.points < total) return { ok: false, error: `You need ${fmt(total - state.points)} more points.` };

  const transaction = tx(state, {
    requestId,
    kind: "redeem",
    at: now,
    points: -total,
    title: product.name,
    detail: options.welcome ? `Welcome offer · regular ${fmt(product.price)} pts` : undefined,
  });
  const benefits = product.benefit
    ? [
        {
          id: `ben-${state.benefits.length + 1}-${now}`,
          productId,
          benefit: product.benefit,
          acquiredAt: now,
          status: "stored" as const,
        },
        ...state.benefits,
      ]
    : state.benefits;
  const passes = product.benefit
    ? state.passes
    : [
        {
          id: `pass-${state.passes.length + 1}-${now}`,
          code: passCode(requestId, now),
          productId,
          transactionId: transaction.id,
          issuedAt: now,
          status: "ready" as const,
        },
        ...state.passes,
      ];
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      points: state.points - total,
      benefits,
      passes,
      welcomeRedeemed: state.welcomeRedeemed || options.welcome,
      transactions: [transaction, ...state.transactions],
    },
  };
}

/** Non-sensitive in-game token, e.g. "GE-7K3F-92QD". Derived from the request ID and time. */
export function passCode(seed: string, now: number) {
  let h = 2166136261;
  for (const ch of `${seed}:${now}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  let x = h;
  for (let i = 0; i < 8; i++) {
    out += alphabet[x % alphabet.length];
    x = (Math.floor(x / alphabet.length) ^ Math.imul(x + i, 2654435761)) >>> 0;
  }
  return `GE-${out.slice(0, 4)}-${out.slice(4)}`;
}

/** Final, explicit "I used this" step. Applies exactly once; points never change here. */
export function confirmPassUsed(state: RewardsState, passId: string, now: number): Result {
  const pass = state.passes.find((p) => p.id === passId);
  if (!pass) return { ok: false, error: "This pass was not found." };
  if (pass.status === "used") return { ok: false, error: "This pass was already marked as used." };
  const requestId = `pass-used:${passId}`;
  if (duplicate(state, requestId)) return { ok: false, error: "This pass was already marked as used." };
  const product = findProduct(pass.productId);
  const transaction = tx(state, {
    requestId,
    kind: "pass-used",
    at: now,
    points: 0,
    title: `Used: ${product?.name ?? "Marketplace item"}`,
    detail: `Pass ${pass.code}`,
  });
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      passes: state.passes.map((p) => (p.id === passId ? { ...p, status: "used", usedAt: now } : p)),
      transactions: [transaction, ...state.transactions],
    },
  };
}
