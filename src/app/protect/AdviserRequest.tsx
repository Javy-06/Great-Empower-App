import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CircleCheck,
  ClipboardCheck,
  ClipboardCopy,
  ExternalLink,
  Info,
  MessageCircle,
  Minus,
  Pencil,
  Phone,
  ShieldAlert,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { TextField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { useSession } from "@/account/session";
import { areaLabels, type ProtectionArea } from "@/state/profile";
import { adviserRequestActions, adviserRequestStore, useAdviserRequests } from "@/state/adviserRequest";
import {
  ADVISER_REQUEST_STEPS,
  ELIGIBILITY_NOTE,
  MINOR_SOURCES,
  ageGuidance,
  canSaveAdviserRequest,
  contactMethodLabels,
  contactTimeLabels,
  emptyAdviserRequest,
  firstIncompleteAdviserStep,
  isMinor,
  readAge,
  relationshipLabels,
  requestSummary,
  toSavedRequest,
  validateAdviserContact,
  validateAdviserDetails,
  validateAdviserReview,
  type AdviserRequestDraft,
  type AdviserRequestStep,
  type AgeBand,
  type SavedAdviserRequest,
} from "@/data/adviserRequest";
import type { FieldErrors } from "@/data/application";
import { adviserCallBack, CHANNELS_CHECKED_ON } from "@/data/applyChannels";
import { ADVISER_PHOTO } from "./ProtectSections";
import { Choice, ErrorSummary, StepButtons, Tick } from "./ApplyFlow";

/**
 * Protect → Talk to an adviser: `#app/protect/adviser/<step>`.
 *   (start) → details → guidance → contact → review → done
 * Age comes from the date of birth. Under 18 becomes a parent/guardian-assisted request.
 * There is no adviser backend: a request is SAVED ON THIS DEVICE (a demo request). It is never
 * described as sent, received, booked or contacted, and it has no reference number.
 */
export const ADVISER = "app/protect/adviser";
type Step = "start" | AdviserRequestStep | "done";
const AREAS: ProtectionArea[] = ["medical", "critical", "life", "accident"];

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};
const stepHash = (s: Step) => (s === "start" ? ADVISER : `${ADVISER}/${s}`);

export function readAdviserStep(segment?: string): Step {
  return segment === "details" || segment === "guidance" || segment === "contact" || segment === "review" || segment === "done" ? segment : "start";
}

/** Open the request, with the kind of cover the user came from already ticked. */
export function startAdviserRequest(area?: ProtectionArea) {
  const cur = adviserRequestStore.get();
  if (area && !cur.draft.topics.includes(area)) adviserRequestActions.setDraft({ ...cur.draft, topics: [...cur.draft.topics, area] });
  go(ADVISER);
}

/** The one honest line under every adviser screen. */
function DemoNotice() {
  return (
    <p className="mt-6 flex gap-2 rounded-2xl bg-gold-50 p-3 text-caption text-navy-950 ring-1 ring-gold-100">
      <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
      <span>
        Demo request. GREAT EMPOWER isn&apos;t connected to any adviser or insurer, so this request is saved on this device only and
        isn&apos;t sent to anyone. Nobody will contact you because of it.
      </span>
    </p>
  );
}

