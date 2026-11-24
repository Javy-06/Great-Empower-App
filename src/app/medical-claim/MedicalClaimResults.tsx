import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type {
  Engine2AmountOutput,
  Engine2PublicRequest,
  Engine2Success,
} from "../../calculation-engine/engine-2.ts";
import { buildMedicalClaimResultPresentation } from "./medicalClaimResultPresentation";

function MoneyRow({
  label,
  amount,
  note,
  emphasis = false,
}: {
  label: string;
  amount: Engine2AmountOutput | null;
  note?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="grid min-w-0 gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-4">
      <div className="min-w-0">
        <dt className={emphasis ? "font-semibold text-ink" : "text-body-sm font-medium text-ink"}>
          {label}
        </dt>
        {note && <dd className="text-caption text-ink-muted">{note}</dd>}
      </div>
      <dd
        className={`min-w-0 break-words tabular-nums text-ink ${emphasis ? "text-body font-bold" : "text-body-sm font-semibold"}`}
        data-sen={amount?.sen}
      >
        {amount?.display_myr ?? "Not calculated for this scenario"}
      </dd>
    </div>
  );
}

function senAsDisplay(sen: string) {
  const padded = sen.padStart(3, "0");
  return `RM${padded.slice(0, -2)}.${padded.slice(-2)}`;
}

function LimitDetail({ success }: { success: Engine2Success }) {
  const limit = success.outputs.limit;
  if (!limit) {
    return <p className="text-body-sm text-ink-secondary">Not calculated for this scenario.</p>;
  }

  const describeLimit = (label: string, value: (typeof limit)["annual"]) => (
    <li key={label} className="grid gap-1 text-body-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
      <span className="text-ink-secondary">{label}</span>
      <span className="break-words font-medium text-ink">
        {value.status === "NO_LIMIT" ? "No limit assumed" : senAsDisplay(value.remaining_sen)}
      </span>
    </li>
  );

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {describeLimit("Annual remaining limit", limit.annual)}
        {describeLimit("Lifetime remaining limit", limit.lifetime)}
      </ul>
      <p className="border-t border-line pt-2 text-body-sm text-ink-secondary">
        Effective limit:{" "}
        <span className="break-words font-medium text-ink">
          {limit.effective_limit_status === "UNBOUNDED"
            ? "Unbounded under the selected assumptions"
            : limit.effective_limit_sen === null
              ? "Not available from Engine 2"
              : senAsDisplay(limit.effective_limit_sen)}
        </span>
      </p>
      <p className="text-body-sm text-ink-secondary">
        Applied to this claim:{" "}
        <span className="break-words font-medium text-ink">{senAsDisplay(limit.applied_sen)}</span>
      </p>
    </div>
  );
}

