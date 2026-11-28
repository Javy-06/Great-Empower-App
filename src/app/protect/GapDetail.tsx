import { ArrowRight, ClipboardCheck, MessagesSquare, ShieldCheck, X } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { GeIcon } from "@/components/illustrations/GeIcons";
import { cn } from "@/lib/cn";
import { areaLabels, useProfile, type ProtectionArea } from "@/state/profile";
import { findProtectionCategory } from "@/data/protection";
import { areaToSlug } from "@/data/applyChannels";
import { areaMeta, assess, gapHash, statusStyle } from "../AnalyzeView";
import { GET_COVER } from "./GetCover";
import { startAdviserRequest } from "./AdviserRequest";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};
const answerLabel = { yes: "I have this cover", no: "I don't have this cover", "not-sure": "Not sure" } as const;

/**
 * `#app/protect/gap/<area>`: where a tap on "Your gaps" lands. One area's finding, what that cover
 * does and doesn't do, and the next steps. Uses the same rule-based `assess()` as the overview;
 * nothing is recalculated, and nothing checks a real policy.
 */
export function GapDetail({ area }: { area: ProtectionArea }) {
  const p = useProfile();
  const { status, why, next } = assess(area, p);
  const st = statusStyle[status];
  const StIcon = st.icon;
  const c = findProtectionCategory(areaToSlug[area])!;
  const answer = p.coverage[area];
  const others = (Object.keys(areaMeta) as ProtectionArea[]).filter((a) => a !== area);
  return (
    <>
      <PageHero
        eyebrow="Protect · Your gaps"
        title={areaLabels[area]}
        text={areaMeta[area].what}
        image={c.photo.src}
        imagePosition={c.photo.position}
        backLabel="Your gaps"
        onBack={() => {
          go("app/protect");
          window.setTimeout(() => document.getElementById("protect-gaps")?.scrollIntoView({ block: "start" }), 150);
        }}
        titleId="gap-title"
      />
      <Container className="relative -mt-5 max-w-[44rem]">
        <section aria-labelledby="gap-finding" className="rounded-2xl bg-surface p-4 shadow-e2 ring-1 ring-ink/[0.06] sm:p-5">
          <div className="flex items-center gap-3">
            <span className={cn("inline-flex size-14 shrink-0 items-center justify-center rounded-2xl", st.bar)}>
              <StIcon size={26} strokeWidth={2.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">Your finding</p>
              <h2 id="gap-finding" className="font-brand text-[1.75rem] font-semibold leading-tight text-navy-950">{st.label}</h2>
            </div>
          </div>
          <p className="mt-3 text-body text-navy-950">{why}</p>
          <dl className="mt-3 grid gap-2 rounded-xl bg-sunken/60 p-3 text-body-sm sm:grid-cols-2">
            <div>
              <dt className="text-caption text-ink-muted">Your answer</dt>
              <dd className="font-semibold text-navy-950">{answer ? answerLabel[answer] : "Not answered yet"}</dd>
            </div>
            <div>
              <dt className="text-caption text-ink-muted">A priority for you</dt>
              <dd className="font-semibold text-navy-950">{p.priorities.includes(area) ? "Yes" : "No"}</dd>
            </div>
          </dl>
          <button type="button" onClick={() => go(next.href)} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 px-6 text-body-sm font-bold text-white hover:bg-crimson-700 sm:w-auto">
            {next.label} <ArrowRight size={16} aria-hidden />
          </button>
          <p className="mt-2 text-caption text-ink-muted">Based only on your own answers. Nothing here checks a real policy.</p>
        </section>

        <section aria-labelledby="gap-what" className="mt-6">
          <h2 id="gap-what" className="font-brand text-[1.5rem] font-semibold leading-tight text-navy-950">What this cover does</h2>
          <p className="mt-1 text-body-sm text-ink-secondary">{c.short}</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-2xl bg-teal-50/70 p-4 ring-1 ring-teal-100">
              <p className="flex items-center gap-2 text-body-sm font-semibold text-teal-800"><ShieldCheck size={17} aria-hidden /> May help with</p>
              <ul className="mt-2 grid gap-2">
                {c.mayHelpTitles.slice(0, 3).map((t, i) => (
                  <li key={t} className="flex items-center gap-2.5 text-body-sm text-navy-950">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700"><GeIcon name={c.mayHelpIcons[i]} size={17} aria-hidden /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-crimson-50/70 p-4 ring-1 ring-crimson-100">
              <p className="flex items-center gap-2 text-body-sm font-semibold text-crimson-700"><X size={17} aria-hidden /> Doesn&apos;t automatically cover</p>
              <ul className="mt-2 grid gap-2">
                {c.notAutomaticTitles.slice(0, 3).map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-body-sm text-navy-950">
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-crimson-600"><X size={15} aria-hidden /></span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <a href={`#app/learn/protection/${c.slug}`} className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-navy-800 underline underline-offset-2">
            How {c.purpose} works
          </a>
        </section>

        <section aria-labelledby="gap-next" className="mt-5">
          <h2 id="gap-next" className="text-body font-semibold text-navy-950">Other next steps</h2>
          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: `Explore ${areaLabels[area].toLowerCase()} cover`, run: () => go(`${GET_COVER}/${area}`) },
              { icon: MessagesSquare, label: "Talk to an adviser", run: () => startAdviserRequest(area) },
              { icon: ClipboardCheck, label: "Change my answer", run: () => go("app/protect/check") },
            ].map(({ icon: Icon, label, run }) => (
              <li key={label}>
                <button type="button" onClick={run} className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left text-body-sm font-semibold text-navy-950 ring-1 ring-ink/[0.08] hover:shadow-e1">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-800"><Icon size={17} aria-hidden /></span>
                  <span className="min-w-0 flex-1">{label}</span>
                  <ArrowRight size={15} className="shrink-0 text-crimson-600" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Other areas" className="mt-6">
          <p className="text-caption font-semibold uppercase tracking-[0.1em] text-ink-muted">Other areas</p>
          <ul className="mt-2 grid grid-cols-3 gap-2">
            {others.map((a) => {
              const s2 = statusStyle[assess(a, p).status];
              const I = s2.icon;
              return (
                <li key={a}>
                  <button type="button" onClick={() => go(gapHash(a))} className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 rounded-xl bg-surface px-1 py-2 text-center ring-1 ring-ink/[0.08] hover:shadow-e1">
                    <span className={cn("inline-flex size-6 items-center justify-center rounded-full", s2.bar)}><I size={13} strokeWidth={2.5} aria-hidden /></span>
                    <span className="text-[12px] font-semibold leading-tight text-navy-950">{areaLabels[a]}</span>
                    <span className="sr-only">: {s2.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <p className="mt-6 text-caption text-ink-muted">Educational assessment only. It does not verify any policy and is not financial advice.</p>
      </Container>
    </>
  );
}
