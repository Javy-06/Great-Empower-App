import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CircleCheck, Info, Pencil, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { TextField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { areaLabels, useProfile, type ProtectionArea } from "@/state/profile";
import { useSession } from "@/account/session";
import { applicationActions, useApplications } from "@/state/application";
import {
  APPLICATION_STEPS,
  basisLabels,
  canComplete,
  coverAmountOptions,
  emptyApplication,
  existingLabels,
  firstIncompleteStep,
  frequencyLabels,
  healthQuestions,
  residencyLabels,
  validateCover,
  validateDeclaration,
  validateDetails,
  validateHealth,
  type ApplicationStepKey,
  type FieldErrors,
  type InsuranceApplication,
} from "@/data/application";

/**
 * Protect → Get cover → Apply, IN GREAT EMPOWER: `#app/protect/apply/<area>/<step>`.
 *   details → cover → health → review → done
 * Every change is saved on this device as a draft, so Back and leaving never lose answers.
 * There is no insurer API: "Complete application" marks it completed IN THE APP. It is never
 * described as submitted, approved or covered, and it gets no reference number.
 */
export const APPLY = "app/protect/apply";
type Step = ApplicationStepKey | "done";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};
const stepHash = (area: ProtectionArea, s: Step) => `${APPLY}/${area}/${s}`;
const AREAS: ProtectionArea[] = ["medical", "critical", "life", "accident"];

export function readApply(segments: string[]): { area?: ProtectionArea; step: Step } {
  const area = AREAS.find((a) => a === segments[0]);
  const s = segments[1];
  const step: Step = s === "cover" || s === "health" || s === "review" || s === "done" ? s : "details";
  return { area, step };
}

