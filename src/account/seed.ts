import { earningRules } from "../rewards/catalogue.ts";
import { emptyRewardsState, type RewardsState, type Transaction } from "../rewards/economy.ts";

/**
 * The approved demo seed. MUST match ge_private.seed_account() in
 * supabase/migrations/20261126000000_demo_accounts.sql (checked by seed.test.ts):
 *   Demo starting balance        +2,290
 *   Lesson: Money talks             +50
 *   Lesson: Emergency fund          +50
 *   Video: What is insurance?       +40
 *   Infographic: insurance safety   +20
 *   ─────────────────────────────────────
 *   Total                         2,450   · Welcome Offer available · no passes
 */
export const DEMO_DISPLAY_NAME = "Aisyah";
export const DEMO_SEED_BALANCE = 2290;
export const DEMO_EARNED = [
  ["lesson-complete", "money-talks"],
  ["lesson-complete", "emergency-fund"],
  ["video-finished", "what-is-insurance"],
  ["infographic-viewed", "insurance-safety-net"],
] as const;
export const DEMO_COMPLETED = ["money-talks", "emergency-fund", "what-is-insurance", "insurance-safety-net"];
export const DEMO_BOOKMARKED = ["medical-cards"];

export function demoRewardsState(now: number): RewardsState {
  const earned = DEMO_EARNED.map(([kind, subject]) => `${kind}:${subject}`);
  const transactions: Transaction[] = [
    ...DEMO_EARNED.map(([kind, subject], i) => ({
      id: `seed-${i + 2}`,
      requestId: `earn:${kind}:${subject}`,
      kind: "earn" as const,
      at: now - (DEMO_EARNED.length - i) * 60_000,
      points: earningRules[kind].points,
      title: earningRules[kind].label,
    })).reverse(),
    {
      id: "seed-1",
      requestId: "seed:demo-balance",
      kind: "seed",
      at: now - 10 * 60_000,
      points: DEMO_SEED_BALANCE,
      title: "Demo starting balance",
      detail: "Preloaded for the demo account",
    },
  ];
  return {
    ...emptyRewardsState(),
    points: transactions.reduce((sum, t) => sum + t.points, 0),
    earned,
    transactions,
    welcomeRedeemed: false,
  };
}

/** One example upcoming (fictional) guidance session, 3 days from now at 10:00. */
export function demoBooking(now: number) {
  const d = new Date(now + 3 * 86_400_000);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    id: "demo-booking-1",
    ref: "GS-DEMO",
    topic: "Understand medical protection",
    format: "online" as const,
    date,
    time: "10:00",
    guide: "Farah Nadia",
    advisorId: "farah",
    status: "booked" as const,
    createdAt: now,
  };
}
