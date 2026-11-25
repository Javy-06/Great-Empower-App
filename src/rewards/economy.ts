/**
 * Great Empower rewards economy — pure, framework-free state transitions.
 * Every operation validates first and returns either a complete new state or an error;
 * a failed operation never changes balance, vouchers or history (all-or-nothing).
 */
import {
  challenges,
  earningRules,
  findProduct,
  findVoucherDef,
  type EarningKind,
  type GameBenefit,
} from "./catalogue.ts";

export type VoucherStatus = "available" | "redeemed" | "expired";

export interface OwnedVoucher {
  id: string;
  defId: string;
  acquiredAt: number;
  expiresAt: number;
  usedAt?: number;
  usedOnProductId?: string;
}

export interface OwnedBenefit {
  id: string;
  productId: string;
  benefit: GameBenefit;
  acquiredAt: number;
  /** Benefits are stored until the Great Empower game is connected and can apply them. */
  status: "stored";
}

export type TransactionKind = "earn" | "challenge" | "voucher-claim" | "purchase";

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
  version: 1;
  points: number;
  vouchers: OwnedVoucher[];
  benefits: OwnedBenefit[];
  transactions: Transaction[];
  /** Activity keys already paid (e.g. "lesson-complete:hospital-bills"). */
  earned: string[];
  claimedChallenges: string[];
}

export type Result = { ok: true; state: RewardsState; transaction: Transaction } | { ok: false; error: string };

/** Existing demo balance from the project (demoRewards.points). */
export const STARTING_POINTS = 2450;

export const initialRewardsState = (): RewardsState => ({
  version: 1,
  points: STARTING_POINTS,
  vouchers: [],
  benefits: [],
  transactions: [],
  earned: [],
  claimedChallenges: [],
});

const DAY = 24 * 60 * 60 * 1000;

export function voucherStatus(v: OwnedVoucher, now: number): VoucherStatus {
  if (v.usedAt) return "redeemed";
  if (now > v.expiresAt) return "expired";
  return "available";
}

const duplicate = (state: RewardsState, requestId: string) =>
  state.transactions.some((t) => t.requestId === requestId);

const tx = (state: RewardsState, t: Omit<Transaction, "id">): Transaction => ({
  ...t,
  id: `tx-${state.transactions.length + 1}-${t.at}`,
});

/** Pay points once for a real in-app activity. */
export function earn(
  state: RewardsState,
  kind: EarningKind,
  subjectId: string,
  now: number,
): Result {
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

/** Spend points to claim a voucher into the wallet. */
export function claimVoucher(
  state: RewardsState,
  defId: string,
  requestId: string,
  now: number,
): Result {
  if (duplicate(state, requestId)) return { ok: false, error: "This request was already processed." };
  const def = findVoucherDef(defId);
  if (!def) return { ok: false, error: "This voucher is not available." };
  if (state.points < def.cost)
    return { ok: false, error: `You need ${def.cost - state.points} more points for this voucher.` };
  const voucher: OwnedVoucher = {
    id: `vch-${state.vouchers.length + 1}-${now}`,
    defId,
    acquiredAt: now,
    expiresAt: now + def.validityDays * DAY,
  };
  const transaction = tx(state, {
    requestId,
    kind: "voucher-claim",
    at: now,
    points: -def.cost,
    title: `Claimed voucher: ${def.title}`,
  });
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      points: state.points - def.cost,
      vouchers: [voucher, ...state.vouchers],
      transactions: [transaction, ...state.transactions],
    },
  };
}

/** Why a voucher can or cannot be used on a product (shown in the UI and enforced at checkout). */
export function voucherEligibility(
  state: RewardsState,
  voucherId: string,
  productId: string,
  now: number,
): { ok: true; discount: number } | { ok: false; reason: string } {
  const v = state.vouchers.find((x) => x.id === voucherId);
  if (!v) return { ok: false, reason: "You don't own this voucher." };
  const status = voucherStatus(v, now);
  if (status === "redeemed") return { ok: false, reason: "This voucher has already been used." };
  if (status === "expired") return { ok: false, reason: "This voucher has expired." };
  const def = findVoucherDef(v.defId);
  const product = findProduct(productId);
  if (!def || !product) return { ok: false, reason: "This voucher can't be applied here." };
  if (!product.tags.some((t) => def.eligibleTags.includes(t)))
    return { ok: false, reason: "Not eligible for this item." };
  if (product.price < def.minSpend)
    return { ok: false, reason: `Needs a minimum spend of ${def.minSpend} pts.` };
  return { ok: true, discount: Math.min(def.discount, product.price) };
}

export function quote(state: RewardsState, productId: string, voucherId: string | null, now: number) {
  const product = findProduct(productId);
  if (!product) return null;
  let discount = 0;
  let voucherError: string | undefined;
  if (voucherId) {
    const e = voucherEligibility(state, voucherId, productId, now);
    if (e.ok) discount = e.discount;
    else voucherError = e.reason;
  }
  const total = product.price - discount;
  return { price: product.price, discount, total, affordable: state.points >= total, voucherError };
}

/** Buy a Marketplace item, optionally applying one owned voucher. */
export function purchase(
  state: RewardsState,
  productId: string,
  voucherId: string | null,
  requestId: string,
  now: number,
): Result {
  if (duplicate(state, requestId)) return { ok: false, error: "This purchase was already processed." };
  const product = findProduct(productId);
  if (!product) return { ok: false, error: "This item is not available." };
  let discount = 0;
  if (voucherId) {
    const e = voucherEligibility(state, voucherId, productId, now);
    if (!e.ok) return { ok: false, error: e.reason };
    discount = e.discount;
  }
  const total = product.price - discount;
  if (state.points < total)
    return { ok: false, error: `You need ${total - state.points} more points.` };

  const vouchers = voucherId
    ? state.vouchers.map((v) =>
        v.id === voucherId ? { ...v, usedAt: now, usedOnProductId: productId } : v,
      )
    : state.vouchers;
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
  const transaction = tx(state, {
    requestId,
    kind: "purchase",
    at: now,
    points: -total,
    title: product.name,
    detail: discount ? `Voucher applied: −${discount} pts` : undefined,
  });
  return {
    ok: true,
    transaction,
    state: {
      ...state,
      points: state.points - total,
      vouchers,
      benefits,
      transactions: [transaction, ...state.transactions],
    },
  };
}