export function ApplyFlow({ area, step }: { area: ProtectionArea; step: Step }) {
  const { byArea } = useApplications();
  const profile = useProfile();
  const session = useSession();
  const stored = byArea[area];
  const [app, setApp] = useState<InsuranceApplication>(
    () =>
      stored ??
      emptyApplication(area, {
        fullName: session.kind === "ready" ? session.account.displayName ?? "" : "",
        existing: profile.coverage[area] || "",
      }),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const summaryRef = useRef<HTMLDivElement>(null);

  // A new step starts with no error messages.
  useEffect(() => setErrors({}), [step]);
  // Deleted elsewhere (e.g. from the done screen): start over cleanly.
  useEffect(() => {
    if (!stored && app.updatedAt) setApp(emptyApplication(area));
  }, [stored, app.updatedAt, area]);

  /** Every edit is saved as a draft. Editing a completed application makes it a draft again. */
  const update = (patch: (a: InsuranceApplication) => InsuranceApplication) => {
    setApp((cur) => {
      let next = patch(cur);
      if (cur.status === "completed") next = { ...next, status: "draft", completedAt: undefined, declaration: { truthful: false, understandsNotSent: false } };
      applicationActions.save(next);
      return { ...next, updatedAt: Date.now() };
    });
  };

  const showErrors = (e: FieldErrors) => {
    setErrors(e);
    window.setTimeout(() => summaryRef.current?.focus(), 30);
  };
  const next = (validate: () => FieldErrors, to: Step) => {
    const e = validate();
    if (Object.keys(e).length) return showErrors(e);
    applicationActions.save(app);
    go(stepHash(area, to));
  };

  const shown: Step = step === "done" && app.status !== "completed" ? "review" : step;
  const index = APPLICATION_STEPS.findIndex((s) => s.key === shown);
  const prev: string = index <= 0 ? `app/protect/get-cover/${area}/how` : stepHash(area, APPLICATION_STEPS[index - 1].key);

  if (shown === "done") return <Done app={app} />;

  return (
    <>
      <PageHero
        eyebrow={`Application · ${areaLabels[area]}`}
        title="Your application"
        text="Four short steps, saved on this device as you go. You'll review everything before you finish."
        backLabel="Application"
        onBack={() => go(prev)}
        titleId="apply-title"
      />
      <Container className="max-w-[40rem] pt-5">
        <Progress area={area} index={index} valid={[validateDetails(app.details), validateCover(app.cover), validateHealth(app.health), {}].map((e) => !Object.keys(e).length)} />
        {app.status === "completed" && (
          <p className="mt-4 flex gap-2 rounded-2xl bg-navy-50 p-3 text-body-sm text-navy-950">
            <Info size={18} className="mt-0.5 shrink-0 text-navy-700" aria-hidden />
            <span>You completed this application. Changing an answer turns it back into a draft until you complete it again.</span>
          </p>
        )}
        <ErrorSummary errors={errors} ref={summaryRef} />

        {shown === "details" && (
          <Section title="Your details" lead="As they appear on your MyKad. Saved only on this device, in this account.">
            <TextField className="transition-none" id="fullName" label="Full name" autoComplete="name" value={app.details.fullName} error={errors.fullName} onChange={(e) => update((a) => ({ ...a, details: { ...a.details, fullName: e.target.value } }))} />
            <TextField className="transition-none" id="dateOfBirth" label="Date of birth" type="date" autoComplete="bday" value={app.details.dateOfBirth} error={errors.dateOfBirth} onChange={(e) => update((a) => ({ ...a, details: { ...a.details, dateOfBirth: e.target.value } }))} />
            <Choice
              id="residency"
              legend="Residency"
              value={app.details.residency}
              error={errors.residency}
              options={Object.entries(residencyLabels).map(([v, l]) => ({ v, l }))}
              onChange={(v) => update((a) => ({ ...a, details: { ...a.details, residency: v as InsuranceApplication["details"]["residency"] } }))}
            />
            <TextField className="transition-none" id="occupation" label="Occupation" autoComplete="organization-title" hint="Your main job or what you study." value={app.details.occupation} error={errors.occupation} onChange={(e) => update((a) => ({ ...a, details: { ...a.details, occupation: e.target.value } }))} />
            <TextField className="transition-none" id="mobile" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="012-345 6789" value={app.details.mobile} error={errors.mobile} onChange={(e) => update((a) => ({ ...a, details: { ...a.details, mobile: e.target.value } }))} />
            <TextField className="transition-none" id="email" label="Email" type="email" autoComplete="email" placeholder="name@example.com" value={app.details.email} error={errors.email} onChange={(e) => update((a) => ({ ...a, details: { ...a.details, email: e.target.value } }))} />
            <StepButtons onBack={() => go(prev)} backLabel="Back to how to apply" onNext={() => next(() => validateDetails(app.details), "cover")} />
          </Section>
        )}

        {shown === "cover" && (
          <Section title="Your cover" lead={`What you'd like from ${areaLabels[area].toLowerCase()} cover. These are your preferences, not a quote or a plan.`}>
            <Choice
              id="amount"
              legend={coverAmountOptions[area].label}
              value={app.cover.amount}
              error={errors.amount}
              options={coverAmountOptions[area].options.map((o) => ({ v: o, l: o }))}
              onChange={(v) => update((a) => ({ ...a, cover: { ...a.cover, amount: v } }))}
            />
            <TextField
              className="transition-none"
              id="budget"
              label="What you could spend a month"
              prefix="RM"
              inputMode="numeric"
              hint="An honest, comfortable amount. It doesn't change what any plan costs."
              value={app.cover.budget}
              error={errors.budget}
              onChange={(e) => update((a) => ({ ...a, cover: { ...a.cover, budget: e.target.value.replace(/\D/g, "").slice(0, 5) } }))}
            />
            <Choice id="frequency" legend="How often you'd like to pay" value={app.cover.frequency} error={errors.frequency} options={Object.entries(frequencyLabels).map(([v, l]) => ({ v, l }))} onChange={(v) => update((a) => ({ ...a, cover: { ...a.cover, frequency: v as InsuranceApplication["cover"]["frequency"] } }))} />
            <Choice id="basis" legend="Insurance or takaful" hint="Takaful works on shared contributions and is open to everyone." value={app.cover.basis} error={errors.basis} options={Object.entries(basisLabels).map(([v, l]) => ({ v, l }))} onChange={(v) => update((a) => ({ ...a, cover: { ...a.cover, basis: v as InsuranceApplication["cover"]["basis"] } }))} />
            <Choice
              id="existing"
              legend={`Do you already have ${areaLabels[area].toLowerCase()} cover?`}
              hint={profile.coverage[area] ? "Filled in from your check. Change it if needed." : "Include cover from your employer or parents."}
              value={app.cover.existing}
              error={errors.existing}
              options={Object.entries(existingLabels).map(([v, l]) => ({ v, l }))}
              onChange={(v) => update((a) => ({ ...a, cover: { ...a.cover, existing: v as InsuranceApplication["cover"]["existing"] } }))}
            />
            <StepButtons onBack={() => go(prev)} onNext={() => next(() => validateCover(app.cover), "health")} />
          </Section>
        )}

        {shown === "health" && (
          <Section title="Health questions" lead="Insurers ask questions like these. Answer honestly: leaving something out can mean a claim is refused later.">
            {healthQuestions.map(({ key, q }) => (
              <Choice
                key={key}
                id={key}
                legend={q}
                value={app.health[key]}
                error={errors[key]}
                options={[{ v: "no", l: "No" }, { v: "yes", l: "Yes" }]}
                onChange={(v) => update((a) => ({ ...a, health: { ...a.health, [key]: v as "yes" | "no" } }))}
              />
            ))}
            {Object.values(app.health).includes("yes") && (
              <p className="flex gap-2 rounded-2xl bg-navy-50 p-3 text-body-sm text-navy-950">
                <Info size={18} className="mt-0.5 shrink-0 text-navy-700" aria-hidden />
                <span>Answering Yes is fine. An insurer would usually ask for more detail, and some applications need an adviser&apos;s help.</span>
              </p>
            )}
            <StepButtons onBack={() => go(prev)} onNext={() => next(() => validateHealth(app.health), "review")} nextLabel="Review my application" />
          </Section>
        )}

        {shown === "review" && <Review app={app} area={area} errors={errors} update={update} onComplete={() => {
          const missing = firstIncompleteStep(app);
          if (missing !== "review") return go(stepHash(area, missing));
          const e = validateDeclaration(app.declaration);
          if (Object.keys(e).length) return showErrors(e);
          if (!canComplete(app)) return;
          const done: InsuranceApplication = { ...app, status: "completed", completedAt: Date.now() };
          applicationActions.save(done);
          setApp(done);
          go(stepHash(area, "done"));
        }} onBack={() => go(prev)} />}

        <p className="mt-6 flex gap-2 rounded-2xl bg-gold-50 p-3 text-caption text-navy-950 ring-1 ring-gold-100">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
          <span>
            GREAT EMPOWER can&apos;t send applications to insurers yet. What you fill in here stays on this device. It isn&apos;t a quote, and it doesn&apos;t give you cover.
          </span>
        </p>
      </Container>
    </>
  );
}

function Progress({ area, index, valid }: { area: ProtectionArea; index: number; valid: boolean[] }) {
  const step = APPLICATION_STEPS[index];
  return (
    <nav aria-label="Application steps">
      <p className="text-body-sm font-semibold text-navy-950">
        Step {index + 1} of {APPLICATION_STEPS.length} <span className="font-normal text-ink-muted">· {step.label}</span>
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Application progress" aria-valuemin={1} aria-valuemax={APPLICATION_STEPS.length} aria-valuenow={index + 1}>
        <div className="h-full rounded-full bg-teal-600 transition-[width] duration-300" style={{ width: `${((index + 1) / APPLICATION_STEPS.length) * 100}%` }} />
      </div>
      <ol className="mt-2 hidden grid-cols-4 gap-2 sm:grid">
        {APPLICATION_STEPS.map((s, i) => (
          <li key={s.key}>
            {i < index ? (
              <a href={`#${stepHash(area, s.key)}`} className="inline-flex min-h-11 items-center gap-1.5 text-caption font-semibold text-navy-800 underline-offset-2 hover:underline">
                {valid[i] ? <Check size={14} aria-hidden /> : <AlertCircle size={14} className="text-gold-700" aria-hidden />} {s.label}
                {!valid[i] && <span className="sr-only"> (not finished)</span>}
              </a>
            ) : (
              <span aria-current={i === index ? "step" : undefined} className={cn("inline-flex min-h-11 items-center text-caption font-semibold", i === index ? "text-crimson-600" : "text-ink-muted")}>
                {s.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ErrorSummary({ errors, ref }: { errors: FieldErrors; ref: React.Ref<HTMLDivElement> }) {
  const list = Object.entries(errors);
  if (!list.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="mt-4 rounded-2xl bg-error-50 p-4 text-body-sm text-error-700 ring-1 ring-error-600/30 outline-none focus-visible:ring-2">
      <p className="flex items-center gap-2 font-semibold">
        <AlertCircle size={18} aria-hidden /> {list.length === 1 ? "One answer needs attention" : `${list.length} answers need attention`}
      </p>
      <ul className="mt-1.5 grid list-disc gap-1 pl-6">
        {list.map(([field, msg]) => (
          <li key={field}>
            <a href={`#${field}`} onClick={(e) => { e.preventDefault(); document.getElementById(field)?.focus(); }} className="underline underline-offset-2">{msg}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section aria-labelledby="apply-step-title" className="mt-5">
      <h2 id="apply-step-title" className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">{title}</h2>
      <p className="mt-1 text-body-sm text-ink-secondary">{lead}</p>
      <div className="mt-4 grid gap-5">{children}</div>
    </section>
  );
}

/** A required single choice: a labelled radio group of pill buttons (arrow keys move between them). */
function Choice({ id, legend, hint, value, error, options, onChange }: { id: string; legend: string; hint?: string; value: string; error?: string; options: Array<{ v: string; l: string }>; onChange: (v: string) => void }) {
  const msgId = `${id}-msg`;
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = options[(i + d + options.length) % options.length];
    onChange(n.v);
    document.getElementById(`${id}-${n.v}`)?.focus();
  };
  const focusIndex = Math.max(0, options.findIndex((o) => o.v === value));
  return (
    <div>
      <p id={`${id}-legend`} className="text-body-sm font-semibold text-ink">{legend}</p>
      {hint && !error && <p id={msgId} className="mt-0.5 text-body-sm text-ink-muted">{hint}</p>}
      <div
        id={id}
        tabIndex={-1}
        role="radiogroup"
        aria-labelledby={`${id}-legend`}
        aria-describedby={error || hint ? msgId : undefined}
        aria-invalid={!!error || undefined}
        className={cn("mt-2 flex flex-wrap gap-2 rounded-xl outline-none", error && "ring-2 ring-error-600/40 ring-offset-4")}
      >
        {options.map((o, i) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              id={`${id}-${o.v}`}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={i === focusIndex ? 0 : -1}
              onKeyDown={(e) => onKey(e, i)}
              onClick={() => onChange(o.v)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold transition-colors",
                on ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-line-strong hover:ring-navy-300",
              )}
            >
              {on && <Check size={15} aria-hidden />}
              {o.l}
            </button>
          );
        })}
      </div>
      {error && (
        <p id={msgId} className="mt-2 flex items-center gap-1.5 text-body-sm text-error-700">
          <AlertCircle size={16} aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

function StepButtons({ onBack, onNext, backLabel = "Back", nextLabel = "Continue" }: { onBack: () => void; onNext: () => void; backLabel?: string; nextLabel?: string }) {
  return (
    <div className="mt-1 flex flex-wrap-reverse items-center gap-3">
      <button type="button" onClick={onBack} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
        <ArrowLeft size={16} aria-hidden /> {backLabel}
      </button>
      <button type="button" onClick={onNext} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 px-6 text-body-sm font-bold text-white hover:bg-crimson-700 sm:flex-none">
        {nextLabel} <ArrowRight size={16} aria-hidden />
      </button>
    </div>
  );
}

function Review({ app, area, errors, update, onComplete, onBack }: { app: InsuranceApplication; area: ProtectionArea; errors: FieldErrors; update: (p: (a: InsuranceApplication) => InsuranceApplication) => void; onComplete: () => void; onBack: () => void }) {
  const missing = firstIncompleteStep(app);
  const d = app.details;
  const c = app.cover;
  const dob = d.dateOfBirth ? new Date(`${d.dateOfBirth}T00:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—";
  return (
    <Section title="Review your application" lead="Check everything. Use Edit to change an answer; nothing you've entered is lost.">
      {missing !== "review" && (
        <p className="flex gap-2 rounded-2xl bg-gold-50 p-3 text-body-sm text-navy-950 ring-1 ring-gold-100">
          <Info size={18} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
          <span>
            Some answers are missing.{" "}
            <a href={`#${stepHash(area, missing)}`} className="font-semibold underline underline-offset-2">Finish {APPLICATION_STEPS.find((s) => s.key === missing)!.label.toLowerCase()}</a>
          </span>
        </p>
      )}
      <ReviewBlock title="Your details" edit={stepHash(area, "details")} rows={[
        ["Full name", d.fullName || "—"],
        ["Date of birth", dob],
        ["Residency", d.residency ? residencyLabels[d.residency] : "—"],
        ["Occupation", d.occupation || "—"],
        ["Mobile", d.mobile || "—"],
        ["Email", d.email || "—"],
      ]} />
      <ReviewBlock title="Your cover" edit={stepHash(area, "cover")} rows={[
        ["Kind of cover", areaLabels[area]],
        [coverAmountOptions[area].label, c.amount || "—"],
        ["Monthly budget", c.budget ? `RM ${Number(c.budget).toLocaleString("en-MY")}` : "—"],
        ["Pay", c.frequency ? frequencyLabels[c.frequency] : "—"],
        ["Insurance or takaful", c.basis ? basisLabels[c.basis] : "—"],
        ["Already have this cover", c.existing ? existingLabels[c.existing] : "—"],
      ]} />
      <ReviewBlock title="Health questions" edit={stepHash(area, "health")} rows={healthQuestions.map(({ key, q }) => [q, app.health[key] === "yes" ? "Yes" : app.health[key] === "no" ? "No" : "—"])} />

      <fieldset className="grid gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
        <legend className="sr-only">Declaration</legend>
        <p className="text-body font-semibold text-navy-950">Declaration</p>
        <Tick id="truthful" checked={app.declaration.truthful} error={errors.truthful} onChange={(v) => update((a) => ({ ...a, declaration: { ...a.declaration, truthful: v } }))}>
          My answers are true and complete, to the best of my knowledge.
        </Tick>
        <Tick id="understandsNotSent" checked={app.declaration.understandsNotSent} error={errors.understandsNotSent} onChange={(v) => update((a) => ({ ...a, declaration: { ...a.declaration, understandsNotSent: v } }))}>
          I understand GREAT EMPOWER keeps this application on my device and doesn&apos;t send it to an insurer, so it doesn&apos;t give me cover.
        </Tick>
      </fieldset>
      <StepButtons onBack={onBack} onNext={onComplete} nextLabel="Complete application" />
    </Section>
  );
}

function ReviewBlock({ title, edit, rows }: { title: string; edit: string; rows: Array<[string, string]> }) {
  return (
    <section aria-label={title} className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-body font-semibold text-navy-950">{title}</h3>
        <a href={`#${edit}`} className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
          <Pencil size={14} aria-hidden /> Edit<span className="sr-only"> {title.toLowerCase()}</span>
        </a>
      </div>
      <dl className="mt-1 grid gap-2">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-4">
            <dt className="text-caption text-ink-muted">{k}</dt>
            <dd className={cn("text-body-sm text-navy-950 [overflow-wrap:anywhere]", v === "—" && "text-ink-muted")}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Tick({ id, checked, error, onChange, children }: { id: string; checked: boolean; error?: string; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 text-body-sm text-navy-950">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-[var(--color-navy-900)]"
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-msg`} className="ml-8 flex items-center gap-1.5 text-body-sm text-error-700">
          <AlertCircle size={16} aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

function Done({ app }: { app: InsuranceApplication }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const area = app.area;
  const when = app.completedAt ? new Date(app.completedAt).toLocaleString("en-MY", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  return (
    <>
      <PageHero eyebrow={`Application · ${areaLabels[area]}`} title="Application completed in GREAT EMPOWER." text="Saved on this device. Here's exactly what that means." backLabel="Application" onBack={() => go("app/protect")} titleId="apply-done-title" />
      <Container className="max-w-[40rem] pt-5">
        <section aria-labelledby="status-title" className="rounded-2xl bg-surface p-5 shadow-e1 ring-1 ring-ink/[0.06]">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700"><CircleCheck size={26} aria-hidden /></span>
            <div className="min-w-0">
              <h2 id="status-title" className="text-subheading text-navy-950">{areaLabels[area]} application</h2>
              <p className="text-body-sm text-ink-secondary">Completed {when}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 border-t border-ink/10 pt-3 text-body-sm">
            <div className="flex justify-between gap-3"><dt className="text-ink-secondary">In GREAT EMPOWER</dt><dd className="font-semibold text-success-700">Completed</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Sent to an insurer</dt><dd className="font-semibold text-navy-950">No</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-ink-secondary">Cover</dt><dd className="font-semibold text-navy-950">None yet</dd></div>
          </dl>
        </section>

        <section aria-labelledby="means-title" className="mt-5">
          <h2 id="means-title" className="font-brand text-[1.5rem] font-semibold leading-tight text-navy-950">What this means</h2>
          <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-body-sm text-navy-950 marker:text-navy-300">
            <li>Your application is complete and saved on this device. Nothing has been sent to an insurer, an adviser or GREAT EMPOWER&apos;s servers.</li>
            <li>No insurer has reviewed it, so nothing is approved and you don&apos;t have cover from it.</li>
            <li>GREAT EMPOWER can&apos;t send applications to insurers yet. To be covered, an insurer or takaful operator has to accept an application made with them.</li>
          </ul>
        </section>

        <section aria-labelledby="next-title-apply" className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
          <h2 id="next-title-apply" className="font-brand text-[1.5rem] font-semibold leading-tight">What you can do next</h2>
          <p className="mt-1 text-body-sm text-white/75">An adviser can take you through applying with an insurer. Your answers here make a ready-made summary for that conversation.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => go(`app/protect/get-cover/${area}/adviser`)} className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-white px-4 text-left text-body-sm font-semibold text-navy-950">
              <span className="inline-flex items-center gap-2"><UserRound size={17} aria-hidden /> Get Adviser Guidance</span> <ArrowRight size={16} aria-hidden />
            </button>
            <button type="button" onClick={() => go(stepHash(area, "review"))} className="flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 text-left text-body-sm font-semibold text-white ring-1 ring-white/30">
              <span className="inline-flex items-center gap-2"><Pencil size={17} aria-hidden /> View or edit answers</span> <ArrowRight size={16} aria-hidden />
            </button>
          </div>
          <button type="button" onClick={() => go("app/protect")} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-white/90">
            Back to my protection <ArrowRight size={15} aria-hidden />
          </button>
        </section>

        <div className="mt-5">
          {confirmDelete ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-error-50 p-4 ring-1 ring-error-600/30" role="group" aria-label="Confirm delete">
              <p className="w-full text-body-sm text-error-700">Delete this application from this device? This can&apos;t be undone.</p>
              <button type="button" onClick={() => { applicationActions.remove(area); go("app/protect/get-cover"); }} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-error-700 px-4 text-body-sm font-bold text-white">
                <Trash2 size={15} aria-hidden /> Delete application
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="inline-flex h-11 items-center rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">Keep it</button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-error-700">
              <Trash2 size={15} aria-hidden /> Delete this application
            </button>
          )}
        </div>
      </Container>
    </>
  );
}
