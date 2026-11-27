import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  ExternalLink,
  Info,
  UserRound,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { GeIcon } from "@/components/illustrations/GeIcons";
import { cn } from "@/lib/cn";
import { areaLabels, useProfile, type ProtectionArea } from "@/state/profile";
import { useApplications } from "@/state/application";
import { APPLY } from "./ApplyFlow";
import { firstIncompleteStep } from "@/data/application";
import { useStore } from "@/state/store";
import { findProtectionCategory } from "@/data/protection";
import { readinessChecklist } from "@/data/guides";
import { checklistStore } from "@/state/checklist";
import { adviserCallBack, areaToSlug, CHANNELS_CHECKED_ON } from "@/data/applyChannels";
import { protectAreas } from "./ProtectCheck";

/**
 * Protect → Get cover (`#app/protect/get-cover/…`): choose a kind of cover → understand it → get
 * ready → apply IN GREAT EMPOWER (`#app/protect/apply/…`, see ApplyFlow) or get an adviser's help.
 * The application stays in the app; there is no insurer API, so it is never "submitted".
 *
 *   get-cover                    pick a kind of cover
 *   get-cover/<area>             1 Understand  (optional simulator, skippable)
 *   get-cover/<area>/ready       2 Get ready   (shared readiness checklist)
 *   get-cover/<area>/how         3 Apply: start the in-app application, or adviser guidance
 *   get-cover/<area>/online      old link: forwards to the in-app application
 *   get-cover/<area>/adviser     adviser guidance (a separate assistance path)
 */
export const GET_COVER = "app/protect/get-cover";
const AREAS: ProtectionArea[] = ["medical", "critical", "life", "accident"];
type Step = "understand" | "ready" | "how" | "online" | "adviser";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

export function readGetCover(segments: string[]): { area?: ProtectionArea; step: Step } {
  const area = AREAS.find((a) => a === segments[0]);
  const s = segments[1];
  const step: Step = s === "ready" || s === "how" || s === "online" || s === "adviser" ? s : "understand";
  return { area, step };
}

export function GetCover({ segments }: { segments: string[] }) {
  const { area, step } = readGetCover(segments);
  if (!area) return <ChooseCover />;
  if (step === "online") return <ForwardToApply area={area} />;
  if (step === "adviser") return <AdviserHandoff area={area} />;
  return <CoverSteps area={area} step={step} />;
}

/** One line under every Get cover page: the independence notice, said once and plainly. */
function Independence() {
  return (
    <p className="mt-6 flex gap-2 rounded-2xl bg-gold-50 p-3 text-caption text-navy-950 ring-1 ring-gold-100">
      <Info size={16} className="mt-0.5 shrink-0 text-gold-700" aria-hidden />
      <span>
        GREAT EMPOWER is independent and doesn&apos;t sell insurance. Applications you complete here stay on your device and aren&apos;t sent
        to an insurer yet, so they don&apos;t give you cover. Only an insurer or takaful operator can accept an application.
      </span>
    </p>
  );
}

/* =========================================================================== choose */

