import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Calculator,
  FileText,
  HeartPulse,
  Hospital,
  Info,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import {
  calculateEngine2Scenario,
  type Engine2ScenarioCalculation,
} from "./medical-claim/calculateEngine2Scenario";
import { MedicalClaimResults } from "./medical-claim/MedicalClaimResults";
import {
  validateMyrInput,
  validateShareRateInput,
  type Engine2RequestIssue,
  type MedicalClaimSimulatorDraft,
} from "./medical-claim/buildEngine2Request";

const steps = [
  "Introduction",
  "Scenario",
  "Medical bill",
  "Eligibility",
  "Employer",
  "Cost sharing",
  "Review & results",
];

type ChoiceOption = { value: string; label: string; description: string; disabled?: boolean };

function emptyDraft(): MedicalClaimSimulatorDraft {
  return {
    careSetting: "",
    coverageGate: "",
    grossBill: "",
    chargeLines: [{ id: 1, description: "", amount: "", eligibility: "" }],
    externalEmployerPayment: "",
    employerScenarioMaximum: "",
    employerReducesDeductible: "",
    deductibleRemaining: "",
    costSharingOrder: "",
    shareType: "",
    shareRate: "",
    exemption: "",
    annualLimitMode: "",
    annualLimitAmount: "",
    lifetimeLimitMode: "",
    lifetimeLimitAmount: "",
  };
}

function hasDraftValues(draft: MedicalClaimSimulatorDraft): boolean {
  return Boolean(
    draft.careSetting ||
    draft.coverageGate ||
    draft.grossBill ||
    draft.externalEmployerPayment ||
    draft.employerScenarioMaximum ||
    draft.employerReducesDeductible ||
    draft.deductibleRemaining ||
    draft.costSharingOrder ||
    draft.shareType ||
    draft.shareRate ||
    draft.exemption ||
    draft.annualLimitMode ||
    draft.annualLimitAmount ||
    draft.lifetimeLimitMode ||
    draft.lifetimeLimitAmount ||
    draft.chargeLines.some((line) => line.description || line.amount || line.eligibility),
  );
}

