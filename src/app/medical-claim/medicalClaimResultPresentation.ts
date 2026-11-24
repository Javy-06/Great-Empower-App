import type {
  Engine2AmountOutput,
  Engine2PublicRequest,
  Engine2StageName,
  Engine2Success,
} from "../../calculation-engine/engine-2.ts";

interface StageDetails {
  title: string;
  explanation: string;
}

const stageDetails: Record<Engine2StageName, StageDetails> = {
  waiting_period_exclusion_gate: {
    title: "Waiting-period / exclusion gate",
    explanation:
      "Applies the selected hypothetical gate. It does not confirm a real policy waiting period, exclusion, or coverage decision.",
  },
  non_eligible_charges: {
    title: "Non-eligible charges",
    explanation:
      "Uses the selected charge-line eligibility assumptions. On the gated path, these labels are trace information and this stage is skipped.",
  },
  room_and_board_sub_limits: {
    title: "Room & Board and sub-limits",
    explanation:
      "Reports the supported Room & Board and sub-limit handling. Modeled Room & Board and non-empty sub-limits are outside this prototype.",
  },
  room_upgrade_proration: {
    title: "Room-upgrade adjustment",
    explanation:
      "Uses the supported room-upgrade setting; this prototype does not model Room & Board charges or benefits.",
  },
  employer_coordination: {
    title: "Employer coordination",
    explanation:
      "Applies the hypothetical non-gated employer coordination input. A gated scenario uses its separate employer input and skips this stage.",
  },
  patient_cost_sharing: {
    title: "Patient cost sharing",
    explanation:
      "Applies the selected hypothetical deductible, cost-share, and waiver configuration. This stage is skipped on a gated path.",
  },
  current_claim_limits: {
    title: "Current-claim limits",
    explanation:
      "Applies explicit limits to this claim's personal-insurer output. It does not update a persistent annual or lifetime balance.",
  },
};

export interface MedicalClaimStagePresentation {
  number: number;
  stage: Engine2StageName;
  title: string;
  status: "CALCULATED" | "APPLIED" | "SKIPPED_GATE";
  explanation: string;
  skippedBecauseGated: boolean;
  values: Record<string, string>;
}

export interface MedicalClaimPaymentPresentation {
  label: string;
  source: string;
  amount: Engine2AmountOutput;
}

export interface MedicalClaimBreakdownRow {
  id: string;
  type: "payer" | "patient" | "adjustment" | "unallocated";
  label: string;
  amount: Engine2AmountOutput;
  note: string;
}

export interface MedicalClaimInsight {
  title: string;
  explanation: string;
}

export interface MedicalClaimResultPresentation {
  resultStatus: Engine2Success["result_status"];
  isGated: boolean;
  grossBill: Engine2AmountOutput;
  patientPayable: Engine2AmountOutput;
  paymentRows: MedicalClaimBreakdownRow[];
  unallocatedAmount: Engine2AmountOutput;
  isReconciled: boolean;
  stages: MedicalClaimStagePresentation[];
  insights: MedicalClaimInsight[];
}

function gateLabel(gate: Engine2PublicRequest["inputs"]["coverage_gate"]) {
  switch (gate) {
    case "APPLY_WAITING_PERIOD":
      return "waiting-period gate";
    case "APPLY_EXCLUSION":
      return "exclusion gate";
    case "PROCEED_WITHOUT_GATE_ASSUMPTION":
      return "no gate assumption";
  }
}

function costSharingInsight(request: Engine2PublicRequest) {
  if (
    request.inputs.employer_coordination.path !== "NON_GATED" ||
    !("share_components" in request.inputs) ||
    !request.inputs.share_components
  ) {
    return null;
  }

  const { cost_sharing_order: order, share_components: shares } = request.inputs;
  const activeShare = shares.co_payment ?? shares.co_insurance;
  if (!activeShare) return null;

  const orderLabel = order === "DEDUCTIBLE_FIRST" ? "deductible first" : "co-payment first";
  const shareLabel = shares.co_payment ? "co-payment" : "co-insurance";

  return {
    title: "Cost-sharing selections",
    explanation: `You selected ${orderLabel} and a ${shareLabel} rate of ${activeShare.rate}. Engine 2's returned deductible and patient-share amounts are shown in the calculation details.`,
  };
}

