/**
 * Illustrative hospital-bill split for the Medical page. Not a real plan.
 *   eligible   = bill − notEligible
 *   deductible = min(deductible, eligible)               (you)
 *   copay      = (eligible − deductible) × copayRate     (you)
 *   insurer    = eligible − deductible − copay
 *   you        = notEligible + deductible + copay
 * Invariant: insurer + you === bill (all amounts rounded to whole ringgit).
 */
export interface BillInput {
  bill: number;
  notEligibleRate: number; // share of the bill the plan doesn't cover (e.g. non-medical items)
  deductible: number;
  copayRate: number;
}
export interface BillSplit {
  bill: number;
  notEligible: number;
  deductible: number;
  copay: number;
  insurer: number;
  you: number;
}

export function splitBill({ bill, notEligibleRate, deductible, copayRate }: BillInput): BillSplit {
  const b = Math.max(0, Math.round(bill));
  const notEligible = Math.round(b * notEligibleRate);
  const eligible = b - notEligible;
  const ded = Math.min(Math.max(0, Math.round(deductible)), eligible);
  const copay = Math.round((eligible - ded) * copayRate);
  const insurer = eligible - ded - copay;
  return { bill: b, notEligible, deductible: ded, copay, insurer, you: notEligible + ded + copay };
}
