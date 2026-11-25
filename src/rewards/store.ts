import { createStore, useStore } from "@/state/store";
import type { EarningKind } from "./catalogue";
import {
  claimChallenge as claimChallengeOp,
  claimVoucher as claimVoucherOp,
  confirmPassUsed as confirmPassUsedOp,
  earn as earnOp,
  initialRewardsState,
  purchase as purchaseOp,
  type Result,
  type RewardsState,
} from "./economy";

/** Single source of truth for points, vouchers, benefits and history (this device only). */
export const rewardsStore = createStore<RewardsState>("ge-rewards-v1", initialRewardsState);

export const useRewards = () => useStore(rewardsStore);

let inFlight = false;

/** Runs one operation atomically: validate → commit full state, or leave everything unchanged. */
function commit(run: (state: RewardsState) => Result): Result {
  if (inFlight) return { ok: false, error: "Another transaction is still being processed." };
  inFlight = true;
  try {
    const result = run(rewardsStore.get());
    if (result.ok) rewardsStore.set(result.state);
    return result;
  } finally {
    inFlight = false;
  }
}

const requestId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const rewardsActions = {
  earn: (kind: EarningKind, subjectId: string) =>
    commit((s) => earnOp(s, kind, subjectId, Date.now())),
  claimChallenge: (id: string) => commit((s) => claimChallengeOp(s, id, Date.now())),
  claimVoucher: (defId: string, reqId = requestId("vch")) =>
    commit((s) => claimVoucherOp(s, defId, reqId, Date.now())),
  purchase: (productId: string, voucherId: string | null, reqId = requestId("buy")) =>
    commit((s) => purchaseOp(s, productId, voucherId, reqId, Date.now())),
  confirmPassUsed: (passId: string) => commit((s) => confirmPassUsedOp(s, passId, Date.now())),
  newRequestId: requestId,
};
