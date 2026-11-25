import { ArrowRight, CalendarDays, ChevronRight, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { useSession } from "@/account/session";
import { useLearnProgress } from "@/state/learnProgress";
import { demoLessons } from "@/data/demo-courses";
import { primaryNav, type NavKey } from "@/components/nav/navItems";
import { mediAsasStory, NEWS_HASH_PREFIX } from "@/data/news";
import { FeaturedHero } from "./home/FeaturedHero";
import { openGame } from "./game/gameRoute";

export type DashboardDestination =
  | "home"
  | "learn"
  | "simulate"
  | "analyze"
  | "guide"
  | "rewards"
  | "notifications"
  | "about";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};


/** Home — compact and app-first: featured carousel, one update, quick actions, the game. */
export function HomeDashboard({
  onNavigate,
}: {
  onNavigate: (destination: DashboardDestination) => void;
}) {
  const session = useSession();
  const profileName = session.kind === "ready" ? session.account.displayName : undefined;
  const learn = useLearnProgress();
  const nextLesson = demoLessons.find((lesson) => !learn.completed.includes(lesson.id)) ?? demoLessons[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <FeaturedHero
        greeting={greeting}
        profileName={profileName}
        onContinue={() => go(`app/learn/lesson/${nextLesson?.id ?? "hospital-bills"}`)}
        onBookSession={() => {
          go("app/guide/sessions");
          window.scrollTo({ top: 0 });
        }}
      />

      <div className="bg-canvas pb-6 pt-5 sm:pt-8">
        <Container className="grid gap-7 sm:gap-9 lg:grid-cols-2 lg:items-start lg:gap-x-12">
          <div className="grid gap-7 sm:gap-9">
            <LatestUpdate />
            <QuickActions onNavigate={onNavigate} />
          </div>
          <GameEntrance />
        </Container>
      </div>
    </>
  );
}

/** Section heading: small navy overline + crimson serif title. */
function SectionHeading({ id, overline, title }: { id: string; overline: string; title: string }) {
  return (
    <div>
      <p className="text-overline uppercase tracking-[0.18em] text-navy-700">{overline}</p>
      <h2
        id={id}
        className="mt-0.5 font-brand text-[1.875rem] font-semibold leading-tight text-crimson-600 sm:text-[2.125rem]"
      >
        {title}
      </h2>
    </div>
  );
}

function LatestUpdate() {
  const date = new Date(`${mediAsasStory.publishedOn}T00:00:00`).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <section aria-labelledby="latest-title">
      <button
        type="button"
        onClick={() => go(`${NEWS_HASH_PREFIX}${mediAsasStory.id}`)}
        className="ge-update-card group flex w-full gap-4 rounded-[1.25rem] p-4 text-left ring-1 ring-navy-200/70 transition-shadow hover:shadow-e2"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-600">
          <Megaphone size={22} aria-hidden />
        </span>
        <span className="min-w-0 flex-1 border-l border-ink/10 pl-4">
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span className="text-overline uppercase tracking-[0.14em] text-navy-800">
              Latest update · MediAsas
            </span>
            <span className="inline-flex items-center gap-1 text-caption text-ink-muted">
              <CalendarDays size={13} aria-hidden />
              {date}
            </span>
          </span>
          <span
            id="latest-title"
            className="mt-1 block font-brand text-[1.375rem] font-semibold leading-tight text-navy-950"
          >
            {mediAsasStory.teaser.title}
          </span>
          <span className="mt-1 block text-body-sm text-ink-secondary">{mediAsasStory.teaser.text}</span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-semibold text-crimson-600">
            Read update <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </span>
      </button>
    </section>
  );
}

const quickHints: Record<Exclude<NavKey, "home">, string> = {
  learn: "Build your knowledge",
  simulate: "Try real-life scenarios",
  analyze: "Understand your needs",
  guide: "Get step-by-step help",
};

const quickDestinations = primaryNav.filter(
  (item): item is (typeof primaryNav)[number] & { key: Exclude<NavKey, "home"> } =>
    item.key !== "home",
);

function QuickActions({ onNavigate }: { onNavigate: (destination: DashboardDestination) => void }) {
  return (
    <section aria-labelledby="quick-title">
      <SectionHeading id="quick-title" overline="Explore" title="Quick Actions" />
      <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
        {quickDestinations.map(({ key, label, icon: Icon }) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => onNavigate(key)}
              className="flex min-h-[4.5rem] w-full items-center gap-3 rounded-2xl bg-navy-900 px-3.5 py-3 text-left text-white shadow-e2 transition-colors hover:bg-navy-800 active:bg-navy-950 sm:px-4"
            >
              <Icon size={24} strokeWidth={1.75} className="shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold">{label}</span>
                <span className="block text-[12px] leading-tight text-white/70">{quickHints[key]}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-white/60" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GameEntrance() {
  return (
    <section aria-labelledby="game-entry-title">
      <SectionHeading id="game-entry-title" overline="Insurance gameplay" title="LifeTrack" />
      <button
        type="button"
        onClick={openGame}
        aria-label="Enter LifeTrack"
        className="group relative mt-3 block w-full overflow-hidden rounded-[1.5rem] shadow-e2 ring-1 ring-black/5"
      >
        <picture className="block">
          <source
            type="image/webp"
            srcSet="/images/lifetrack/lifetrack-cover-960.webp 960w, /images/lifetrack/lifetrack-cover-1600.webp 1600w"
            sizes="(min-width: 1200px) 560px, (min-width: 1024px) 45vw, 100vw"
          />
          <img
            src="/images/lifetrack/lifetrack-cover-960.webp"
            alt="LifeTrack game cover: four young adults gather around a city board game with dice and coins."
            width={1600}
            height={1195}
            loading="lazy"
            decoding="async"
            className="block aspect-[16/10] h-auto w-full object-cover object-[50%_40%] transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </picture>
        <span className="absolute bottom-3 right-3 inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-5 text-body font-bold text-navy-950 shadow-e3 transition-transform group-hover:translate-x-0.5">
          Enter
          <ArrowRight size={17} aria-hidden />
        </span>
      </button>
    </section>
  );
}