function ChooseCover() {
  const p = useProfile();
  const { byArea } = useApplications();
  const note = (a: ProtectionArea) =>
    byArea[a]?.status === "completed"
      ? "Application completed in the app"
      : byArea[a]
        ? "Application draft saved"
        : p.coverage[a] === "yes"
          ? "You said you have this"
          : p.coverage[a] === "no" && p.priorities.includes(a)
            ? "A priority with no cover yet"
            : null;
  return (
    <>
      <PageHero
        eyebrow="Protect · Get cover"
        title="Explore cover and how to apply."
        text="Pick a kind of cover. We'll explain it, help you get ready, then you can apply right here or get an adviser's help."
        image="/images/pexels/young-professional-savings-planning.webp"
        imagePosition="40% 30%"
        backLabel="Get cover"
        onBack={() => go("app/protect")}
        titleId="get-cover-title"
      />
      <Container className="relative -mt-5 max-w-[48rem]">
        <section aria-labelledby="choose-title" className="rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/[0.06] sm:p-5">
          <h2 id="choose-title" className="font-brand text-[1.625rem] font-semibold text-navy-950">Which kind of cover?</h2>
          <p className="text-body-sm text-ink-secondary">You don&apos;t need all of them. Start with the one you&apos;re curious about.</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {AREAS.map((a) => {
              const c = findProtectionCategory(areaToSlug[a])!;
              const meta = protectAreas.find((x) => x.key === a)!;
              const n = note(a);
              return (
                <li key={a}>
                  <button
                    type="button"
                    onClick={() => go(`${GET_COVER}/${a}`)}
                    className="group flex h-full w-full items-center gap-3 rounded-2xl bg-sunken/60 p-3.5 text-left ring-1 ring-ink/[0.06] transition-shadow hover:shadow-e1"
                  >
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white">
                      <GeIcon name={c.iconName} size={22} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-navy-950">{areaLabels[a]}</span>
                      <span className="block text-caption text-ink-secondary">{meta.hint}</span>
                      {n && <span className="mt-1 inline-block rounded-full bg-white px-2 py-0.5 text-[12px] font-semibold text-navy-800 ring-1 ring-ink/10">{n}</span>}
                    </span>
                    <ArrowRight size={18} className="shrink-0 text-crimson-600 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-caption text-ink-muted">
            Not sure what any of these mean?{" "}
            <a href="#app/learn/protection" className="font-semibold text-navy-800 underline underline-offset-2">See how protection works</a>.
          </p>
        </section>
        <Independence />
      </Container>
    </>
  );
}

/* =========================================================================== 3 steps */

const STEPS: Array<{ key: "understand" | "ready" | "how"; label: string; short: string }> = [
  { key: "understand", label: "Understand", short: "Basics" },
  { key: "ready", label: "Get ready", short: "Ready" },
  { key: "how", label: "Apply", short: "Apply" },
];
const stepHash = (area: ProtectionArea, s: "understand" | "ready" | "how") => `${GET_COVER}/${area}${s === "understand" ? "" : `/${s}`}`;

function CoverSteps({ area, step }: { area: ProtectionArea; step: "understand" | "ready" | "how" }) {
  const c = findProtectionCategory(areaToSlug[area])!;
  const i = STEPS.findIndex((s) => s.key === step);
  return (
    <>
      <PageHero
        eyebrow={`Get cover · ${areaLabels[area]}`}
        title={c.purpose}
        text={c.short}
        image={c.photo.src}
        imagePosition={c.photo.position}
        backLabel={areaLabels[area]}
        onBack={() => go(i === 0 ? GET_COVER : stepHash(area, STEPS[i - 1].key))}
        titleId="cover-step-title"
      />
      <Container className="relative -mt-5 max-w-[44rem]">
        <nav aria-label="Get cover steps">
          <ol className="flex items-center justify-between gap-1 rounded-full bg-surface p-1.5 shadow-e2 ring-1 ring-ink/[0.06]">
            {STEPS.map((s, n) => {
              const active = n === i;
              const done = n < i;
              return (
                <li key={s.key} className="min-w-0 flex-1">
                  <a
                    href={`#${stepHash(area, s.key)}`}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-1 text-[12px] font-bold uppercase tracking-[0.03em] sm:text-caption",
                      active ? "bg-crimson-50 text-crimson-600" : "text-navy-900",
                    )}
                  >
                    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[12px]", active ? "bg-crimson-600 text-white" : done ? "bg-navy-900 text-white" : "bg-sunken text-navy-900")}>
                      {done ? <Check size={13} aria-hidden /> : n + 1}
                    </span>
                    <span className="truncate sm:hidden">{s.short}</span>
                    <span className="hidden truncate sm:inline">{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        {step === "understand" && <UnderstandStep area={area} />}
        {step === "ready" && <ReadyStep area={area} />}
        {step === "how" && <HowStep area={area} />}
        <Independence />
      </Container>
    </>
  );
}

function UnderstandStep({ area }: { area: ProtectionArea }) {
  const c = findProtectionCategory(areaToSlug[area])!;
  const myth = c.misunderstandings[0];
  return (
    <div className="pt-5">
      <p className="text-body text-ink">{c.summary}</p>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <section aria-labelledby="may-help" className="rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
          <h2 id="may-help" className="flex items-center gap-2 text-body font-semibold text-teal-800"><Check size={18} aria-hidden /> May help with</h2>
          <ul className="mt-2 grid gap-1.5 text-body-sm text-navy-950">
            {c.mayHelpTitles.slice(0, 4).map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
        <section aria-labelledby="not-auto" className="rounded-2xl bg-crimson-50/70 p-4 ring-1 ring-crimson-100">
          <h2 id="not-auto" className="flex items-center gap-2 text-body font-semibold text-crimson-700"><X size={18} aria-hidden /> Doesn&apos;t automatically cover</h2>
          <ul className="mt-2 grid gap-1.5 text-body-sm text-navy-950">
            {c.notAutomatic.slice(0, 3).map((t) => <li key={t}>{t}</li>)}
          </ul>
        </section>
      </div>
      {myth && (
        <p className="mt-3 rounded-2xl bg-navy-50 p-4 text-body-sm text-navy-950">
          <span className="font-semibold">Common mix-up: </span>{myth.myth.replace(/[“”]/g, "")} <span className="text-ink-secondary">{myth.reality}</span>
        </p>
      )}
      <a href={`#app/learn/protection/${c.slug}`} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-navy-800 underline underline-offset-2">
        Read the full guide to {c.purpose.toLowerCase()}
      </a>

      {c.scenario && (
        <section aria-labelledby="optional-tool" className="mt-4 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
          <p className="text-overline uppercase tracking-[0.14em] text-teal-700">Optional</p>
          <h2 id="optional-tool" className="mt-0.5 text-body font-semibold text-navy-950">Try it with numbers first</h2>
          <p className="text-body-sm text-ink-secondary">{c.scenario.text}</p>
          <button type="button" onClick={() => go(c.scenario!.href)} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
            {c.scenario.label} <ArrowRight size={15} aria-hidden />
          </button>
        </section>
      )}

      <StepNav next={{ label: c.scenario ? "Skip and continue" : "Continue", to: stepHash(area, "ready") }} />
    </div>
  );
}

function ReadyStep({ area }: { area: ProtectionArea }) {
  const { done } = useStore(checklistStore);
  const toggle = (id: string) => checklistStore.set({ done: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] });
  return (
    <div className="pt-5">
      <h2 className="font-brand text-[1.625rem] font-semibold text-navy-950">Before you apply</h2>
      <p className="text-body-sm text-ink-secondary">Tick what&apos;s true for you. It&apos;s the same checklist as in Guide, saved on this device. Nothing here is required.</p>
      <ul className="mt-3 grid gap-2">
        {readinessChecklist.map((item) => {
          const checked = done.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-surface px-4 py-2 text-left ring-1 ring-ink/[0.08]"
              >
                <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-md ring-2", checked ? "bg-teal-600 text-white ring-teal-600" : "ring-ink/25")}>
                  {checked && <Check size={15} aria-hidden />}
                </span>
                <span className={cn("text-body-sm", checked ? "text-success-700" : "text-navy-950")}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <section aria-labelledby="always" className="mt-4 rounded-2xl bg-navy-50 p-4">
        <h2 id="always" className="text-body font-semibold text-navy-950">Whichever way you apply</h2>
        <ul className="mt-2 grid gap-1.5 text-body-sm text-navy-950">
          <li>Read the Product Disclosure Sheet (PDS): it lists the benefits, limits, exclusions and costs.</li>
          <li>Answer every health question honestly. Leaving something out can mean a claim is refused later.</li>
          <li>Most new life and medical policies have a free-look period, usually 15 days, to cancel after you receive them.</li>
        </ul>
      </section>
      <StepNav back={stepHash(area, "understand")} next={{ label: "Continue to apply", to: stepHash(area, "how") }} />
    </div>
  );
}

function HowStep({ area }: { area: ProtectionArea }) {
  const app = useApplications().byArea[area];
  const cta = app?.status === "completed" ? "View your application" : app ? "Continue your application" : "Start your application";
  return (
    <div className="pt-5">
      <h2 className="font-brand text-[1.625rem] font-semibold text-navy-950">Ready to apply?</h2>
      <p className="text-body-sm text-ink-secondary">Apply here in GREAT EMPOWER, step by step. If you&apos;d like someone to talk it through first, an adviser can help.</p>
      <section aria-label="Apply in GREAT EMPOWER" className="mt-3 rounded-2xl bg-navy-950 p-5 text-white shadow-e2">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-white/10"><ClipboardList size={22} aria-hidden /></span>
        <h3 className="mt-3 font-brand text-[1.625rem] font-semibold leading-tight">Apply in GREAT EMPOWER</h3>
        <p className="mt-1 text-body-sm text-white/80">Fill in your application here. It takes about five minutes.</p>
        <ul className="mt-3 grid gap-1.5 text-body-sm">
          {["Four short steps: your details, your cover, health questions, review", "Saved on this device as you go; come back any time", "Check every answer before you finish", "Not sent to an insurer yet: you'll see exactly what that means"].map((t) => (
            <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-teal-300" aria-hidden />{t}</li>
          ))}
        </ul>
        <button type="button" onClick={() => go(`${APPLY}/${area}/${!app ? "details" : app.status === "completed" ? "done" : firstIncompleteStep(app)}`)} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body-sm font-bold text-white hover:bg-crimson-700 sm:w-auto sm:px-6">
          {cta} <ArrowRight size={16} aria-hidden />
        </button>
      </section>
      <section aria-label="Talk to an adviser" className="mt-3 flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.1] sm:flex-row sm:items-center">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800"><UserRound size={20} aria-hidden /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-navy-950">Want help first? Talk to an adviser</span>
          <span className="block text-body-sm text-ink-secondary">Guidance, not an application: what to ask, what to bring, and how to reach a licensed adviser.</span>
        </span>
        <button type="button" onClick={() => go(`${GET_COVER}/${area}/adviser`)} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-body-sm font-semibold text-navy-900 ring-1 ring-navy-900/30 hover:bg-navy-50">
          Get Adviser Guidance <ArrowRight size={16} aria-hidden />
        </button>
      </section>
      <p className="mt-3 text-caption text-ink-muted">Have cover through work? Check your employer&apos;s scheme first; group cover usually ends when you leave the job.</p>
      <StepNav back={stepHash(area, "ready")} />
    </div>
  );
}

/** Old `…/online` links (the earlier external-website route) open the in-app application instead. */
function ForwardToApply({ area }: { area: ProtectionArea }) {
  useEffect(() => {
    window.location.replace(`#${APPLY}/${area}/details`);
  }, [area]);
  return null;
}

function StepNav({ back, next }: { back?: string; next?: { label: string; to: string } }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {next && (
        <button type="button" onClick={() => go(next.to)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-crimson-600 px-5 text-body-sm font-bold text-white hover:bg-crimson-700 sm:flex-none">
          {next.label} <ArrowRight size={16} aria-hidden />
        </button>
      )}
      {back && (
        <button type="button" onClick={() => go(back)} className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/15">
          <ArrowLeft size={16} aria-hidden /> Back
        </button>
      )}
    </div>
  );
}

/* =========================================================================== handoffs */

function HandoffShell({ area, eyebrow, title, text, children }: { area: ProtectionArea; eyebrow: string; title: string; text: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} text={text} backLabel="Apply" onBack={() => go(stepHash(area, "how"))} titleId="handoff-title" />
      <Container className="max-w-[44rem] pt-5">
        {children}
        <section aria-labelledby="after" className="mt-6 rounded-2xl bg-navy-950 p-5 text-white">
          <h2 id="after" className="font-brand text-[1.5rem] font-semibold leading-tight">Got cover through an adviser?</h2>
          <p className="mt-1 text-body-sm text-white/75">Once an insurer has accepted you, update your check so Protect shows it. It stays on this device.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => go("app/protect/check")} className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-body-sm font-bold text-navy-950">
              Update my check <ArrowRight size={16} aria-hidden />
            </button>
            <button type="button" onClick={() => go("app/protect")} className="inline-flex h-12 items-center rounded-full px-4 text-body-sm font-semibold text-white ring-1 ring-white/30">
              Back to my protection
            </button>
          </div>
        </section>
        <Independence />
      </Container>
    </>
  );
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-5">
      <h2 id={id} className="font-brand text-[1.5rem] font-semibold leading-tight text-navy-950">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** An official page outside GREAT EMPOWER: always says so, always a new tab, so the app stays where it was. */
function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-crimson-600 underline-offset-2 hover:underline">
      {children} <ExternalLink size={14} aria-hidden />
      <span className="sr-only"> (leaves GREAT EMPOWER, opens in a new tab)</span>
    </a>
  );
}

function AdviserHandoff({ area }: { area: ProtectionArea }) {
  const p = useProfile();
  const answered = protectAreas.filter((a) => p.coverage[a.key]);
  return (
    <HandoffShell
      area={area}
      eyebrow={`Adviser guidance · ${areaLabels[area]}`}
      title="Get guidance from an adviser."
      text="Guidance, not an application. A licensed agent or adviser can explain plans and help you apply with an insurer. GREAT EMPOWER doesn't arrange this for you."
    >
      <Block id="why-adviser" title="When an adviser helps most">
        <ul className="grid gap-1.5 text-body-sm text-navy-950">
          {["You have a health condition or a higher-risk job", "You're looking at more than one kind of cover", "The plan you want is only sold through agents", "You'd like someone to explain the terms before you decide"].map((t) => (
            <li key={t} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-teal-700" aria-hidden />{t}</li>
          ))}
        </ul>
      </Block>
      <Block id="ask-adviser" title="Questions to ask">
        <ul className="grid list-disc pl-5 marker:text-navy-300 gap-1.5 text-body-sm text-navy-950">
          {["What does this plan cover, and what doesn't it cover?", "What are the annual limit, deductible and co-payment?", "Is there a waiting period?", "How can the premium or contribution change over time?", "How do I make a claim?", "Are you paid a commission for this plan?"].map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Block>
      <Block id="prepare-adviser" title="What to bring">
        <ul className="grid list-disc pl-5 marker:text-navy-300 gap-1.5 text-body-sm text-navy-950">
          <li>Cover you already have, including from work or your parents</li>
          <li>What you can comfortably spend each month</li>
          <li>Who depends on your income</li>
          <li>Your health history, to answer questions accurately</li>
        </ul>
        {answered.length > 0 && (
          <div className="mt-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
            <p className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">Your answers from your check</p>
            <ul className="mt-1.5 grid gap-1 text-body-sm text-navy-950">
              {answered.map((a) => (
                <li key={a.key}>{areaLabels[a.key]}: {p.coverage[a.key] === "yes" ? "I have this cover" : p.coverage[a.key] === "no" ? "I don't have this cover" : "Not sure"}</li>
              ))}
            </ul>
          </div>
        )}
      </Block>
      <Block id="check-adviser" title="Check who you're talking to">
        <ul className="grid list-disc pl-5 marker:text-navy-300 gap-1.5 text-body-sm text-navy-950">
          <li>Ask which insurer or takaful operator they represent, and for their registration details. Confirm with that company.</li>
          <li>Never share passwords or one-time codes (OTPs).</li>
          <li>Take time to decide. Read the PDS before you sign.</li>
        </ul>
      </Block>
      <Block id="contact-adviser" title="Reach an adviser through an official channel">
        <p className="text-body-sm text-ink-secondary">Contact the insurer or takaful operator you&apos;re interested in through its own website or customer line. One example:</p>
        <div className="mt-2 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.08]">
          <h3 className="text-body font-semibold text-navy-950">{adviserCallBack.label}</h3>
          <ul className="mt-1 grid list-disc pl-5 marker:text-navy-300 gap-1 text-body-sm text-navy-950">
            {adviserCallBack.pageSays.map((s) => <li key={s}>{s}</li>)}
          </ul>
          <p className="mt-1 text-caption text-ink-muted">Checked {CHANNELS_CHECKED_ON}. GREAT EMPOWER isn&apos;t affiliated with Great Eastern and sends nothing for you.</p>
          <OfficialLink href={adviserCallBack.url}>Open the official call-back page</OfficialLink>
        </div>
      </Block>

      <button type="button" onClick={() => go(`${APPLY}/${area}/details`)} className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-left text-body-sm font-semibold text-navy-800">
        Prefer to fill it in yourself? Apply in GREAT EMPOWER <ArrowRight size={15} aria-hidden />
      </button>
    </HandoffShell>
  );
}
