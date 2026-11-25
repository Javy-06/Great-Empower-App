import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  CheckSquare,
  ClipboardList,
  Clock3,
  HeartPulse,
  LayoutGrid,
  ListOrdered,
  Search,
  ShieldPlus,
  Square,
  Users,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { guideCategories, guides, readinessChecklist, type Guide, type GuideCategory } from "@/data/guides";
import { createStore, useStore } from "@/state/store";
import { SessionsView } from "./guide/SessionsView";

const checklistStore = createStore<{ done: string[] }>("ge-guide-checklist-v1", () => ({ done: [] }));

const categoryIcons: Record<GuideCategory, typeof ShieldPlus> = {
  "insurance-basics": ShieldPlus,
  "medical-claims": HeartPulse,
  planning: Calculator,
  "life-events": Users,
  mistakes: AlertTriangle,
};
const categoryTone: Record<GuideCategory, string> = {
  "insurance-basics": "text-navy-700 bg-navy-50",
  "medical-claims": "text-crimson-600 bg-crimson-50",
  planning: "text-gold-700 bg-gold-50",
  "life-events": "text-teal-700 bg-teal-50",
  mistakes: "text-crimson-700 bg-crimson-50",
};
const formatLabel: Record<Guide["format"], string> = {
  "step-by-step": "Step-by-step",
  explainer: "Explainer",
  checklist: "Checklist",
};

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};

function readRoute() {
  const m = /^#app\/guide\/(article|checklist|sessions)(?:\/([^/?#]+))?$/.exec(window.location.hash);
  if (!m) return { view: "home" as const };
  if (m[1] === "checklist") return { view: "checklist" as const };
  if (m[1] === "sessions") return { view: "sessions" as const };
  return guides.some((g) => g.id === m[2]) ? { view: "article" as const, id: m[2]! } : { view: "home" as const };
}

export function GuideCentre() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (route.view === "article") return <GuideArticle guide={guides.find((g) => g.id === route.id)!} />;
  if (route.view === "checklist") return <ChecklistView />;
  if (route.view === "sessions") return <SessionsView />;
  return <GuideHome />;
}

function GuideHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GuideCategory | "all">("all");
  const featured = guides.filter((g) => g.featured);
  const [slide, setSlide] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter(
      (g) =>
        (category === "all" || g.category === category) &&
        (!q || `${g.title} ${g.summary} ${g.points.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [query, category]);
  const filtering = query.trim() !== "" || category !== "all";

  return (
    <>
      <PageHero
        eyebrow="Your practical guide"
        title="Clear steps for real-life decisions."
        text="Practical guides, real examples and actionable steps on insurance, claims and protection."
        image="/images/pexels/young-professional-savings-planning.webp"
        imagePosition="55% 25%"
        backLabel="Guide"
        onBack={() => go("app/home")}
        titleId="guide-title"
      />

      <Container className="-mt-6 relative">
        <label className="flex h-14 items-center gap-3 rounded-2xl bg-surface px-4 shadow-e2 ring-1 ring-ink/[0.06] focus-within:ring-2 focus-within:ring-teal-600">
          <Search size={20} className="shrink-0 text-ink-muted" aria-hidden />
          <span className="sr-only">Search guides</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search guides (e.g. "claim", "deductible")'
            className="h-full w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
      </Container>

      <Container className="mt-4">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none" role="tablist" aria-label="Guide categories">
          {[{ key: "all" as const, label: "All Guides" }, ...guideCategories].map((c) => {
            const Icon = c.key === "all" ? LayoutGrid : categoryIcons[c.key];
            const selected = category === c.key;
            return (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setCategory(c.key)}
                className={cn(
                  "flex h-[4.75rem] w-[5.75rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl px-2 text-center text-[12px] font-semibold leading-tight",
                  selected ? "bg-navy-900 text-white" : "bg-surface text-navy-900 shadow-e1 ring-1 ring-ink/[0.06]",
                )}
              >
                <Icon size={22} className={selected ? "text-white" : c.key === "all" ? "text-navy-800" : categoryTone[c.key].split(" ")[0]} aria-hidden />
                {c.label}
              </button>
            );
          })}
        </div>
      </Container>

      {filtering ? (
        <Container className="mt-6">
          <h2 className="text-heading text-navy-950">
            {results.length} {results.length === 1 ? "guide" : "guides"}
          </h2>
          {results.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-surface p-6 text-center text-body-sm text-ink-muted ring-1 ring-ink/[0.07]">
              No guides match “{query}”. Try another word, or browse all guides.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">{results.map((g) => <li key={g.id}><GuideRow guide={g} /></li>)}</ul>
          )}
        </Container>
      ) : (
        <>
          <Container className="mt-7">
            <div className="flex items-end justify-between">
              <h2 className="font-brand text-[1.875rem] font-semibold text-navy-950">Featured guides</h2>
            </div>
            <div className="mt-3 overflow-hidden rounded-[1.25rem] bg-surface shadow-e1 ring-1 ring-ink/[0.06]">
              {featured.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  hidden={i !== slide}
                  onClick={() => go(`app/guide/article/${g.id}`)}
                  className="grid w-full grid-cols-[38%_1fr] text-left"
                >
                  <img src={g.image} alt="" className="ge-skeleton h-full min-h-[10rem] w-full object-cover" />
                  <span className="flex flex-col justify-center gap-1.5 p-4">
                    <span className={cn("inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]", categoryTone[g.category])}>
                      <ListOrdered size={12} aria-hidden /> {formatLabel[g.format]}
                    </span>
                    <span className="font-brand text-[1.375rem] font-semibold leading-tight text-navy-950">{g.title}</span>
                    <span className="text-body-sm text-ink-secondary">{g.summary}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-1 flex justify-center" role="group" aria-label="Featured guide">
              {featured.map((g, i) => (
                <button key={g.id} type="button" onClick={() => setSlide(i)} aria-label={`Show ${g.title}`} aria-current={i === slide ? "true" : undefined} className="inline-flex h-11 w-7 items-center justify-center">
                  <span className={cn("block h-2 rounded-full transition-all", i === slide ? "w-5 bg-navy-900" : "w-2 bg-navy-900/20")} />
                </button>
              ))}
            </div>
          </Container>

          <Container className="mt-4">
            <h2 className="font-brand text-[1.875rem] font-semibold text-navy-950">Popular guides</h2>
            <ul className="-mx-5 mt-3 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
              {guides.filter((g) => !g.featured).map((g) => (
                <li key={g.id} className="w-[13.5rem] shrink-0 snap-start">
                  <GuideCard guide={g} />
                </li>
              ))}
            </ul>
          </Container>

          <Container className="mt-5">
            <button
              type="button"
              onClick={() => go("app/guide/checklist")}
              className="flex w-full items-center gap-4 rounded-[1.25rem] bg-surface p-4 text-left shadow-e1 ring-1 ring-ink/[0.06]"
            >
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-crimson-50 text-crimson-600">
                <ClipboardList size={26} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-subheading text-navy-950">Step-by-step action plan</span>
                <span className="block text-body-sm text-ink-secondary">A practical checklist to improve your protection readiness.</span>
              </span>
              <span className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-crimson-600 px-4 text-body-sm font-semibold text-white">
                View <ArrowRight size={16} aria-hidden />
              </span>
            </button>
            <button
              type="button"
              onClick={() => go("app/guide/sessions")}
              className="mt-3 flex w-full items-center gap-4 rounded-[1.25rem] bg-navy-950 p-4 text-left text-white shadow-e2"
            >
              <span className="flex -space-x-2" aria-hidden>
                {["NA", "JL", "PR"].map((x, k) => (
                  <span key={x} className={cn("inline-flex size-10 items-center justify-center rounded-full text-caption font-bold ring-2 ring-navy-950", ["bg-teal-100 text-teal-800", "bg-gold-100 text-gold-700", "bg-crimson-100 text-crimson-700"][k])}>{x}</span>
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-subheading">Book a guidance session</span>
                <span className="block text-body-sm text-white/70">Talk through protection basics · prototype</span>
              </span>
              <ArrowRight size={18} className="shrink-0" aria-hidden />
            </button>
          </Container>
        </>
      )}
    </>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  const Icon = categoryIcons[guide.category];
  return (
    <button type="button" onClick={() => go(`app/guide/article/${guide.id}`)} className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface text-left shadow-e1 ring-1 ring-ink/[0.06]">
      <img src={guide.image} alt="" loading="lazy" className="ge-skeleton h-24 w-full object-cover" />
      <span className="flex flex-1 flex-col p-3">
        <span className={cn("inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]", categoryTone[guide.category])}>
          <Icon size={11} aria-hidden /> {guideCategories.find((c) => c.key === guide.category)?.label}
        </span>
        <span className="mt-1.5 text-body-sm font-semibold leading-snug text-navy-950">{guide.title}</span>
        <span className="mt-auto flex items-center gap-1 pt-2 text-caption text-ink-muted"><Clock3 size={12} aria-hidden /> {guide.minutes} min</span>
      </span>
    </button>
  );
}

function GuideRow({ guide }: { guide: Guide }) {
  return (
    <button type="button" onClick={() => go(`app/guide/article/${guide.id}`)} className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-ink/[0.07]">
      <img src={guide.image} alt="" loading="lazy" className="size-16 shrink-0 rounded-xl object-cover" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-teal-700">{formatLabel[guide.format]}</span>
        <span className="block text-body-sm font-semibold text-navy-950">{guide.title}</span>
        <span className="block text-caption text-ink-muted">{guide.minutes} min</span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-navy-900" aria-hidden />
    </button>
  );
}

function GuideArticle({ guide }: { guide: Guide }) {
  const ordered = guide.format !== "explainer";
  return (
    <article aria-labelledby="guide-article-title" className="pb-4">
      <div className="relative h-48 overflow-hidden sm:h-64">
        <img src={guide.image} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/10 to-transparent" aria-hidden />
        <button type="button" onClick={() => go("app/guide")} aria-label="Back to Guide" className="absolute left-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-navy-950 shadow-e2">
          <ArrowLeft size={20} aria-hidden />
        </button>
      </div>
      <Container className="-mt-6 relative max-w-[44rem]">
        <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]", categoryTone[guide.category])}>
          {formatLabel[guide.format]} · {guideCategories.find((c) => c.key === guide.category)?.label}
        </span>
        <h1 id="guide-article-title" className="mt-2 font-brand text-[2.25rem] font-semibold leading-[1.05] text-navy-950">{guide.title}</h1>
        <p className="mt-2 text-body-lg text-ink-secondary">{guide.summary}</p>
        <p className="mt-1 flex items-center gap-1 text-caption text-ink-muted"><Clock3 size={12} aria-hidden /> {guide.minutes} min read</p>

        <ol className="mt-6 grid gap-3">
          {guide.points.map((point, i) => (
            <li key={point} className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
              <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body-sm font-bold", ordered ? "bg-navy-900 text-white" : "bg-teal-50 text-teal-700")}>
                {ordered ? i + 1 : "•"}
              </span>
              <span className="text-body text-ink">{point}</span>
            </li>
          ))}
        </ol>

        {guide.related && (
          <section className="mt-7">
            <h2 className="text-subheading text-navy-950">Go further</h2>
            <ul className="mt-2 grid gap-2">
              {guide.related.map((r) => (
                <li key={r.href}>
                  <button type="button" onClick={() => go(r.href)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-navy-50 px-4 text-left text-body-sm font-semibold text-navy-900">
                    {r.label} <ArrowRight size={16} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {guide.furtherReading && (
          <section className="mt-6">
            <h2 className="text-caption font-semibold uppercase tracking-[0.14em] text-ink-muted">Further reading</h2>
            <ul className="mt-2 grid gap-1">
              {guide.furtherReading.map((r) => (
                <li key={r.href}>
                  <a href={r.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-navy-800 underline underline-offset-4">
                    {r.label} <ArrowUpRight size={14} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="mt-8 border-t border-ink/10 pt-4 text-caption text-ink-muted">
          General education only. It is not personal financial, insurance or medical advice. Check
          your own policy wording and speak to a licensed adviser.
        </p>
      </Container>
    </article>
  );
}

function ChecklistView() {
  const { done } = useStore(checklistStore);
  const toggle = (id: string) =>
    checklistStore.set({ done: done.includes(id) ? done.filter((x) => x !== id) : [...done, id] });
  return (
    <>
      <PageHero
        eyebrow="Action plan"
        title="Protection readiness checklist"
        text="Tick off each step as you go. Saved on this device."
        backLabel="Guide"
        onBack={() => go("app/guide")}
        titleId="checklist-title"
      >
        <p className="mt-4 text-body-sm font-semibold text-white/85">
          {done.length} of {readinessChecklist.length} done
        </p>
      </PageHero>
      <Container className="max-w-[44rem] pt-5">
        <ul className="grid gap-2.5">
          {readinessChecklist.map((item) => {
            const checked = done.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(item.id)}
                  className={cn("flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1", checked ? "bg-success-50 ring-success-200" : "bg-surface ring-ink/[0.08]")}
                >
                  {checked ? <CheckSquare size={22} className="shrink-0 text-success-700" aria-hidden /> : <Square size={22} className="shrink-0 text-ink-muted" aria-hidden />}
                  <span className={cn("text-body", checked ? "text-success-700" : "text-navy-950")}>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => go("app/simulate")} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-crimson-600 text-body font-semibold text-white">
          Build your protection profile <ArrowRight size={18} aria-hidden />
        </button>
      </Container>
    </>
  );
}
