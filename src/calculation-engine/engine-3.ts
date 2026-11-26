/**
 * GREAT EMPOWER Engine 3 (pillars A and B): generic educational protection-gap scenarios.
 *
 * Source: V2 Validation Blueprint pp. 14–15 as transcribed in
 * docs/insurance-engine/calculation-rules/engine-3-protection-gap.md (design-system worktree):
 *   A. Life / dependant support and debt gap
 *   B. Critical illness recovery runway gap
 * Medical (C) and emergency (D) pillars have no approved numeric formula and are NOT implemented;
 * the four-tier classification is NOT implemented (it needs all four pillars).
 *
 * Rules carried over from the spec:
 *  - GENERIC_EDUCATIONAL only: no product data, no recommendation, no score or "winner".
 *  - Money is whole MYR from the user, computed exactly in BigInt sen.
 *  - The employer portability factor κ (0–100 %) is a user-selected sensitivity input; κ × cover is
 *    rounded half-up to the sen.
 *  - Gaps are floored at zero; cover-to-need ratios are NOT capped above 100 %; ratio = 100 % when
 *    the need is zero or negative.
 *  - Source conflict (life): the printed formula subtracts liquid assets but the worked persona does
 *    not. Both variants are returned, labelled, and neither is selected silently.
 *
 * This module has no UI, network, persistence or Product Master dependency. Engine 2 is untouched.
 */

export const ENGINE3_VERSION = "E3-AB-1.0.0";

/** Educational configuration from V2 — always shown to the user and always overridable. */
export const ENGINE3_REFERENCES = {
  finalExpensesExampleMyr: 25_000,
  dependantYears: { none: 0, parents: 5, children: 10 },
  ciRunwayYears: { min: 1, max: 5, example: 3 },
  portabilityExamplePercent: 50,
} as const;

export const ENGINE3_LIMITS = { maxMoneyMyr: 100_000_000, maxSupportYears: 40 } as const;

export type Engine3Error = { field: string; message: string };

export interface Engine3Step {
  id: string;
  label: string;
  formula: string;
  /** Formatted values substituted into the formula. */
  working: string;
  resultSen: bigint;
}

export interface LifeInputs {
  monthlyDependantSupportMyr: number;
  supportYears: number;
  dependantDebtMyr: number;
  otherLiabilitiesMyr: number;
  finalExpensesMyr: number;
  liquidAssetsMyr: number;
  personalLifeCoverMyr: number;
  employerLifeCoverMyr: number;
  /** κ in whole percent, 0–100. */
  employerPortabilityPercent: number;
}

export interface CiInputs {
  monthlyNetIncomeMyr: number;
  recoveryYears: number;
  personalCiCoverMyr: number;
  employerCiCoverMyr: number;
  employerPortabilityPercent: number;
}

export interface GapVariant {
  id: "printed-formula" | "worked-example";
  label: string;
  explanation: string;
  needRawSen: bigint;
  needSen: bigint;
  gapSen: bigint;
  /** Cover ÷ need in tenths of a percent (e.g. 362 = 36.2 %), half-up; 1000 when need ≤ 0. */
  ratioPermille: number;
  steps: Engine3Step[];
}

export type LifeResult =
  | {
      ok: true;
      engine: "E3";
      pillar: "A_LIFE";
      version: string;
      mode: "GENERIC_EDUCATIONAL";
      status: "SOURCE_CONFLICT";
      coverSen: bigint;
      coverSteps: Engine3Step[];
      variants: [GapVariant, GapVariant];
      assumptions: string[];
    }
  | { ok: false; errors: Engine3Error[] };

export type CiResult =
  | {
      ok: true;
      engine: "E3";
      pillar: "B_CI";
      version: string;
      mode: "GENERIC_EDUCATIONAL";
      needSen: bigint;
      coverSen: bigint;
      gapSen: bigint;
      ratioPermille: number;
      steps: Engine3Step[];
      assumptions: string[];
    }
  | { ok: false; errors: Engine3Error[] };

/* ------------------------------------------------------------------------------------ helpers */

const SEN = 100n;
const toSen = (myr: number) => BigInt(myr) * SEN;

