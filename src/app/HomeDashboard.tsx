import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { Band, Chapter, Container, TextLink } from "@/components/layout/Editorial";
import { LessonArt } from "@/components/cards/LearnCards";
import { LifeTrackPoster } from "./lifetrack/LifeTrackLauncher";
import { demoUser } from "@/data/demo-user";
import { demoLearning } from "@/data/demo-learning";
import { demoLessons } from "@/data/demo-courses";

export type DashboardDestination = "home" | "learn" | "simulate" | "analyze" | "guide" | "rewards";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// The three-step story below restates the documented, Engine 2-calculated illustrative scenario
// used in the simulator's acceptance tests (inpatient, waiting-period gate, MYR 500.00 bill,
// RM200.00 external employer payment). It is labelled illustrative on the page.
const story = [
  { figure: "500", label: "Hospital bill", note: "An inpatient stay" },
  { figure: "200", label: "Employer pays", note: "In this scenario" },
  { figure: "300", label: "Left for you", note: "Patient payable", accent: true },
];

const featuredLessons = ["hospital-bills", "emergency-fund", "first-salary"]
  .map((id) => demoLessons.find((lesson) => lesson.id === id))
  .filter((lesson): lesson is (typeof demoLessons)[number] => Boolean(lesson));

export function HomeDashboard({
  onNavigate,
  profileName = demoUser.name,
}: {
  onNavigate: (destination: DashboardDestination) => void;
  profileName?: string;
}) {
  const [heroPhotoUnavailable, setHeroPhotoUnavailable] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      {/* HERO — one headline, one message, one dominant action */}
      <Band tone="night" flush labelledBy="home-title" className="relative overflow-hidden">
        <div className="grid md:min-h-[640px] lg:min-h-[calc(100svh-72px)] lg:grid-cols-[7fr_5fr]">
          <div className="flex flex-col justify-between gap-12 px-5 pb-12 pt-14 sm:px-8 lg:pl-[max(3rem,calc((100vw-1200px)/2+3rem))] lg:pr-12 lg:pt-24">
            <div>
              <p className="text-overline uppercase tracking-[0.16em] text-teal-200">
                {greeting}, {profileName}
              </p>
              <h1 id="home-title" className="mt-6 max-w-[11ch] font-brand text-mega text-white">
                Protect your tomorrow, starting today.
              </h1>
              <p className="mt-7 max-w-md text-lede text-white/75">
                Learn how money and protection really work — before you need them.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
                <button
                  type="button"
                  onClick={() => onNavigate("learn")}
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-crimson-600 px-7 text-body font-semibold text-white transition-colors hover:bg-crimson-700"
                >
                  Start learning
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </button>
                <TextLink onDark onClick={() => onNavigate("simulate")}>
                  Try the claim simulator
                </TextLink>
              </div>
            </div>
            <button
              type="button"
              onClick={() => go("app/learn/lesson/hospital-bills")}
              className="group flex max-w-md items-center gap-4 border-t border-white/15 pt-5 text-left"
            >
              <span className="text-caption uppercase tracking-[0.14em] text-white/55">
                Up next
              </span>
              <span className="min-w-0 flex-1 text-body-sm font-semibold text-white">
                {demoLearning.nextLesson.title}
                <span className="font-normal text-white/55">
                  {" "}
                  · {demoLearning.nextLesson.minutes} min
                </span>
              </span>
              <ArrowRight
                size={18}
                className="shrink-0 text-white/70 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-navy-900 sm:aspect-[16/9] lg:aspect-auto">
            {heroPhotoUnavailable ? (
              <div className="absolute inset-0 bg-navy-900" aria-hidden />
            ) : (
              <img
                src="/images/pexels/young-asian-students-learning-together.webp"
                alt="Three young Asian women studying together with laptops outdoors."
                width={1800}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setHeroPhotoUnavailable(true)}
                className="absolute inset-0 h-full w-full object-cover object-[55%_22%]"
              />
            )}
            <span className="absolute inset-y-0 left-0 w-1.5 bg-crimson-600" aria-hidden />
          </div>
        </div>
      </Band>

      {/* 01 — WHY PROTECTION MATTERS: one illustrative story told in figures */}
      <Band tone="paper" labelledBy="why-title">
        <Container>
          <Chapter
            number="01"
            label="Why it matters"
            id="why-title"
            title="One hospital bill can undo months of saving."
          />
          <ol className="mt-12 grid grid-cols-3 gap-4 sm:mt-14 sm:gap-0">
            {story.map(({ figure, label, note, accent }, index) => (
              <li
                key={label}
                className="flex flex-col sm:border-l sm:border-ink/15 sm:pl-8 sm:first:border-l-0 sm:first:pl-0"
              >
                <span className="text-caption font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {String(index + 1).padStart(2, "0")} · {label}
                </span>
                <span
                  className={`mt-3 font-brand text-[2.75rem] leading-none tabular-nums sm:text-figure ${accent ? "text-crimson-600" : "text-navy-950"}`}
                >
                  <span className="block text-body font-semibold sm:inline sm:align-top sm:text-chapter sm:font-medium">
                    RM
                  </span>
                  {figure}
                </span>
                <span className="mt-2 text-body-sm text-ink-secondary">{note}</span>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-caption text-ink-muted">
              Illustrative simulator example (inpatient, waiting-period scenario). Not a quote or
              claim decision.
            </p>
            <TextLink onClick={() => onNavigate("simulate")}>Run it yourself</TextLink>
          </div>
        </Container>
      </Band>

      {/* 02 — LEARN THE ESSENTIALS: a short rail, not a grid */}
      <Band tone="canvas" labelledBy="learn-title">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Chapter
              number="02"
              label="Learn the essentials"
              id="learn-title"
              title="Short lessons. One idea each."
            />
            <TextLink onClick={() => onNavigate("learn")}>All lessons</TextLink>
          </div>
        </Container>
        <div className="mt-12 overflow-x-auto pb-4 [scrollbar-width:thin]">
          <ol className="flex w-max gap-5 px-5 sm:px-8 lg:pl-[max(3rem,calc((100vw-1200px)/2+3rem))] lg:pr-12">
            {featuredLessons.map((lesson, index) => (
              <li key={lesson.id} className="w-[78vw] max-w-[360px] sm:w-[340px]">
                <button
                  type="button"
                  onClick={() => go(`app/learn/lesson/${lesson.id}`)}
                  className="ge-lift group flex w-full flex-col text-left"
                >
                  <span className="relative block aspect-[4/3] overflow-hidden">
                    <LessonArt art={lesson.art ?? "shield"} tone={lesson.tone ?? "teal"} />
                    <span className="absolute left-4 top-4 font-brand text-chapter text-navy-950/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="mt-4 text-caption font-semibold uppercase tracking-[0.12em] text-teal-700">
                    {lesson.categoryLabel}
                  </span>
                  <span className="mt-1 font-brand text-serif-title text-navy-950 group-hover:underline group-hover:underline-offset-4">
                    {lesson.title}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-body-sm text-ink-muted">
                    <Clock3 size={14} aria-hidden /> {lesson.minutes} min
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Band>

      {/* 03 — EXPLORE YOUR SITUATION: one oversized figure */}
      <Band tone="night" labelledBy="gap-title">
        <Container className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-end">
          <Chapter
            number="03"
            label="See where you stand"
            id="gap-title"
            onDark
            title="Most of the gap is invisible until you measure it."
          />
          <div>
            <p className="font-brand text-figure tabular-nums text-white">
              40<span className="text-chapter text-white/60">%</span>
            </p>
            <div className="mt-4 h-2 w-full bg-white/10" aria-hidden>
              <div className="h-full w-[40%] bg-teal-300" />
            </div>
            <p className="mt-5 max-w-md text-body text-white/75">
              of a reference income need is covered in our sample profile.
            </p>
            <TextLink onDark className="mt-4" onClick={() => onNavigate("analyze")}>
              Read the analysis
            </TextLink>
          </div>
        </Container>
      </Band>

      {/* 04 — USE THE TOOLS */}
      <Band tone="paper" labelledBy="tools-title">
        <Container>
          <Chapter
            number="04"
            label="Try it safely"
            id="tools-title"
            title="Practise the hard moments."
          />
          <div className="mt-12 grid gap-0 md:grid-cols-2">
            {[
              {
                title: "Medical claim simulator",
                text: "Divide a hypothetical bill, stage by stage.",
                action: () => go("app/simulate"),
                cta: "Open simulator",
              },
              {
                title: "Emergency fund",
                text: "Months of essentials your savings would cover.",
                action: () => {
                  go("app/simulate");
                  window.setTimeout(
                    () =>
                      document
                        .getElementById("simulate-calculators")
                        ?.scrollIntoView({ behavior: "smooth" }),
                    400,
                  );
                },
                cta: "Size your buffer",
              },
            ].map(({ title, text, action, cta }) => (
              <div
                key={title}
                className="border-t border-ink/15 py-8 md:pr-10 md:[&:nth-child(2)]:border-l md:[&:nth-child(2)]:pl-10 md:[&:nth-child(2)]:pr-0"
              >
                <h3 className="font-brand text-serif-title text-navy-950">{title}</h3>
                <p className="mt-3 max-w-sm text-body text-ink-secondary">{text}</p>
                <TextLink className="mt-4" onClick={action}>
                  {cta}
                </TextLink>
              </div>
            ))}
          </div>
        </Container>
      </Band>

      {/* 05 — THE GAME: a destination of its own */}
      <LifeTrackPoster number="05" />
    </>
  );
}
