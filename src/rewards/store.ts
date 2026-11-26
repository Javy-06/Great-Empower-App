import { createStore, useStore } from "@/state/store";
import type { EarningKind, QuizKind } from "./catalogue";
import type { Coverage, QuizAnswers } from "./verification";
import {
  claimChallenge as claimChallengeOp,
  confirmPassUsed as confirmPassUsedOp,
  earn as earnOp,
  emptyRewardsState,
  recordWatch as recordWatchOp,
  redeem as redeemOp,
  submitQuiz as submitQuizOp,
  type QuizOutcome,
  type WatchOutcome,
  type Result,
  type RewardsState,
} from "./economy";

export const REWARDS_KEY = "ge-rewards-v2";

/**
 * Points, passes, benefits and history for the ACTIVE account.
 *  - Device-only accounts: the pure economy functions run here, all-or-nothing.
 *  - Cloud accounts: a backend (set by the account layer) calls the Supabase RPCs, which are
 *    authoritative; this store is refreshed from the server result.
 */
export const rewardsStore = createStore<RewardsState>(REWARDS_KEY, emptyRewardsState);

export const useRewards = () => useStore(rewardsStore);

export const WATCH_COVERAGE_KEY = "ge-watch-coverage-v1";

/**
 * Per account, per video edition ("<videoId>:<lang>"): the parts of the video already credited as
 * watch time, so replaying them never counts twice. Kept on the device (the server can't see playback).
 */
export const watchCoverageStore = createStore<Record<string, Coverage>>(WATCH_COVERAGE_KEY, () => ({}));

export interface RewardsBackend {
  earn: (kind: EarningKind, subjectId: string) => Promise<Result>;
  claimChallenge: (id: string) => Promise<Result>;
  redeem: (productId: string, welcome: boolean, requestId: string) => Promise<Result>;
  confirmPassUsed: (passId: string) => Promise<Result>;
  /** Server-graded quiz: the server decides the score and whether points are paid. */
  submitQuiz: (kind: QuizKind, contentId: string, answers: QuizAnswers) => Promise<QuizOutcome>;
  /** Server-credited watch time (bounded by real elapsed time between reports). */
  recordWatch: (videoId: string, lang: string, seconds: number) => Promise<WatchOutcome>;
}

let backend: RewardsBackend | null = null;
export const setRewardsBackend = (next: RewardsBackend | null) => {
  backend = next;
};

let inFlight = false;

/** One operation at a time: validate → commit full state, or leave everything unchanged. */
async function commit(local: (state: RewardsState) => Result, remote: (b: RewardsBackend) => Promise<Result>): Promise<Result> {
  if (inFlight) return { ok: false, error: "Another transaction is still being processed." };
  inFlight = true;
  try {
    if (backend) return await remote(backend);
    const result = local(rewardsStore.get());
    if (result.ok) rewardsStore.set(result.state);
    return result;
  } finally {
    inFlight = false;
  }
}

const requestId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const rewardsActions = {
  earn: (kind: EarningKind, subjectId: string) =>
    commit((s) => earnOp(s, kind, subjectId, Date.now()), (b) => b.earn(kind, subjectId)),
  claimChallenge: (id: string) =>
    commit((s) => claimChallengeOp(s, id, Date.now()), (b) => b.claimChallenge(id)),
  redeem: (productId: string, welcome: boolean, reqId = requestId("redeem")) =>
    commit((s) => redeemOp(s, productId, { welcome }, reqId, Date.now()), (b) => b.redeem(productId, welcome, reqId)),
  confirmPassUsed: (passId: string) =>
    commit((s) => confirmPassUsedOp(s, passId, Date.now()), (b) => b.confirmPassUsed(passId)),
  newRequestId: requestId,
  /**
   * Verification paths. Not behind the single-transaction lock: a watch-time report can arrive
   * while another action runs. Device accounts apply synchronously; cloud accounts are serialised
   * per user by the database.
   */
  submitQuiz: async (kind: QuizKind, contentId: string, answers: QuizAnswers): Promise<QuizOutcome> => {
    if (backend) return backend.submitQuiz(kind, contentId, answers);
    const r = submitQuizOp(rewardsStore.get(), kind, contentId, answers, Date.now());
    if (r.ok && r.earned) rewardsStore.set(r.state);
    return r;
  },
  recordWatch: async (videoId: string, lang: string, seconds: number): Promise<WatchOutcome> => {
    if (backend) return backend.recordWatch(videoId, lang, seconds);
    const r = recordWatchOp(rewardsStore.get(), videoId, lang, seconds, Date.now());
    if (r.ok) rewardsStore.set(r.state);
    return r;
  },
};
