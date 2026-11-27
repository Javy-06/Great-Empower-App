import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { useSession } from "@/account/session";
import { useLearnProgress } from "@/state/learnProgress";
import { demoLessons } from "@/data/demo-courses";
import { protectionCategories } from "@/data/protection";
import { categoryIcons, categoryTones } from "./protection/ProtectionHub";
import { mediAsasStory, NEWS_HASH_PREFIX } from "@/data/news";
import { FeaturedHero } from "./home/FeaturedHero";
import { NextSteps } from "./home/NextSteps";
import { openGame } from "./game/gameRoute";

export type DashboardDestination =
  | "home"
  | "learn"
  | "simulate"
  | "analyze"
  | "guide"
  | "rewards"
  | "notifications";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};


/** Home — compact and app-first: featured carousel, one update, a protection starting point, the game. */
export function HomeDashboard() {
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
        <Container>
          <NextSteps />
        </Container>
        <Container className="mt-7 grid gap-7 sm:mt-9 sm:gap-9 md:grid-cols-2 md:items-start md:gap-x-8 lg:gap-x-12">
          <div className="grid gap-7 sm:gap-9">
            <ProtectionStart />
            <LatestUpdate />
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

const homeLabels: Record<string, string> = { medical: "Hospital", "critical-illness": "Illness", life: "Family", tpd: "Disability", "personal-accident": "Accident" };

/** Start here: the five kinds of cover at a glance, each tappable, plus one way into the full guide. */
function ProtectionStart() {
  return (
    <section aria-labelledby="start-title" className="rounded-[1.25rem] bg-navy-950 p-4 text-white shadow-e2 sm:p-5">
      <p className="text-overline uppercase tracking-[0.18em] text-teal-200">Start here</p>
      <h2 id="start-title" className="mt-1 font-brand text-[1.75rem] font-semibold leading-tight">
        Five risks, five kinds of cover
      </h2>
      <p className="mt-1 text-body-sm text-white/70">See what each one does — and doesn't — in two minutes.</p>
      <ul className="mt-4 grid grid-cols-5 gap-1.5">
        {protectionCategories.map((c) => {
          const Icon = categoryIcons[c.slug];
          return (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => go(`app/learn/protection/${c.slug}`)}
                aria-label={`${homeLabels[c.slug]}: ${c.purpose}`}
                className="flex w-full flex-col items-center gap-1.5 rounded-xl px-1 py-2 text-center hover:bg-white/[0.06]"
              >
                <span className={`inline-flex size-11 items-center justify-center rounded-xl ${categoryTones[c.slug]}`}>
                  <Icon size={20} aria-hidden />
                </span>
                <span className="text-[11px] font-semibold leading-tight text-white/85">{homeLabels[c.slug]}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => go("app/learn/protection")}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-body-sm font-bold text-navy-950 hover:bg-white/90"
      >
        Protection explained <ArrowRight size={16} aria-hidden />
      </button>
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