export function AdviserRequest({ segment }: { segment?: string }) {
  const step = readAdviserStep(segment);
  const { draft: stored, saved } = useAdviserRequests();
  const session = useSession();
  const [draft, setDraft] = useState<AdviserRequestDraft>(() =>
    stored.fullName || stored.dateOfBirth ? stored : { ...stored, fullName: stored.fullName || (session.kind === "ready" ? session.account.displayName ?? "" : "") },
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => setErrors({}), [step]);
  // Topics added from elsewhere (startAdviserRequest) while this screen is mounted.
  useEffect(() => setDraft((d) => (d.topics.join() === stored.topics.join() ? d : { ...d, topics: stored.topics })), [stored.topics]);

  const update = (patch: Partial<AdviserRequestDraft>) =>
    setDraft((cur) => {
      const next = { ...cur, ...patch };
      adviserRequestActions.setDraft(next);
      return next;
    });
  const showErrors = (e: FieldErrors) => {
    setErrors(e);
    window.setTimeout(() => summaryRef.current?.focus(), 30);
  };
  const next = (e: FieldErrors, to: Step) => {
    if (Object.keys(e).length) return showErrors(e);
    adviserRequestActions.setDraft(draft);
    go(stepHash(to));
  };

  const age = readAge(draft.dateOfBirth);
  const minor = isMinor(age?.band);
  // Later steps need a valid date of birth: without one, show the details step.
  const detailsOk = !Object.keys(validateAdviserDetails(draft)).length;
  const shown: Step = step === "done" ? (saved.length ? "done" : "start") : step !== "start" && step !== "details" && !detailsOk ? "details" : step;

  // The saved draft (not the name prefilled from the account) decides "Start" vs "Continue".
  if (shown === "start") return <Start draft={stored} saved={saved} />;
  if (shown === "done") return <Done request={saved[0]} />;

  const index = ADVISER_REQUEST_STEPS.findIndex((s) => s.key === shown);
  const prev = index <= 0 ? ADVISER : stepHash(ADVISER_REQUEST_STEPS[index - 1].key);

  return (
    <>
      <PageHero
        eyebrow={minor ? "Talk to an adviser · Parent or guardian assisted" : "Talk to an adviser"}
        title="Your adviser request"
        text="Four short steps. Saved on this device as you go, and you review everything at the end."
        backLabel="Adviser request"
        onBack={() => go(prev)}
        titleId="adviser-title"
      />
      <Container className="max-w-[40rem] pt-5">
        <Stepper index={index} />
        <ErrorSummary errors={errors} ref={summaryRef} />

        {shown === "details" && (
          <Section title="Personal details" lead="Who would the cover be for? If it's for your child, enter your child's details here.">
            <TextField className="transition-none" id="fullName" label="Full name" autoComplete="name" value={draft.fullName} error={errors.fullName} onChange={(e) => update({ fullName: e.target.value })} />
            <div>
              <TextField
                className="transition-none"
                id="dateOfBirth"
                label="Date of birth"
                type="date"
                autoComplete="bday"
                hint="We work out the age from this. You don't need to say whether you're an adult."
                value={draft.dateOfBirth}
                error={errors.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })}
              />
              {age && <AgeChip age={age.age} band={age.band} />}
            </div>
            <TopicPicker value={draft.topics} onChange={(topics) => update({ topics })} />
            <StepButtons onBack={() => go(ADVISER)} onNext={() => next(validateAdviserDetails(draft), "guidance")} />
          </Section>
        )}

        {shown === "guidance" && age && (
          <Section title={minor ? "A parent or guardian may need to help" : "You're good to go"} lead={`Based on the date of birth: age ${age.age}.`}>
            <AgeGuidance band={age.band} />
            <StepButtons onBack={() => go(prev)} onNext={() => go(stepHash("contact"))} nextLabel={minor ? "Add parent or guardian" : "Continue"} />
          </Section>
        )}

        {shown === "contact" && (
          <Section
            title="Contact preferences"
            lead={minor ? "The parent or guardian is the contact for this request. We don't ask for the child's own phone or email." : "How an adviser could reach you, if you take this request to one."}
          >
            {minor ? (
              <>
                <TextField className="transition-none" id="guardianName" label="Parent or guardian's full name" autoComplete="name" value={draft.guardianName} error={errors.guardianName} onChange={(e) => update({ guardianName: e.target.value })} />
                <Choice
                  id="relationship"
                  legend={`Relationship to ${draft.fullName.trim().split(" ")[0] || "the child"}`}
                  value={draft.relationship}
                  error={errors.relationship}
                  options={Object.entries(relationshipLabels).map(([v, l]) => ({ v, l }))}
                  onChange={(v) => update({ relationship: v as AdviserRequestDraft["relationship"] })}
                />
                <TextField className="transition-none" id="guardianPhone" label="Parent or guardian's mobile" type="tel" inputMode="tel" autoComplete="tel" placeholder="012-345 6789" value={draft.guardianPhone} error={errors.guardianPhone} onChange={(e) => update({ guardianPhone: e.target.value })} />
                <TextField className="transition-none" id="guardianEmail" label="Parent or guardian's email" type="email" autoComplete="email" placeholder="name@example.com" value={draft.guardianEmail} error={errors.guardianEmail} onChange={(e) => update({ guardianEmail: e.target.value })} />
              </>
            ) : (
              <>
                <TextField className="transition-none" id="phone" label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="012-345 6789" value={draft.phone} error={errors.phone} onChange={(e) => update({ phone: e.target.value })} />
                <TextField className="transition-none" id="email" label="Email" type="email" autoComplete="email" placeholder="name@example.com" value={draft.email} error={errors.email} onChange={(e) => update({ email: e.target.value })} />
              </>
            )}
            <Choice id="method" legend="Preferred way to be contacted" value={draft.method} error={errors.method} options={Object.entries(contactMethodLabels).map(([v, l]) => ({ v, l }))} onChange={(v) => update({ method: v as AdviserRequestDraft["method"] })} />
            <Choice
              id="time"
              legend="Best time (optional)"
              value={draft.time}
              options={[{ v: "", l: "Any time" }, ...Object.entries(contactTimeLabels).map(([v, l]) => ({ v, l }))]}
              onChange={(v) => update({ time: v as AdviserRequestDraft["time"] })}
            />
            {minor && (
              <div className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
                <Tick id="guardianConsent" checked={draft.guardianConsent} error={errors.guardianConsent} onChange={(v) => update({ guardianConsent: v })}>
                  The parent or guardian named here knows about this request and agrees to be the contact for it.
                </Tick>
                <p className="ml-8 mt-1 text-caption text-ink-muted">This isn&apos;t legal consent to a policy. An insurer asks for that itself, if a plan needs it.</p>
              </div>
            )}
            <StepButtons onBack={() => go(prev)} onNext={() => next(validateAdviserContact(draft), "review")} nextLabel="Review my request" />
          </Section>
        )}

        {shown === "review" && (
          <Review
            draft={draft}
            band={age?.band ?? "adult"}
            errors={errors}
            onTick={(v) => update({ understandsDemo: v })}
            onBack={() => go(prev)}
            onSave={() => {
              const missing = firstIncompleteAdviserStep(draft);
              if (missing !== "review") return go(stepHash(missing));
              const e = validateAdviserReview(draft);
              if (Object.keys(e).length) return showErrors(e);
              if (!canSaveAdviserRequest(draft)) return;
              adviserRequestActions.save(toSavedRequest(draft));
              setDraft(emptyAdviserRequest());
              go(stepHash("done"));
            }}
          />
        )}
        <DemoNotice />
      </Container>
    </>
  );
}