export function MedicalClaimResults({
  result,
  request,
}: {
  result: Engine2Success;
  request: Engine2PublicRequest;
}) {
  const presentation = buildMedicalClaimResultPresentation(result, request);
  const { outputs } = result;

  return (
    <div className="space-y-6" data-testid="medical-claim-calculation-success">
      <section aria-labelledby="medical-claim-result-heading">
        <Card
          variant="navy"
          padding="lg"
          radius="3xl"
          className="border-navy-800 bg-navy-900"
          data-testid="medical-claim-result-summary"
        >
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(14rem,0.7fr)] lg:items-center lg:gap-8">
            <div className="min-w-0">
              <Badge tone="teal" variant="solid" icon={CheckCircle2}>
                Calculated educationally
              </Badge>
              <h3 id="medical-claim-result-heading" className="mt-4 text-subheading text-white">
                Patient payable
              </h3>
              <p
                className="mt-1 break-words text-3xl font-bold leading-tight tabular-nums text-white sm:text-4xl md:text-5xl"
                data-sen={presentation.patientPayable.sen}
              >
                {presentation.patientPayable.display_myr}
              </p>
              <p className="mt-3 max-w-2xl text-body-sm leading-6 text-white/85">
                This is the patient-payable amount returned by Engine 2 for your selected scenario.
                It is illustrative, not a guaranteed benefit or insurer decision.
              </p>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/15 bg-white/10 p-4 sm:p-5">
              <p className="text-caption font-semibold uppercase tracking-wide text-white/75">
                Gross medical bill
              </p>
              <p
                className="mt-2 break-words text-numeric tabular-nums text-white"
                data-sen={presentation.grossBill.sen}
              >
                {presentation.grossBill.display_myr}
              </p>
              <div className="mt-4 border-t border-white/15 pt-3">
                <p className="text-caption text-white/75">Calculation status</p>
                <p
                  className="mt-1 text-body-sm font-semibold text-white"
                  aria-label={`Calculation status: ${presentation.resultStatus}`}
                >
                  {presentation.resultStatus}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="payment-breakdown-heading">
        <div className="mb-3">
          <h3 id="payment-breakdown-heading" className="text-subheading text-ink">
            Payment breakdown
          </h3>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Amounts below are returned by Engine 2; no totals are recomputed here.
          </p>
        </div>
        <Card variant="default" padding="md">
          <dl>
            {presentation.paymentRows.map((row) => (
              <MoneyRow
                key={row.id}
                label={row.label}
                amount={row.amount}
                note={
                  row.id === "employer-payment" && presentation.isGated
                    ? `${row.note} · shown once as the Engine 2 employer payment`
                    : row.note
                }
                emphasis={row.type === "patient"}
              />
            ))}
          </dl>
          {presentation.isGated && (
            <p className="border-t border-line pt-3 text-caption text-ink-muted">
              Waivers do not apply on this gated path.
            </p>
          )}
        </Card>
      </section>

      <section aria-labelledby="reconciliation-heading">
        <Card
          variant={presentation.isReconciled ? "muted" : "default"}
          padding="md"
          className={
            presentation.isReconciled
              ? "border-teal-200 bg-teal-50/60"
              : "border-warning-200 bg-warning-50"
          }
          data-testid="medical-claim-reconciliation"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="reconciliation-heading" className="text-subheading text-ink">
                Bill reconciliation
              </h3>
              <p className="mt-1 max-w-3xl text-body-sm text-ink-secondary">
                {presentation.isReconciled
                  ? "Engine 2 reports a reconciled settlement with no unallocated remainder. Waivers, when present, are nonpayer adjustments and are not counted as payments."
                  : "Engine 2 returned an unallocated remainder. The dashboard does not assign it to a payer or change any returned amount."}
              </p>
            </div>
            <Badge tone={presentation.isReconciled ? "teal" : "warning"} dot>
              {presentation.isReconciled ? "Settlement reconciled" : "Unallocated remainder"}
            </Badge>
          </div>
        </Card>
      </section>

      <section aria-labelledby="educational-insights-heading">
        <div className="mb-3">
          <h3 id="educational-insights-heading" className="text-subheading text-ink">
            What shaped this result
          </h3>
          <p className="mt-1 text-body-sm text-ink-secondary">
            These notes reflect your request and Engine 2&apos;s returned values only.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {presentation.insights.map((insight) => (
            <Card key={insight.title} variant="default" padding="md">
              <h4 className="font-semibold text-ink">{insight.title}</h4>
              <p className="mt-1 text-body-sm leading-6 text-ink-secondary">
                {insight.explanation}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="calculation-journey-heading">
        <div className="mb-3">
          <h3 id="calculation-journey-heading" className="text-subheading text-ink">
            Seven-stage calculation journey
          </h3>
          <p className="mt-1 text-body-sm text-ink-secondary">
            Stage order and statuses below come directly from Engine 2&apos;s trace.
          </p>
        </div>
        {presentation.isGated && (
          <p className="mb-3 rounded-xl border border-navy-200 bg-navy-50 p-3 text-body-sm leading-6 text-navy-900">
            This gated scenario skips personal-policy calculation stages. Each skipped stage is
            marked below and was not executed.
          </p>
        )}
        <ol className="space-y-3">
          {presentation.stages.map((stage) => (
            <li
              key={stage.stage}
              className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] items-start gap-3"
              data-testid={`medical-claim-stage-${stage.number}`}
              data-stage-status={stage.status}
            >
              <span
                className="mt-4 flex size-8 items-center justify-center rounded-full bg-navy-50 text-body-sm font-semibold text-navy-900"
                aria-hidden="true"
              >
                {stage.number}
              </span>
              <Card variant="default" padding="md">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                  <h4 className="min-w-0 font-semibold text-ink">{stage.title}</h4>
                  <Badge tone={stage.skippedBecauseGated ? "neutral" : "teal"}>
                    {stage.status}
                  </Badge>
                </div>
                <p className="mt-2 text-body-sm leading-6 text-ink-secondary">
                  {stage.explanation}
                </p>
                {stage.skippedBecauseGated && (
                  <p className="mt-2 text-body-sm font-medium text-navy-800">
                    Skipped because the claim was gated; Engine 2 did not execute this stage.
                  </p>
                )}
                <details className="mt-3 rounded-lg bg-sunken/60 p-3">
                  <summary className="min-h-11 cursor-pointer py-2 text-body-sm font-medium text-navy-800">
                    View returned stage values
                  </summary>
                  <dl className="mt-2 space-y-2">
                    {Object.entries(stage.values).map(([key, value]) => (
                      <div
                        key={key}
                        className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4"
                      >
                        <dt className="break-words text-caption text-ink-muted">{key}</dt>
                        <dd className="break-words font-mono text-caption text-ink">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <details className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink">
          Advanced calculation details
        </summary>
        <div className="mt-4 space-y-5">
          <section aria-labelledby="calculation-details-heading">
            <h4 id="calculation-details-heading" className="font-semibold text-ink">
              Returned amounts and handling
            </h4>
            <dl className="mt-2">
              <MoneyRow label="Non-eligible charges" amount={outputs.non_eligible_amount} />
              <MoneyRow label="Eligible claim base" amount={outputs.eligible_claim_base} />
              <MoneyRow label="Employer coordination cap base" amount={outputs.employer_cap_base} />
              <MoneyRow
                label="User out-of-pocket before waivers"
                amount={outputs.user_out_of_pocket}
              />
              <MoneyRow label="Deductible applied" amount={outputs.deductible_applied} />
              <MoneyRow
                label={`Patient cost share (${outputs.patient_cost_share.type.replace(/_/g, " ").toLowerCase()})`}
                amount={outputs.patient_cost_share.amount}
              />
              <MoneyRow label="Limit shortfall" amount={outputs.limit_shortfall} />
              <MoneyRow label="Sub-limit excess" amount={outputs.sub_limit_excess} />
            </dl>
            <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
              <div>
                <p className="text-body-sm font-semibold text-ink">Room &amp; Board</p>
                <p className="mt-1 text-body-sm text-ink-secondary">
                  {outputs.room_and_board
                    ? `${outputs.room_and_board.status}; amounts are not modeled.`
                    : "Not calculated for this scenario."}
                </p>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-ink">Room-upgrade mode</p>
                <p className="mt-1 break-words text-body-sm text-ink-secondary">
                  {outputs.room_upgrade
                    ? `${outputs.room_upgrade.mode} · penalty ${outputs.room_upgrade.penalty.display_myr}`
                    : "Not calculated for this scenario."}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="limits-heading" className="border-t border-line pt-4">
            <h4 id="limits-heading" className="font-semibold text-ink">
              Current-claim limits
            </h4>
            <div className="mt-3">
              <LimitDetail success={result} />
            </div>
            <p className="mt-3 text-caption leading-5 text-ink-muted">
              These values apply to this illustrative claim only; no persistent limit balance is
              calculated or updated.
            </p>
          </section>

          <section aria-labelledby="configuration-heading" className="border-t border-line pt-4">
            <h4 id="configuration-heading" className="font-semibold text-ink">
              Scenario configuration used
            </h4>
            <dl className="mt-2 space-y-2">
              {Object.entries(result.selected_configuration).map(([key, value]) => (
                <div
                  key={key}
                  className="grid min-w-0 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4"
                >
                  <dt className="break-words text-caption text-ink-muted">{key}</dt>
                  <dd className="break-words font-mono text-caption text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="formula-trace-heading" className="border-t border-line pt-4">
            <h4 id="formula-trace-heading" className="font-semibold text-ink">
              Full Engine 2 formula trace
            </h4>
            <ol className="mt-3 space-y-3">
              {result.formula_trace.map((trace, index) => (
                <li
                  key={`${trace.formula_id}-${index}`}
                  className="min-w-0 rounded-xl bg-sunken/60 p-3"
                >
                  <p className="break-words font-semibold text-ink">{trace.formula_id}</p>
                  <p className="mt-1 text-caption text-ink-muted">{trace.stage}</p>
                  <code className="mt-2 block whitespace-pre-wrap break-words text-caption text-ink">
                    {trace.formula}
                  </code>
                  <dl className="mt-2 grid gap-2 sm:grid-cols-2">
                    {(
                      [
                        ["Inputs", trace.inputs],
                        ["Result", trace.result],
                      ] as const
                    ).map(([label, values]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-caption font-semibold text-ink-secondary">{label}</dt>
                        <dd className="mt-1 space-y-1">
                          {Object.entries(values).map(([key, value]) => (
                            <p
                              key={key}
                              className="break-words font-mono text-caption text-ink-muted"
                            >
                              {key}: {value}
                            </p>
                          ))}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ol>
          </section>

          {result.assumptions.length > 0 && (
            <section aria-labelledby="assumptions-heading" className="border-t border-line pt-4">
              <h4 id="assumptions-heading" className="font-semibold text-ink">
                Assumptions recorded by Engine 2
              </h4>
              <ul className="mt-3 space-y-3">
                {result.assumptions.map((assumption) => (
                  <li key={assumption.assumption_id} className="text-body-sm">
                    <p className="break-words font-medium text-ink">
                      {assumption.assumption_id}: {assumption.value} {assumption.unit}
                    </p>
                    <p className="text-ink-secondary">{assumption.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.warnings.length > 0 && (
            <section
              aria-labelledby="warnings-heading"
              className="rounded-xl border border-warning-200 bg-warning-50 p-4"
            >
              <h4 id="warnings-heading" className="font-semibold text-ink">
                Prototype limitations for this result
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-body-sm text-ink-secondary">
                {result.warnings.map((warning, index) => (
                  <li key={`${index}-${warning}`}>{warning}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </details>

      <Card variant="muted" padding="md" className="border-navy-200 bg-navy-50">
        <h3 className="font-semibold text-navy-900">Educational limitation</h3>
        <p className="mt-1 text-body-sm leading-6 text-navy-900">{outputs.disclosure}</p>
      </Card>
    </div>
  );
}