export function buildMedicalClaimResultPresentation(
  result: Engine2Success,
  request: Engine2PublicRequest,
): MedicalClaimResultPresentation {
  const { outputs } = result;
  const isGated = request.inputs.employer_coordination.path === "GATED";
  const employerIsExternal = outputs.employer_payment.kind === "EXTERNAL_EMPLOYER_PAYMENT";
  const gate = gateLabel(request.inputs.coverage_gate);
  const gateInsight: MedicalClaimInsight = isGated
    ? {
        title: "Selected gate scenario",
        explanation: `You selected a hypothetical ${gate}. Engine 2 returned one external employer payment and marked the personal-policy stages as skipped. This does not confirm a real policy gate or coverage decision.`,
      }
    : {
        title: "Selected gate scenario",
        explanation:
          "You selected no gate assumption. Engine 2 ran the personal-policy stages using your scenario inputs; this does not confirm coverage under any policy.",
      };
  const eligibilityInsight: MedicalClaimInsight = isGated
    ? {
        title: "Eligibility labels",
        explanation:
          "Charge-line eligibility labels are your scenario assumptions. On the gated path they are recorded for trace purposes; personal-policy stages are not run.",
      }
    : {
        title: "Eligibility labels",
        explanation: `Charge-line eligibility labels are your assumptions, not verified coverage. Under those assumptions, Engine 2 returned ${outputs.non_eligible_amount.display_myr} as non-eligible charges.`,
      };
  const paymentInsight: MedicalClaimInsight = isGated
    ? {
        title: "Payer and patient amounts",
        explanation: `The external employer amount appears once as Employer payment. Engine 2 separately returned ${outputs.personal_insurer_payment.display_myr} as personal-insurer payment and ${outputs.patient_payable.display_myr} as patient payable.`,
      }
    : {
        title: "Payer and patient amounts",
        explanation:
          "Employer coordination, personal-insurer payment, and patient payable are separate Engine 2 outputs. Waived amounts are nonpayer adjustments, not payments.",
      };

  const stages = outputs.stage_results.map((stage, index) => {
    const details = stageDetails[stage.stage];
    return {
      number: index + 1,
      stage: stage.stage,
      title: details.title,
      status: stage.status,
      explanation: details.explanation,
      skippedBecauseGated: stage.status === "SKIPPED_GATE",
      values: stage.values,
    };
  });
  const costSharing = costSharingInsight(request);
  const employerPayment: MedicalClaimPaymentPresentation = {
    label: "Employer payment",
    source: employerIsExternal ? "External employer payment" : "Employer coordination",
    amount: outputs.employer_payment.amount,
  };
  const paymentRows: MedicalClaimBreakdownRow[] = [
    {
      id: "employer-payment",
      type: "payer",
      label: employerPayment.label,
      amount: employerPayment.amount,
      note: employerPayment.source,
    },
    {
      id: "personal-insurer-payment",
      type: "payer",
      label: "Insurer payment",
      amount: outputs.personal_insurer_payment,
      note: "Personal-insurer amount returned by Engine 2",
    },
    {
      id: "patient-payable",
      type: "patient",
      label: "Patient payable",
      amount: outputs.patient_payable,
      note: "Patient amount returned by Engine 2",
    },
  ];
  if (!isGated) {
    paymentRows.push(
      {
        id: "waived-copayment",
        type: "adjustment",
        label: "Waived copayment",
        amount: outputs.WAIVED_COPAYMENT,
        note: "Nonpayer adjustment; not an insurer or employer payment",
      },
      {
        id: "waived-deductible",
        type: "adjustment",
        label: "Waived deductible",
        amount: outputs.WAIVED_DEDUCTIBLE,
        note: "Nonpayer adjustment; not an insurer or employer payment",
      },
    );
  }
  paymentRows.push({
    id: "unallocated-amount",
    type: "unallocated",
    label: "Unallocated amount",
    amount: outputs.unallocated_amount,
    note: "Settlement remainder returned by Engine 2",
  });

  return {
    resultStatus: result.result_status,
    isGated,
    grossBill: outputs.gross_bill,
    patientPayable: outputs.patient_payable,
    paymentRows,
    unallocatedAmount: outputs.unallocated_amount,
    isReconciled: outputs.unallocated_amount.sen === "0",
    stages,
    insights: [
      gateInsight,
      eligibilityInsight,
      paymentInsight,
      ...(costSharing ? [costSharing] : []),
    ],
  };
}