/** "RM 1,234" for whole ringgit, "RM 1,234.56" otherwise; negative values keep their sign. */
export function formatSen(sen: bigint): string {
  const neg = sen < 0n;
  const abs = neg ? -sen : sen;
  const ringgit = abs / SEN;
  const cents = abs % SEN;
  const whole = ringgit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "−" : ""}RM ${whole}${cents === 0n ? "" : `.${cents.toString().padStart(2, "0")}`}`;
}

/** κ% × amount, rounded half-up to the sen. */
export function portionHalfUp(sen: bigint, percent: number): bigint {
  const p = BigInt(percent);
  return (sen * p * 2n + 100n) / 200n;
}

/** cover ÷ need in tenths of a percent, half-up; 1000 (100 %) when need ≤ 0. Not capped above. */
export function ratioPermille(coverSen: bigint, needSen: bigint): number {
  if (needSen <= 0n) return 1000;
  return Number((coverSen * 2000n + needSen) / (2n * needSen));
}

export const formatRatio = (permille: number) => `${(permille / 10).toFixed(1)}%`;

const max0 = (x: bigint) => (x < 0n ? 0n : x);

function checkMoney(errors: Engine3Error[], field: string, v: number) {
  if (!Number.isInteger(v) || v < 0) errors.push({ field, message: "Enter a whole amount of RM 0 or more." });
  else if (v > ENGINE3_LIMITS.maxMoneyMyr) errors.push({ field, message: "That amount is too large for this illustration." });
}
function checkPercent(errors: Engine3Error[], field: string, v: number) {
  if (!Number.isInteger(v) || v < 0 || v > 100) errors.push({ field, message: "Choose a whole percentage from 0 to 100." });
}

/* ------------------------------------------------------------------------------------ pillar A */

export function calculateLifeGap(input: LifeInputs): LifeResult {
  const errors: Engine3Error[] = [];
  checkMoney(errors, "monthlyDependantSupportMyr", input.monthlyDependantSupportMyr);
  checkMoney(errors, "dependantDebtMyr", input.dependantDebtMyr);
  checkMoney(errors, "otherLiabilitiesMyr", input.otherLiabilitiesMyr);
  checkMoney(errors, "finalExpensesMyr", input.finalExpensesMyr);
  checkMoney(errors, "liquidAssetsMyr", input.liquidAssetsMyr);
  checkMoney(errors, "personalLifeCoverMyr", input.personalLifeCoverMyr);
  checkMoney(errors, "employerLifeCoverMyr", input.employerLifeCoverMyr);
  checkPercent(errors, "employerPortabilityPercent", input.employerPortabilityPercent);
  if (!Number.isInteger(input.supportYears) || input.supportYears < 0 || input.supportYears > ENGINE3_LIMITS.maxSupportYears)
    errors.push({ field: "supportYears", message: `Choose 0 to ${ENGINE3_LIMITS.maxSupportYears} years.` });
  if (errors.length) return { ok: false, errors };

  const support = toSen(input.monthlyDependantSupportMyr);
  const supportTotal = support * 12n * BigInt(input.supportYears);
  const debts = toSen(input.dependantDebtMyr) + toSen(input.otherLiabilitiesMyr);
  const finalExp = toSen(input.finalExpensesMyr);
  const savings = toSen(input.liquidAssetsMyr);
  const personal = toSen(input.personalLifeCoverMyr);
  const employer = toSen(input.employerLifeCoverMyr);
  const employerCounted = portionHalfUp(employer, input.employerPortabilityPercent);
  const cover = personal + employerCounted;

  const coverSteps: Engine3Step[] = [
    {
      id: "A.cover",
      label: "Cover counted",
      formula: "personal life cover + κ × employer group life cover",
      working: `${formatSen(personal)} + ${input.employerPortabilityPercent}% × ${formatSen(employer)}`,
      resultSen: cover,
    },
  ];

  const baseNeed = supportTotal + debts + finalExp;
  const variant = (id: GapVariant["id"], subtractSavings: boolean): GapVariant => {
    const needRaw = subtractSavings ? baseNeed - savings : baseNeed;
    const steps: Engine3Step[] = [
      {
        id: "A.support",
        label: "Support for dependants",
        formula: "monthly support × 12 × years",
        working: `${formatSen(support)} × 12 × ${input.supportYears}`,
        resultSen: supportTotal,
      },
      {
        id: "A.need",
        label: subtractSavings ? "Need (savings subtracted)" : "Need (savings not subtracted)",
        formula: subtractSavings
          ? "support + debts + other liabilities + final expenses − liquid savings"
          : "support + debts + other liabilities + final expenses",
        working: subtractSavings
          ? `${formatSen(supportTotal)} + ${formatSen(debts)} + ${formatSen(finalExp)} − ${formatSen(savings)}`
          : `${formatSen(supportTotal)} + ${formatSen(debts)} + ${formatSen(finalExp)}`,
        resultSen: needRaw,
      },
      {
        id: "A.gap",
        label: subtractSavings ? "Gap (savings subtracted)" : "Gap (savings not subtracted)",
        formula: "max(0, need − cover counted)",
        working: `max(0, ${formatSen(needRaw)} − ${formatSen(cover)})`,
        resultSen: max0(needRaw - cover),
      },
    ];
    return {
      id,
      label: subtractSavings ? "Counting your savings" : "Not counting your savings",
      explanation: subtractSavings
        ? "The blueprint's printed formula: savings you already have reduce what your family would need."
        : "The blueprint's worked example: savings are kept aside (for example, as your own emergency fund).",
      needRawSen: needRaw,
      needSen: max0(needRaw),
      gapSen: max0(needRaw - cover),
      ratioPermille: ratioPermille(cover, needRaw),
      steps,
    };
  };

  return {
    ok: true,
    engine: "E3",
    pillar: "A_LIFE",
    version: ENGINE3_VERSION,
    mode: "GENERIC_EDUCATIONAL",
    status: "SOURCE_CONFLICT",
    coverSen: cover,
    coverSteps,
    variants: [variant("printed-formula", true), variant("worked-example", false)],
    assumptions: [
      "Every amount is your own estimate. Nothing is taken from an insurance product.",
      `Support continues unchanged for ${input.supportYears} year${input.supportYears === 1 ? "" : "s"}; no inflation or investment return is applied.`,
      `${input.employerPortabilityPercent}% of employer group life cover is counted. Employer cover usually depends on staying in the job.`,
      "Debts are listed as needs your family may face. Life insurance does not cancel debts automatically; any payout goes to your nominee or estate.",
    ],
  };
}

/* ------------------------------------------------------------------------------------ pillar B */

export function calculateCiRunway(input: CiInputs): CiResult {
  const errors: Engine3Error[] = [];
  checkMoney(errors, "monthlyNetIncomeMyr", input.monthlyNetIncomeMyr);
  checkMoney(errors, "personalCiCoverMyr", input.personalCiCoverMyr);
  checkMoney(errors, "employerCiCoverMyr", input.employerCiCoverMyr);
  checkPercent(errors, "employerPortabilityPercent", input.employerPortabilityPercent);
  const { min, max } = ENGINE3_REFERENCES.ciRunwayYears;
  if (!Number.isInteger(input.recoveryYears) || input.recoveryYears < min || input.recoveryYears > max)
    errors.push({ field: "recoveryYears", message: `Choose ${min} to ${max} years.` });
  if (errors.length) return { ok: false, errors };

  const income = toSen(input.monthlyNetIncomeMyr);
  const need = income * 12n * BigInt(input.recoveryYears);
  const personal = toSen(input.personalCiCoverMyr);
  const employer = toSen(input.employerCiCoverMyr);
  const cover = personal + portionHalfUp(employer, input.employerPortabilityPercent);
  const gap = max0(need - cover);

  return {
    ok: true,
    engine: "E3",
    pillar: "B_CI",
    version: ENGINE3_VERSION,
    mode: "GENERIC_EDUCATIONAL",
    needSen: need,
    coverSen: cover,
    gapSen: gap,
    ratioPermille: ratioPermille(cover, need),
    steps: [
      {
        id: "B.need",
        label: "Recovery runway",
        formula: "monthly take-home income × 12 × recovery years",
        working: `${formatSen(income)} × 12 × ${input.recoveryYears}`,
        resultSen: need,
      },
      {
        id: "B.cover",
        label: "Critical illness cover counted",
        formula: "personal CI cover + κ × employer group CI cover",
        working: `${formatSen(personal)} + ${input.employerPortabilityPercent}% × ${formatSen(employer)}`,
        resultSen: cover,
      },
      {
        id: "B.gap",
        label: "Gap",
        formula: "max(0, runway − cover counted)",
        working: `max(0, ${formatSen(need)} − ${formatSen(cover)})`,
        resultSen: gap,
      },
    ],
    assumptions: [
      "Every amount is your own estimate. Nothing is taken from an insurance product.",
      `Recovery lasts ${input.recoveryYears} year${input.recoveryYears === 1 ? "" : "s"} with no income, and your take-home income is the amount to replace.`,
      "A critical illness payout is assumed to be approved and paid in full. In reality it depends on the illness meeting the policy's definition, waiting periods and exclusions.",
      "A critical illness benefit is a one-off lump sum, not a monthly salary. This compares it with a runway; it does not say a policy pays for every reason you might stop working.",
      `${input.employerPortabilityPercent}% of employer group CI cover is counted.`,
    ],
  };
}