function ChoiceGroup({
  name,
  label,
  help,
  options,
  value,
  onChange,
  error,
  columns = 1,
}: {
  name: string;
  label: string;
  help?: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: 1 | 2;
}) {
  return (
    <fieldset
      aria-describedby={
        [help && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(" ") || undefined
      }
      aria-invalid={error ? true : undefined}
      aria-required="true"
    >
      <legend className="flex items-baseline justify-between gap-3 text-body-sm font-semibold text-ink">
        <span>{label}</span>
        <span className="shrink-0 text-caption font-normal text-ink-muted">Required</span>
      </legend>
      {help && (
        <p id={`${name}-hint`} className="mt-1 text-body-sm text-ink-muted">
          {help}
        </p>
      )}
      <div className={cn("mt-3 grid gap-2", columns === 2 && "sm:grid-cols-2")}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              htmlFor={`${name}-${option.value}`}
              className={cn(
                "flex min-h-12 items-start gap-3 rounded-xl border p-3 transition-colors focus-within:ring-4 focus-within:ring-navy-900/10",
                option.disabled ? "cursor-not-allowed bg-sunken opacity-70" : "cursor-pointer",
                checked
                  ? "border-navy-900 bg-navy-50"
                  : !option.disabled && "border-line-strong bg-surface hover:border-navy-300",
              )}
            >
              <input
                id={`${name}-${option.value}`}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                required
                onChange={() => onChange(option.value)}
                className="mt-1 size-4 shrink-0 accent-navy-900"
              />
              <span className="min-w-0">
                <span className="block text-body-sm font-semibold text-ink">{option.label}</span>
                <span className="mt-0.5 block text-caption leading-5 text-ink-secondary">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-2 text-body-sm text-error-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function ScopeNotice({ children }: { children: string }) {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-xl border border-navy-200 bg-navy-50 p-3.5 text-body-sm text-navy-900"
    >
      <Info size={18} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

export function MedicalClaimSimulator() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<MedicalClaimSimulatorDraft>(emptyDraft);
  const [nextLineId, setNextLineId] = useState(2);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [educationAcknowledged, setEducationAcknowledged] = useState(false);
  const [calculation, setCalculation] = useState<Engine2ScenarioCalculation | null>(null);
  const [touchedErrors, setTouchedErrors] = useState<Record<string, string>>({});
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const validationSummaryRef = useRef<HTMLDivElement>(null);
  const resultSummaryRef = useRef<HTMLDivElement>(null);
  const pendingIssueFocusRef = useRef<string | null>(null);
  const submissionLockedRef = useRef(false);
  const hasDraft = hasDraftValues(draft);
  const isGated =
    draft.coverageGate === "APPLY_WAITING_PERIOD" || draft.coverageGate === "APPLY_EXCLUSION";

  useEffect(() => {
    if (!isOpen) return;
    const pendingFocusId = pendingIssueFocusRef.current;
    if (pendingFocusId) {
      document.getElementById(pendingFocusId)?.focus();
      pendingIssueFocusRef.current = null;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [isOpen, step]);

  useEffect(() => {
    if (calculation?.kind === "invalid" || calculation?.kind === "failure") {
      validationSummaryRef.current?.focus();
    }
  }, [calculation]);

  useEffect(() => {
    if (calculation?.kind === "success") {
      resultSummaryRef.current?.scrollIntoView({ block: "start" });
    }
  }, [calculation]);

  const invalidateCalculation = () => {
    submissionLockedRef.current = false;
    setCalculation(null);
  };

  const updateDraft = <K extends keyof MedicalClaimSimulatorDraft>(
    key: K,
    value: MedicalClaimSimulatorDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    invalidateCalculation();
    setTouchedErrors((current) => {
      const remaining: Record<string, string> = { ...current };
      delete remaining[String(key)];
      return remaining;
    });
  };

  const updateChargeLine = (
    id: number,
    key: keyof Omit<MedicalClaimSimulatorDraft["chargeLines"][number], "id">,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      chargeLines: current.chargeLines.map((line) =>
        line.id === id ? { ...line, [key]: value } : line,
      ),
    }));
    invalidateCalculation();
    setTouchedErrors((current) => {
      const remaining: Record<string, string> = { ...current };
      delete remaining[`chargeLines.${id}.${key}`];
      return remaining;
    });
  };

  const addChargeLine = () => {
    setDraft((current) => ({
      ...current,
      chargeLines: [
        ...current.chargeLines,
        { id: nextLineId, description: "", amount: "", eligibility: "" },
      ],
    }));
    setNextLineId((current) => current + 1);
    invalidateCalculation();
    setTouchedErrors({});
  };

  const removeChargeLine = (id: number) => {
    setDraft((current) => ({
      ...current,
      chargeLines:
        current.chargeLines.length > 1
          ? current.chargeLines.filter((line) => line.id !== id)
          : current.chargeLines,
    }));
    invalidateCalculation();
    setTouchedErrors({});
  };

  const returnToEntry = () => {
    setIsOpen(false);
    setStep(0);
    setConfirmCancel(false);
  };

  const discardDraft = () => {
    setDraft(emptyDraft());
    setNextLineId(2);
    setEducationAcknowledged(false);
    invalidateCalculation();
    setTouchedErrors({});
    returnToEntry();
  };

  const cancelWizard = () => {
    if (hasDraft) {
      setConfirmCancel(true);
      return;
    }
    returnToEntry();
  };

  const moveBack = () => {
    setConfirmCancel(false);
    if (step === 0) {
      returnToEntry();
      return;
    }
    setStep((current) => current - 1);
  };

  const moveForward = () => {
    setConfirmCancel(false);
    if (step === steps.length - 1) {
      return;
    }
    setStep((current) => current + 1);
  };

  const fieldError = (field: string) => {
    if (calculation?.kind === "invalid" || calculation?.kind === "failure") {
      return calculation.issues.find((item) => item.field === field)?.message;
    }
    return touchedErrors[field] || undefined;
  };

  const recordBlurError = (
    field: string,
    value: string,
    validator: (value: string) => string | undefined,
  ) => {
    const message = validator(value);
    setTouchedErrors((current) => ({ ...current, [field]: message ?? "" }));
  };

  const calculateScenario = () => {
    if (submissionLockedRef.current) return;
    submissionLockedRef.current = true;
    const result = calculateEngine2Scenario(draft, {
      scenarioId: `medical-claim-${globalThis.crypto.randomUUID()}`,
      asOfDate: new Date().toISOString().slice(0, 10),
    });
    setCalculation(result);
    if (result.kind === "success") setTouchedErrors({});
  };

  const recalculateScenario = () => {
    submissionLockedRef.current = false;
    setCalculation(null);
    calculateScenario();
  };

  const editScenario = () => {
    invalidateCalculation();
    setStep(1);
    setConfirmCancel(false);
  };

  const focusIssue = (item: Engine2RequestIssue) => {
    if (step === item.step) {
      if (item.controlId) document.getElementById(item.controlId)?.focus();
      else stepHeadingRef.current?.focus();
      return;
    }
    pendingIssueFocusRef.current = item.controlId ?? null;
    setStep(item.step);
  };

  const entryButtonLabel = hasDraft ? "Continue your draft" : "Start a scenario";

  return (
    <section
      id="medical-claim-simulator"
      aria-label="Medical Claim Simulator"
      className="scroll-mt-24"
    >
      {!isOpen ? (
        <Card padding="none" radius="3xl" className="overflow-hidden border-teal-200">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="flex min-w-0 flex-col items-start p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="teal" variant="solid" icon={ShieldCheck}>
                  Education only
                </Badge>
                <Badge tone="neutral">Guided scenario</Badge>
              </div>
              <h2 className="mt-4 text-heading text-ink md:text-title">Medical claim simulator</h2>
              <p className="mt-2 max-w-2xl text-body text-ink-secondary">
                Explore how a hypothetical medical bill could be divided under clearly selected
                assumptions. This is not a coverage check or an insurer decision.
              </p>
              <div className="mt-5">
                <Button
                  variant="primary"
                  leadingIcon={Calculator}
                  trailingIcon={ArrowRight}
                  onClick={() => {
                    setStep(0);
                    setIsOpen(true);
                  }}
                >
                  {entryButtonLabel}
                </Button>
              </div>
              <p className="mt-3 text-caption text-ink-muted">
                No policy terms are looked up. Your draft stays in this page and is not saved.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-navy-50))] p-5 sm:p-6 md:p-8">
              <p className="text-overline uppercase text-navy-700">A guided walkthrough</p>
              <ul className="grid gap-3">
                <li className="flex items-center gap-3 text-body-sm font-medium text-ink">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-navy-900 shadow-e1">
                    <FileText size={18} aria-hidden />
                  </span>
                  Set up a hypothetical scenario
                </li>
                <li className="flex items-center gap-3 text-body-sm font-medium text-ink">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-e1">
                    <Hospital size={18} aria-hidden />
                  </span>
                  Describe bill lines and assumptions
                </li>
                <li className="flex items-center gap-3 text-body-sm font-medium text-ink">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-crimson-700 shadow-e1">
                    <BriefcaseBusiness size={18} aria-hidden />
                  </span>
                  Review payer and cost-sharing choices
                </li>
              </ul>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="none" radius="3xl" className="border-line shadow-e2">
          <div className="flex flex-col gap-5 border-b border-line p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-overline uppercase text-teal-700">Medical claim simulator</p>
                <p className="mt-1 text-body-sm text-ink-secondary">
                  A private, on-page draft · illustrative Engine 2 calculation
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={X}
                onClick={cancelWizard}
                aria-label="Cancel simulator"
              >
                Cancel
              </Button>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-body-sm font-semibold text-ink">
                  Step {step + 1} of {steps.length}
                  <span className="font-normal text-ink-muted"> · {steps[step]}</span>
                </p>
                <p className="text-caption text-ink-muted">Progress</p>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-sunken"
                role="progressbar"
                aria-label="Simulator progress"
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={step + 1}
              >
                <div
                  className="h-full rounded-full bg-teal-600 transition-[width] duration-200"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            {confirmCancel && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-body-sm text-ink">
                  Discard this draft and return to Simulate? Your entries will be cleared.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setConfirmCancel(false)}>
                    Keep editing
                  </Button>
                  <Button size="sm" variant="danger" onClick={discardDraft}>
                    Discard draft
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_240px] md:gap-8 md:p-6 lg:p-8">
            <div className="min-w-0">
              <h2
                ref={stepHeadingRef}
                tabIndex={-1}
                className="text-heading text-ink outline-none md:text-title"
              >
                {steps[step]}
              </h2>
              <p className="mt-2 max-w-2xl text-body-sm text-ink-secondary">
                {step === 0 &&
                  "Learn what this educational prototype can and cannot tell you before entering a scenario."}
                {step === 1 &&
                  "Choose a care setting and the hypothetical gate scenario you want to explore."}
                {step === 2 &&
                  "Enter a total bill and describe the individual charges. Amounts remain text in this draft."}
                {step === 3 &&
                  "Select an explicit educational eligibility assumption for each bill line."}
                {step === 4 &&
                  "Describe the employer scenario that matches the gate choice you selected."}
                {step === 5 &&
                  "Review possible cost-sharing inputs. Nothing is preselected or calculated."}
                {step === 6 && "Review your assumptions and calculate the educational scenario."}
              </p>

              {step === 0 && (
                <div className="mt-5 space-y-4">
                  <ScopeNotice>
                    Illustrative educational scenario only. This does not reproduce any specific
                    insurance or Takaful product, establish coverage, predict claim acceptance, or
                    provide financial advice.
                  </ScopeNotice>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Card variant="muted" padding="md">
                      <h3 className="text-subheading text-ink">What you can explore</h3>
                      <p className="mt-2 text-body-sm text-ink-secondary">
                        A generic bill scenario with explicit eligibility, employer, and
                        cost-sharing assumptions.
                      </p>
                    </Card>
                    <Card variant="muted" padding="md">
                      <h3 className="text-subheading text-ink">What this cannot decide</h3>
                      <p className="mt-2 text-body-sm text-ink-secondary">
                        Actual policy coverage, claim acceptance, product terms, or guaranteed
                        insurer and employer payments.
                      </p>
                    </Card>
                  </div>
                  <p className="text-body-sm text-ink-muted">
                    Room &amp; Board calculations, sub-limits, capped sharing, and product-specific
                    rules are not part of this prototype. Unknown eligibility cannot be guessed.
                  </p>
                  <label
                    htmlFor="education-acknowledgement"
                    className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line-strong bg-surface p-4"
                  >
                    <input
                      id="education-acknowledgement"
                      type="checkbox"
                      required
                      checked={educationAcknowledged}
                      onChange={(event) => setEducationAcknowledged(event.target.checked)}
                      className="mt-1 size-4 shrink-0 accent-navy-900"
                    />
                    <span>
                      <span className="block text-body-sm font-semibold text-ink">
                        I understand this is an illustrative educational scenario
                      </span>
                      <span className="mt-1 block text-body-sm text-ink-secondary">
                        This does not confirm coverage or guarantee a claim or payment.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="mt-5 space-y-6">
                  <ChoiceGroup
                    name="care-setting"
                    label="Care setting"
                    help="This describes the scenario only. It does not determine coverage or eligibility."
                    value={draft.careSetting}
                    onChange={(value) => updateDraft("careSetting", value)}
                    error={fieldError("careSetting")}
                    columns={2}
                    options={[
                      {
                        value: "INPATIENT",
                        label: "Inpatient",
                        description: "A hypothetical hospital admission.",
                      },
                      {
                        value: "DAY_SURGERY",
                        label: "Day surgery",
                        description: "A separate setting; not treated as inpatient.",
                      },
                      {
                        value: "OUTPATIENT",
                        label: "Outpatient",
                        description: "A hypothetical outpatient visit.",
                      },
                      {
                        value: "EMERGENCY",
                        label: "Emergency",
                        description: "A hypothetical emergency visit.",
                      },
                    ]}
                  />
                  <ChoiceGroup
                    name="coverage-gate"
                    label="Scenario gate"
                    help="Choose a hypothetical path. This does not confirm real waiting periods or exclusions."
                    value={draft.coverageGate}
                    onChange={(value) => updateDraft("coverageGate", value)}
                    error={fieldError("coverageGate")}
                    options={[
                      {
                        value: "PROCEED_WITHOUT_GATE_ASSUMPTION",
                        label: "Continue without a gate assumption",
                        description:
                          "Continue the hypothetical personal-policy stages; this is not a real coverage finding.",
                      },
                      {
                        value: "APPLY_WAITING_PERIOD",
                        label: "Apply a waiting-period gate",
                        description:
                          "Explore a gated scenario where personal-policy stages are not modeled.",
                      },
                      {
                        value: "APPLY_EXCLUSION",
                        label: "Apply an exclusion gate",
                        description:
                          "Explore a gated scenario where personal-policy stages are not modeled.",
                      },
                    ]}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 space-y-5">
                  <TextField
                    id="gross-bill"
                    label="Gross medical bill"
                    hint="Required. Enter digits with up to 2 decimal places. Do not include commas or the RM prefix."
                    error={fieldError("grossBill")}
                    prefix="RM"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    placeholder="e.g. 1250.00"
                    value={draft.grossBill}
                    onChange={(event) => updateDraft("grossBill", event.target.value)}
                    onBlur={(event) =>
                      recordBlurError("grossBill", event.currentTarget.value, validateMyrInput)
                    }
                  />
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="text-subheading text-ink">Bill lines</h3>
                      <p className="mt-1 text-body-sm text-ink-secondary">
                        Add each line once. The category is a description, not a coverage rule.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      leadingIcon={Plus}
                      onClick={addChargeLine}
                    >
                      Add bill line
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {draft.chargeLines.map((line, index) => (
                      <Card key={line.id} variant="muted" padding="md">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-body-sm font-semibold text-ink">
                            Bill line {index + 1}
                          </h4>
                          {draft.chargeLines.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              leadingIcon={Trash2}
                              onClick={() => removeChargeLine(line.id)}
                              aria-label={`Remove bill line ${index + 1}`}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                          <TextField
                            id={`line-description-${line.id}`}
                            label="Description"
                            hint="Required. For your reference only."
                            error={fieldError(`chargeLines.${line.id}.description`)}
                            type="text"
                            required
                            value={line.description}
                            onChange={(event) =>
                              updateChargeLine(line.id, "description", event.target.value)
                            }
                            placeholder="e.g. Consultation"
                          />
                          <TextField
                            id={`line-amount-${line.id}`}
                            label="Line amount"
                            hint="Required. Up to 2 decimal places."
                            error={fieldError(`chargeLines.${line.id}.amount`)}
                            prefix="RM"
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            required
                            value={line.amount}
                            onChange={(event) =>
                              updateChargeLine(line.id, "amount", event.target.value)
                            }
                            onBlur={(event) =>
                              recordBlurError(
                                `chargeLines.${line.id}.amount`,
                                event.currentTarget.value,
                                validateMyrInput,
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                  <ScopeNotice>
                    Engine 2 requires bill lines to reconcile exactly with the gross bill. This is
                    checked when you calculate; line amounts are never adjusted automatically.
                  </ScopeNotice>
                </div>
              )}

              {step === 3 && (
                <div className="mt-5 space-y-4">
                  <ScopeNotice>
                    These are scenario assumptions, not verified benefit or coverage decisions. If
                    you do not know, do not guess.
                  </ScopeNotice>
                  {draft.chargeLines.map((line, index) => (
                    <Card key={line.id} padding="md">
                      <ChoiceGroup
                        name={`eligibility-${line.id}`}
                        label={`Bill line ${index + 1}${line.description ? ` · ${line.description}` : ""}`}
                        help="Choose an assumption only when you want to explore that hypothetical."
                        value={line.eligibility}
                        onChange={(value) => updateChargeLine(line.id, "eligibility", value)}
                        error={fieldError(`chargeLines.${line.id}.eligibility`)}
                        options={[
                          {
                            value: "ELIGIBLE_ASSUMED",
                            label: "Assume eligible",
                            description: "A user-selected scenario assumption only.",
                          },
                          {
                            value: "NON_ELIGIBLE_ASSUMED",
                            label: "Assume non-eligible",
                            description: "A user-selected scenario assumption only.",
                          },
                          {
                            value: "UNKNOWN",
                            label: "Not sure",
                            description: "Engine 2 cannot calculate while eligibility is unknown.",
                          },
                        ]}
                      />
                    </Card>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="mt-5 space-y-5">
                  {!draft.coverageGate ? (
                    <ScopeNotice>
                      Choose a scenario gate on the previous step to see the matching employer
                      inputs.
                    </ScopeNotice>
                  ) : isGated ? (
                    <>
                      <ScopeNotice>
                        This is a separate hypothetical external payment. It is not inferred from a
                        personal-policy or employer-plan benefit.
                      </ScopeNotice>
                      <TextField
                        id="external-employer-payment"
                        label="External employer payment confirmed for this scenario"
                        hint="Required. Enter an explicit amount, including 0 when appropriate. No payment is assumed."
                        error={fieldError("externalEmployerPayment")}
                        prefix="RM"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        required
                        value={draft.externalEmployerPayment}
                        onChange={(event) =>
                          updateDraft("externalEmployerPayment", event.target.value)
                        }
                        placeholder="0.00"
                        onBlur={(event) =>
                          recordBlurError(
                            "externalEmployerPayment",
                            event.currentTarget.value,
                            validateMyrInput,
                          )
                        }
                      />
                    </>
                  ) : (
                    <>
                      <ScopeNotice>
                        This is a hypothetical scenario maximum, not a confirmed payment, plan
                        limit, or guaranteed benefit.
                      </ScopeNotice>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                          id="employer-scenario-maximum"
                          label="Employer scenario maximum"
                          hint="Required. Enter an explicit amount, including 0 when appropriate."
                          error={fieldError("employerScenarioMaximum")}
                          prefix="RM"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          required
                          value={draft.employerScenarioMaximum}
                          onChange={(event) =>
                            updateDraft("employerScenarioMaximum", event.target.value)
                          }
                          placeholder="0.00"
                          onBlur={(event) =>
                            recordBlurError(
                              "employerScenarioMaximum",
                              event.currentTarget.value,
                              validateMyrInput,
                            )
                          }
                        />
                        <TextField
                          id="deductible-remaining"
                          label="Remaining deductible for this scenario"
                          hint="Required. A selected current-scenario amount; no prior balance is inferred."
                          error={fieldError("deductibleRemaining")}
                          prefix="RM"
                          type="text"
                          inputMode="decimal"
                          autoComplete="off"
                          required
                          value={draft.deductibleRemaining}
                          onChange={(event) =>
                            updateDraft("deductibleRemaining", event.target.value)
                          }
                          placeholder="0.00"
                          onBlur={(event) =>
                            recordBlurError(
                              "deductibleRemaining",
                              event.currentTarget.value,
                              validateMyrInput,
                            )
                          }
                        />
                      </div>
                      <ChoiceGroup
                        name="employer-deductible-credit"
                        label="For this hypothetical scenario, should the modeled employer payment reduce the remaining deductible?"
                        help="This is an explicit scenario choice, not an employer-plan rule."
                        value={draft.employerReducesDeductible}
                        onChange={(value) => updateDraft("employerReducesDeductible", value)}
                        error={fieldError("employerReducesDeductible")}
                        columns={2}
                        options={[
                          {
                            value: "yes",
                            label: "Yes",
                            description: "Apply the selected scenario rule.",
                          },
                          {
                            value: "no",
                            label: "No",
                            description: "Leave the selected deductible unchanged.",
                          },
                        ]}
                      />
                    </>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="mt-5 space-y-5">
                  {!draft.coverageGate ? (
                    <ScopeNotice>Choose the scenario gate on the Scenario step first.</ScopeNotice>
                  ) : isGated ? (
                    <Card variant="muted" padding="lg">
                      <Badge tone="navy" icon={ShieldCheck}>
                        Personal stages not requested
                      </Badge>
                      <h3 className="mt-3 text-subheading text-ink">
                        Cost-sharing settings are skipped for this selected gate scenario
                      </h3>
                      <p className="mt-2 text-body-sm text-ink-secondary">
                        The gated request omits deductible, cost-sharing, exemption, and
                        current-claim limit inputs. Gated scenarios skip these personal-policy
                        stages.
                      </p>
                    </Card>
                  ) : (
                    <>
                      <ChoiceGroup
                        name="cost-sharing-order"
                        label="Cost-sharing order"
                        help="Choose an order for this hypothetical calculation; there is no universal default."
                        value={draft.costSharingOrder}
                        onChange={(value) => updateDraft("costSharingOrder", value)}
                        error={fieldError("costSharingOrder")}
                        columns={2}
                        options={[
                          {
                            value: "DEDUCTIBLE_FIRST",
                            label: "Deductible first",
                            description: "Apply the selected deductible before the share.",
                          },
                          {
                            value: "COPAY_FIRST",
                            label: "Co-payment first",
                            description: "Apply the selected share before the deductible.",
                          },
                        ]}
                      />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <ChoiceGroup
                          name="share-type"
                          label="Share type"
                          help="Select one hypothetical component."
                          value={draft.shareType}
                          onChange={(value) => updateDraft("shareType", value)}
                          error={fieldError("shareType")}
                          options={[
                            {
                              value: "CO_PAYMENT",
                              label: "Co-payment",
                              description: "A selected co-payment share component.",
                            },
                            {
                              value: "CO_INSURANCE",
                              label: "Co-insurance",
                              description:
                                draft.exemption && draft.exemption !== "NONE"
                                  ? "Select “No waiver assumption” before changing to co-insurance."
                                  : "A selected co-insurance share component.",
                              disabled: Boolean(draft.exemption && draft.exemption !== "NONE"),
                            },
                          ]}
                        />
                        <div className="space-y-3">
                          <TextField
                            id="share-rate"
                            label="Selected share rate"
                            hint="Required. Enter an exact decimal from 0 to 1 without a percent sign."
                            error={fieldError("shareRate")}
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            required
                            value={draft.shareRate}
                            onChange={(event) => updateDraft("shareRate", event.target.value)}
                            onBlur={(event) =>
                              recordBlurError(
                                "shareRate",
                                event.currentTarget.value,
                                validateShareRateInput,
                              )
                            }
                            placeholder="e.g. 0.10"
                          />
                          <p className="text-caption text-ink-muted">
                            Only the prototype’s NO_CAP share configuration is available. Capped
                            sharing is not modeled.
                          </p>
                        </div>
                      </div>
                      <ChoiceGroup
                        name="exemption"
                        label="Waiver assumption"
                        help={
                          draft.shareType === "CO_INSURANCE"
                            ? "Co-payment waiver assumptions require co-payment as the selected share type."
                            : "This is not a statutory or product entitlement; it does not reassign payment to a payer."
                        }
                        value={draft.exemption}
                        onChange={(value) => updateDraft("exemption", value)}
                        error={fieldError("exemption")}
                        options={[
                          {
                            value: "NONE",
                            label: "No waiver assumption",
                            description: "Keep selected patient cost-sharing amounts.",
                          },
                          {
                            value: "EXEMPT_SELECTED_COPAY_ONLY",
                            label: "Assume selected co-payment is waived",
                            description:
                              draft.shareType === "CO_INSURANCE"
                                ? "Unavailable with co-insurance. Select co-payment to use this assumption."
                                : "Only available as a hypothetical co-payment scenario.",
                            disabled: draft.shareType === "CO_INSURANCE",
                          },
                          {
                            value: "EXEMPT_COPAY_AND_DEDUCTIBLE_AS_ASSUMPTION",
                            label: "Assume co-payment and deductible are waived",
                            description:
                              draft.shareType === "CO_INSURANCE"
                                ? "Unavailable with co-insurance. Select co-payment to use this assumption."
                                : "A combined educational assumption, not a coverage promise.",
                            disabled: draft.shareType === "CO_INSURANCE",
                          },
                        ]}
                      />
                      <div className="grid gap-4 rounded-2xl border border-line bg-sunken p-4 sm:grid-cols-2 sm:p-5">
                        {(["annual", "lifetime"] as const).map((limit) => {
                          const modeKey =
                            limit === "annual" ? "annualLimitMode" : "lifetimeLimitMode";
                          const amountKey =
                            limit === "annual" ? "annualLimitAmount" : "lifetimeLimitAmount";
                          const mode = draft[modeKey];
                          const modeField =
                            limit === "annual" ? "annualLimitMode" : "lifetimeLimitMode";
                          const amountField =
                            limit === "annual" ? "annualLimitAmount" : "lifetimeLimitAmount";
                          const limitName = limit === "annual" ? "Annual" : "Lifetime";
                          return (
                            <div key={limit} className="space-y-3">
                              <ChoiceGroup
                                name={`${limit}-limit`}
                                label={`${limitName} current-claim limit`}
                                help="Required. Choose a scenario state; missing is not zero or unlimited."
                                value={mode}
                                onChange={(value) => updateDraft(modeKey, value)}
                                error={fieldError(modeField)}
                                options={[
                                  {
                                    value: "MODELED",
                                    label: "Enter remaining amount",
                                    description: "For this hypothetical claim only.",
                                  },
                                  {
                                    value: "NO_LIMIT",
                                    label: "Assume no limit",
                                    description: "An explicit scenario choice, not a plan finding.",
                                  },
                                ]}
                              />
                              {mode === "MODELED" && (
                                <TextField
                                  id={`${limit}-limit-amount`}
                                  label="Remaining amount"
                                  hint="Required. Enter an exact scenario amount."
                                  error={fieldError(amountField)}
                                  prefix="RM"
                                  type="text"
                                  inputMode="decimal"
                                  autoComplete="off"
                                  required
                                  value={draft[amountKey]}
                                  onChange={(event) => updateDraft(amountKey, event.target.value)}
                                  onBlur={(event) =>
                                    recordBlurError(
                                      amountField,
                                      event.currentTarget.value,
                                      validateMyrInput,
                                    )
                                  }
                                  placeholder="0.00"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="mt-5 space-y-4">
                  {(calculation?.kind === "invalid" || calculation?.kind === "failure") && (
                    <div
                      ref={validationSummaryRef}
                      role="alert"
                      aria-labelledby="calculation-error-title"
                      tabIndex={-1}
                      className="rounded-2xl border border-error-300 bg-error-50 p-4 outline-none focus-visible:ring-4 focus-visible:ring-error-600/20 sm:p-5"
                    >
                      <h3 id="calculation-error-title" className="text-subheading text-error-800">
                        {calculation.kind === "invalid"
                          ? "Review these inputs before calculating"
                          : "Engine 2 could not complete this calculation"}
                      </h3>
                      <p className="mt-1 text-body-sm text-ink-secondary">
                        No financial result is available. Your entries are retained. Choose an item
                        below to review the related step.
                      </p>
                      <ul className="mt-3 space-y-2">
                        {calculation.issues.map((item, index) => (
                          <li key={`${item.field}-${index}`}>
                            <button
                              type="button"
                              onClick={() => focusIssue(item)}
                              className="min-h-11 text-left text-body-sm font-semibold text-error-800 underline decoration-error-400 underline-offset-2 hover:text-error-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error-700"
                            >
                              {steps[item.step]}: {item.message}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {calculation?.kind === "success" ? (
                    <div ref={resultSummaryRef} className="scroll-mt-24">
                      <MedicalClaimResults
                        result={calculation.result}
                        request={calculation.request}
                      />
                    </div>
                  ) : (
                    <>
                      <Card variant="muted" padding="md">
                        <h3 className="text-subheading text-ink">Review your scenario</h3>
                        <p className="mt-2 text-body-sm text-ink-secondary">
                          Engine 2 will validate and calculate the request built from your selected
                          assumptions. Bill lines must reconcile exactly; amounts remain exact MYR
                          text until Engine 2 processes them.
                        </p>
                        <ul className="mt-4 grid gap-2 text-body-sm text-ink-secondary sm:grid-cols-2">
                          <li className="flex items-center gap-2">
                            <Hospital size={16} className="text-teal-700" aria-hidden />
                            Care setting and gate scenario
                          </li>
                          <li className="flex items-center gap-2">
                            <FileText size={16} className="text-teal-700" aria-hidden />
                            Gross bill and charge lines
                          </li>
                          <li className="flex items-center gap-2">
                            <BriefcaseBusiness size={16} className="text-teal-700" aria-hidden />
                            Employer coordination
                          </li>
                          <li className="flex items-center gap-2">
                            <HeartPulse size={16} className="text-teal-700" aria-hidden />
                            Cost-sharing and limit assumptions
                          </li>
                        </ul>
                      </Card>
                      <ScopeNotice>
                        Illustrative educational scenario only. This does not reproduce any specific
                        insurance or Takaful product, establish coverage, predict claim acceptance,
                        or provide financial advice.
                      </ScopeNotice>
                    </>
                  )}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-line bg-surface p-4 md:sticky md:top-24">
              <p className="text-overline uppercase text-ink-muted">In this prototype</p>
              <ul className="mt-3 space-y-3 text-body-sm text-ink-secondary">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />
                  Generic educational assumptions only.
                </li>
                <li className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 shrink-0 text-navy-700" aria-hidden />
                  No product terms or coverage checks.
                </li>
                <li className="flex items-start gap-2">
                  <X size={16} className="mt-0.5 shrink-0 text-crimson-700" aria-hidden />
                  Results use only the assumptions selected in this scenario.
                </li>
              </ul>
            </aside>
          </div>

          <div className="flex flex-col gap-3 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 md:px-6 lg:px-8">
            {step === 6 && calculation ? (
              <div className="flex flex-col gap-3 sm:w-full sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" leadingIcon={ArrowLeft} onClick={editScenario}>
                  Edit scenario
                </Button>
                <div className="grid gap-3 sm:flex sm:flex-row-reverse">
                  <Button variant="primary" leadingIcon={RotateCcw} onClick={recalculateScenario}>
                    Recalculate
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmCancel(true)}>
                    Start a new scenario
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="secondary" leadingIcon={ArrowLeft} onClick={moveBack}>
                  {step === 0 ? "Back to Simulate" : "Back"}
                </Button>
                <Button
                  variant="primary"
                  disabled={step === 0 && !educationAcknowledged}
                  trailingIcon={step < steps.length - 1 ? ArrowRight : undefined}
                  onClick={() => {
                    if (step < steps.length - 1) moveForward();
                    else calculateScenario();
                  }}
                >
                  {step === 0
                    ? "Continue to scenario"
                    : step === steps.length - 1
                      ? "Calculate educational result"
                      : "Continue"}
                </Button>
              </>
            )}
          </div>
        </Card>
      )}
    </section>
  );
}