/* ================================================================================ pieces */

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <section aria-labelledby="adviser-step-title" className="mt-5">
      <h2 id="adviser-step-title" className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">{title}</h2>
      <p className="mt-1 text-body-sm text-ink-secondary">{lead}</p>
      <div className="mt-4 grid gap-5">{children}</div>
    </section>
  );
}

const stepIcons = [UserRound, Users, Phone, ClipboardCheck];

function Stepper({ index }: { index: number }) {
  const step = ADVISER_REQUEST_STEPS[index];
  return (
    <nav aria-label="Adviser request steps">
      <p className="text-body-sm font-semibold text-navy-950">
        Step {index + 1} of {ADVISER_REQUEST_STEPS.length} <span className="font-normal text-ink-muted">· {step.label}</span>
      </p>
      <ol className="relative mt-3 grid grid-cols-4">
        <span className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 bg-sunken" aria-hidden />
        <span className="absolute left-[12.5%] top-5 h-0.5 bg-teal-600 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(index / (ADVISER_REQUEST_STEPS.length - 1)) * 75}%` }} aria-hidden />
        {ADVISER_REQUEST_STEPS.map((s, i) => {
          const Icon = stepIcons[i];
          const past = i < index;
          const node = (
            <>
              <span className={cn("relative inline-flex size-10 items-center justify-center rounded-full ring-4 ring-canvas", i === index ? "bg-crimson-600 text-white" : past ? "bg-teal-600 text-white" : "bg-surface text-ink-muted [box-shadow:inset_0_0_0_1.5px_var(--color-line-strong)]")}>
                {past ? <Check size={18} strokeWidth={2.5} aria-hidden /> : <Icon size={18} aria-hidden />}
              </span>
              <span className={cn("mt-1.5 text-caption font-semibold", i === index ? "text-crimson-600" : past ? "text-navy-800" : "text-ink-muted")}>
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
            </>
          );
          return (
            <li key={s.key} className="relative flex flex-col items-center text-center">
              {past ? (
                <a href={`#${stepHash(s.key)}`} className="flex min-h-11 flex-col items-center rounded-xl outline-offset-2">{node}</a>
              ) : (
                <span aria-current={i === index ? "step" : undefined} className="flex flex-col items-center">{node}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function AgeChip({ age, band }: { age: number; band: AgeBand }) {
  const minor = isMinor(band);
  return (
    <p role="status" className={cn("mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-body-sm font-semibold", minor ? "bg-gold-50 text-navy-950 ring-1 ring-gold-100" : "bg-teal-50 text-teal-800")}>
      {minor ? <Users size={16} className="text-gold-700" aria-hidden /> : <BadgeCheck size={16} aria-hidden />}
      Age {age} · {minor ? "a parent or guardian will be added" : "your own request"}
    </p>
  );
}

function TopicPicker({ value, onChange }: { value: ProtectionArea[]; onChange: (v: ProtectionArea[]) => void }) {
  return (
    <fieldset>
      <legend className="text-body-sm font-semibold text-ink">What would you like to talk about? <span className="font-normal text-ink-muted">(optional)</span></legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {AREAS.map((a) => {
          const on = value.includes(a);
          return (
            <button
              key={a}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== a) : [...value, a])}
              className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold transition-colors", on ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-line-strong hover:ring-navy-300")}
            >
              {on && <Check size={15} aria-hidden />}
              {areaLabels[a]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** The age result, said once and plainly, with a "who decides" strip so the app never looks like the authority. */
function AgeGuidance({ band }: { band: AgeBand }) {
  const g = ageGuidance[band];
  const minor = isMinor(band);
  const who = minor
    ? [
        { icon: UserRound, label: "Child", text: "Cover is for them" },
        { icon: Users, label: "Parent or guardian", text: "Takes part" },
        { icon: MessageCircle, label: "Adviser", text: "Explains plans" },
        { icon: Building2, label: "Insurer", text: "Confirms the rules" },
      ]
    : [
        { icon: UserRound, label: "You", text: "Ask for help" },
        { icon: MessageCircle, label: "Adviser", text: "Explains plans" },
        { icon: Building2, label: "Insurer", text: "Confirms the rules" },
      ];
  return (
    <>
      <div className={cn("rounded-2xl p-5", minor ? "bg-navy-950 text-white" : "bg-teal-50 ring-1 ring-teal-100")}>
        <span className={cn("inline-flex size-12 items-center justify-center rounded-2xl", minor ? "bg-gold-500 text-navy-950" : "bg-teal-600 text-white")}>
          {minor ? <Users size={24} aria-hidden /> : <CircleCheck size={24} aria-hidden />}
        </span>
        <p className={cn("mt-3 font-brand text-[1.5rem] font-semibold leading-tight", minor ? "text-white" : "text-navy-950")}>{g.headline}</p>
        <ul className="mt-3 grid gap-2">
          {g.points.map((p) => (
            <li key={p} className={cn("flex gap-2 text-body-sm", minor ? "text-white/85" : "text-navy-950")}>
              <Check size={16} className={cn("mt-0.5 shrink-0", minor ? "text-gold-300" : "text-teal-700")} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>

      <figure aria-label="Who is involved">
        <figcaption className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">Who is involved</figcaption>
        <ol className={cn("mt-2 grid gap-2", minor ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
          {who.map(({ icon: Icon, label, text }, i) => (
            <li key={label} className={cn("flex flex-col items-center gap-1 rounded-2xl p-3 text-center", i === who.length - 1 ? "bg-navy-50" : "bg-surface ring-1 ring-ink/[0.07]")}>
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-navy-900 text-white"><Icon size={18} aria-hidden /></span>
              <span className="text-body-sm font-semibold text-navy-950">{label}</span>
              <span className="text-caption text-ink-muted">{text}</span>
            </li>
          ))}
        </ol>
      </figure>

      <p className="flex gap-2 rounded-2xl bg-surface p-4 text-body-sm text-navy-950 ring-1 ring-ink/[0.08]">
        <Info size={18} className="mt-0.5 shrink-0 text-navy-700" aria-hidden />
        <span>
          {ELIGIBILITY_NOTE} GREAT EMPOWER doesn&apos;t decide who can buy a plan: the adviser and insurer confirm eligibility, who owns the policy, and any consent needed.
        </span>
      </p>

      {minor && (
        <details className="group rounded-2xl bg-surface ring-1 ring-ink/[0.08]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-body-sm font-semibold text-navy-900">
            Where this comes from
            <ArrowRight size={16} className="rotate-90 transition-transform group-open:-rotate-90" aria-hidden />
          </summary>
          <ul className="grid gap-2 px-4 pb-4">
            {MINOR_SOURCES.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-caption font-semibold text-navy-800 underline underline-offset-2">
                  <ExternalLink size={12} className="mt-0.5 shrink-0" aria-hidden />
                  <span>{s.label}<span className="sr-only"> (opens in a new tab)</span></span>
                </a>
              </li>
            ))}
            <li className="text-caption text-ink-muted">Read 28 Nov 2026. Rules in one plan don&apos;t apply to every plan.</li>
          </ul>
        </details>
      )}
    </>
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
          <div key={k} className="grid gap-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-4">
            <dt className="text-caption text-ink-muted">{k}</dt>
            <dd className={cn("text-body-sm text-navy-950 [overflow-wrap:anywhere]", v === "—" && "text-ink-muted")}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const fmtDob = (d: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) : "—");

function Review({ draft: d, band, errors, onTick, onBack, onSave }: { draft: AdviserRequestDraft; band: AgeBand; errors: FieldErrors; onTick: (v: boolean) => void; onBack: () => void; onSave: () => void }) {
  const minor = isMinor(band);
  const missing = firstIncompleteAdviserStep(d);
  return (
    <Section title="Review your request" lead="Check everything. Use Edit to change an answer.">
      {missing !== "review" && (
        <p className="flex gap-2 rounded-2xl bg-gold-50 p-3 text-body-sm text-navy-950 ring-1 ring-gold-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
          <span>
            Some answers are missing. <a href={`#${stepHash(missing)}`} className="font-semibold underline underline-offset-2">Finish {ADVISER_REQUEST_STEPS.find((s) => s.key === missing)!.label.toLowerCase()}</a>
          </span>
        </p>
      )}
      <ReviewBlock
        title="Personal details"
        edit={stepHash("details")}
        rows={[
          ["Full name", d.fullName || "—"],
          ["Date of birth", fmtDob(d.dateOfBirth)],
          ["Request type", minor ? "Parent or guardian assisted (under 18)" : "Your own request"],
          ["Topics", d.topics.length ? d.topics.map((t) => areaLabels[t]).join(", ") : "Not sure yet"],
        ]}
      />
      <ReviewBlock
        title={minor ? "Parent or guardian, and contact" : "Contact preferences"}
        edit={stepHash("contact")}
        rows={[
          ...(minor
            ? ([
                ["Parent or guardian", d.guardianName || "—"],
                ["Relationship", d.relationship ? relationshipLabels[d.relationship] : "—"],
                ["Mobile", d.guardianPhone || "—"],
                ["Email", d.guardianEmail || "—"],
                ["Knows about this request", d.guardianConsent ? "Yes" : "—"],
              ] as Array<[string, string]>)
            : ([
                ["Mobile", d.phone || "—"],
                ["Email", d.email || "—"],
              ] as Array<[string, string]>)),
          ["Contact by", d.method ? contactMethodLabels[d.method] : "—"],
          ["Best time", d.time ? contactTimeLabels[d.time] : "Any time"],
        ]}
      />
      <div className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
        <Tick id="understandsDemo" checked={d.understandsDemo} error={errors.understandsDemo} onChange={onTick}>
          I understand this is a demo request: it&apos;s saved on this device and isn&apos;t sent to an adviser or insurer.
        </Tick>
      </div>
      <StepButtons onBack={onBack} onNext={onSave} nextLabel="Save adviser request" />
    </Section>
  );
}

/* ================================================================================ start */

function Start({ draft, saved }: { draft: AdviserRequestDraft; saved: SavedAdviserRequest[] }) {
  const started = Boolean(draft.fullName || draft.dateOfBirth || draft.phone || draft.guardianName);
  const resume = started ? firstIncompleteAdviserStep(draft) : "details";
  return (
    <>
      <PageHero
        eyebrow="Protect · Talk to an adviser"
        title="Talk to an adviser."
        text="Tell us who the cover is for and how you'd like to be reached. You'll get a ready-made request to take to a licensed adviser."
        image={ADVISER_PHOTO.src}
        imagePosition="71% 22%"
        backLabel="Adviser"
        onBack={() => go("app/protect")}
        titleId="adviser-start-title"
      />
      <Container className="relative -mt-5 max-w-[44rem]">
        <section aria-labelledby="adviser-how" className="rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/[0.06] sm:p-5">
          <h2 id="adviser-how" className="font-brand text-[1.625rem] font-semibold text-navy-950">How it works</h2>
          <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: UserRound, label: "Your details", text: "Name and date of birth" },
              { icon: Users, label: "Age check", text: "Under 18? A guardian joins" },
              { icon: Phone, label: "Contact", text: "How and when" },
              { icon: ClipboardCheck, label: "Review", text: "Then save it" },
            ].map(({ icon: Icon, label, text }, i) => (
              <li key={label} className="flex flex-col gap-2 rounded-2xl bg-sunken/60 p-3">
                <span className="relative inline-flex size-10 items-center justify-center rounded-full bg-navy-900 text-white">
                  <Icon size={18} aria-hidden />
                  <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-crimson-600 text-[12px] font-bold">{i + 1}</span>
                </span>
                <span>
                  <span className="block text-body-sm font-semibold text-navy-950">{label}</span>
                  <span className="block text-caption text-ink-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-caption text-ink-muted">About two minutes. We only ask what an adviser needs to get in touch: no health or money questions.</p>
          <button type="button" onClick={() => go(stepHash(resume))} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 px-6 text-body-sm font-bold text-white hover:bg-crimson-700 sm:w-auto">
            {started ? "Continue my request" : "Start my request"} <ArrowRight size={16} aria-hidden />
          </button>
        </section>

        {saved.length > 0 && (
          <section aria-labelledby="saved-requests" className="mt-5">
            <h2 id="saved-requests" className="text-body font-semibold text-navy-950">Saved on this device</h2>
            <ul className="mt-2 grid gap-2">
              {saved.map((r) => (
                <li key={r.savedAt} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/[0.08]">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800">{isMinor(r.band) ? <Users size={18} aria-hidden /> : <UserRound size={18} aria-hidden />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-semibold text-navy-950">{r.fullName}</span>
                    <span className="block text-caption text-ink-muted">
                      Saved {new Date(r.savedAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })} · {isMinor(r.band) ? "Guardian assisted" : "Own request"} · Not sent
                    </span>
                  </span>
                  <button type="button" onClick={() => adviserRequestActions.remove(r.savedAt)} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-error-700 hover:bg-error-50" aria-label={`Delete the request for ${r.fullName}`}>
                    <Trash2 size={17} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <a href={`#app/protect/get-cover/${draft.topics[0] ?? "medical"}/adviser`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-navy-800 underline underline-offset-2">
          First, see what to ask an adviser
        </a>
        <DemoNotice />
      </Container>
    </>
  );
}

/* ================================================================================ done */

function Done({ request: r }: { request: SavedAdviserRequest }) {
  const minor = isMinor(r.band);
  const [copied, setCopied] = useState<"" | "ok" | "fail">("");
  const summary = requestSummary(r, (a) => areaLabels[a]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
  };
  return (
    <>
      <PageHero eyebrow="Talk to an adviser" title="Adviser request saved." text="Saved on this device as a demo request. Here's exactly what that means." backLabel="Adviser" onBack={() => go("app/protect")} titleId="adviser-done-title" />
      <Container className="max-w-[40rem] pt-5">
        <section aria-labelledby="adviser-status" className="rounded-2xl bg-surface p-5 shadow-e1 ring-1 ring-ink/[0.06]">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700"><CircleCheck size={26} aria-hidden /></span>
            <div className="min-w-0">
              <h2 id="adviser-status" className="text-subheading text-navy-950">Request for {r.fullName}</h2>
              <p className="text-body-sm text-ink-secondary">{minor ? `Parent or guardian assisted · contact: ${r.guardianName}` : "Your own request"}</p>
            </div>
          </div>
          <div className="relative mt-4 border-t border-ink/10 pt-4">
            <span className="absolute left-[16.7%] right-[16.7%] top-9 h-0.5 bg-sunken" aria-hidden />
            <dl className="relative grid grid-cols-3 text-center">
              {[
                { k: "On this device", v: "Saved", done: true },
                { k: "Sent to an adviser", v: "No", done: false },
                { k: "Contact arranged", v: "No", done: false },
              ].map((x) => (
                <div key={x.k} className="flex flex-col items-center gap-1">
                  <dt className="flex flex-col items-center gap-1.5 text-caption text-ink-secondary">
                    <span className={cn("inline-flex size-10 items-center justify-center rounded-full ring-4 ring-surface", x.done ? "bg-success-600 text-white" : "bg-sunken text-ink-muted")} aria-hidden>
                      {x.done ? <Check size={18} strokeWidth={2.5} /> : <Minus size={18} strokeWidth={2.5} />}
                    </span>
                    {x.k}
                  </dt>
                  <dd className={cn("text-body-sm font-semibold", x.done ? "text-success-700" : "text-navy-950")}>{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="adviser-next" className="mt-5 rounded-2xl bg-navy-950 p-5 text-white">
          <h2 id="adviser-next" className="font-brand text-[1.5rem] font-semibold leading-tight">To actually reach an adviser</h2>
          <ol className="mt-3 grid gap-3">
            {[
              { n: 1, t: "Copy your request", d: "A short summary of what you entered." },
              { n: 2, t: minor ? "The parent or guardian contacts an insurer" : "Contact an insurer's official channel", d: "Paste it in, or read it out on the call." },
              { n: 3, t: "The adviser confirms the details", d: minor ? "Including who can own the policy and any consent needed." : "Including which plans you're eligible for." },
            ].map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-caption font-bold">{s.n}</span>
                <span>
                  <span className="block text-body-sm font-semibold">{s.t}</span>
                  <span className="block text-caption text-white/75">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={copy} className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-white px-4 text-left text-body-sm font-semibold text-navy-950">
              <span className="inline-flex items-center gap-2"><ClipboardCopy size={17} aria-hidden /> Copy my request</span>
            </button>
            <a href={adviserCallBack.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 text-left text-body-sm font-semibold text-white ring-1 ring-white/30">
              <span>Official call-back page</span> <ExternalLink size={16} aria-hidden />
              <span className="sr-only"> (leaves GREAT EMPOWER, opens in a new tab)</span>
            </a>
          </div>
          <p role="status" className="mt-2 min-h-5 text-caption text-white/80">
            {copied === "ok" ? "Copied. Nothing was sent." : copied === "fail" ? "Couldn't copy here. Select the text below instead." : ""}
          </p>
          {copied === "fail" && <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-white/10 p-3 text-caption text-white">{summary}</pre>}
          <p className="mt-1 text-caption text-white/70">
            Example of an official channel, checked {CHANNELS_CHECKED_ON}: {adviserCallBack.label}. GREAT EMPOWER isn&apos;t affiliated with Great Eastern and sends nothing for you.
          </p>
        </section>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => go("app/protect")} className="inline-flex h-12 items-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white hover:bg-crimson-700">
            Back to my protection <ArrowRight size={16} aria-hidden />
          </button>
          <button type="button" onClick={() => go(ADVISER)} className="inline-flex h-12 items-center rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
            See saved requests
          </button>
        </div>
        <DemoNotice />
      </Container>
    </>
  );
}
