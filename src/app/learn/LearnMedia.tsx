import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  CirclePlay,
  Clock3,
  FileText,
  Heart,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Play,
  X,
} from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/cn";
import { demoLearningCategories, demoLessons } from "@/data/demo-courses";
import {
  findInfographic,
  findMedia,
  findVideo,
  editionFor,
  formatDuration,
  infographics,
  languageLabels,
  mediaTopicLabels,
  videos,
  type InfographicResource,
  type VideoResource,
} from "@/data/learn-media";
import { learnActions, useLearnProgress } from "@/state/learnProgress";
import { LessonGlyph } from "./LessonGlyph";
import { CaptionControl } from "./CaptionControl";
import { LanguageSelector } from "./LanguageSelector";
import { ProgressBar } from "@/components/ui/Progress";
import { earningRules } from "@/rewards/catalogue";
import { RewardQuiz } from "./RewardQuiz";
import { useWatchTime } from "./useWatchTime";
import type { LearningCategoryKey } from "@/types/learning";

const go = (hash: string) => {
  window.location.hash = hash;
  window.scrollTo({ top: 0 });
};
const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/** Lesson topics shown as cards (the "all" pseudo-category is the chip row's reset). */
const topics = demoLearningCategories.filter(
  (c): c is typeof c & { key: Exclude<LearningCategoryKey, "all"> } => c.key !== "all",
);
/** Live count from the lesson list — never the category's stored figure. */
const lessonCount = (key: LearningCategoryKey) =>
  key === "all" ? demoLessons.length : demoLessons.filter((l) => l.category === key).length;
/** Card gradients from the brand palette; the darkest stop sits behind the title for contrast. */
const topicTone: Record<Exclude<LearningCategoryKey, "all">, string> = {
  "financial-wellness": "from-gold-700 via-[#a57a24] to-gold-500",
  protection: "from-teal-800 via-teal-700 to-teal-500",
  "life-planning": "from-navy-900 via-navy-700 to-navy-500",
  practical: "from-crimson-700 via-crimson-600 to-crimson-400",
};

/** Supplied topic illustrations (trimmed, alpha WebP copies of ui reference/lesson/icons/*.png). */
const topicArt: Record<Exclude<LearningCategoryKey, "all">, string> = {
  "financial-wellness": "/images/learn/topics/financial-wellness.webp",
  protection: "/images/learn/topics/protection-education.webp",
  "life-planning": "/images/learn/topics/life-planning.webp",
  practical: "/images/learn/topics/practical-knowledge.webp",
};

/** Existing photos that suit a lesson's topic. Lessons without one use their bespoke glyph. */
const lessonImages: Record<string, string> = {
  "money-talks": "/images/pexels/young-friends-cafe-community.webp",
  "medical-cards": "/images/pexels/everyday-health-wellbeing.webp",
  "emergency-fund": "/images/pexels/young-professional-savings-planning.webp",
  "hospital-bills": "/images/pexels/everyday-health-wellbeing.webp",
  "income-replacement": "/images/pexels/family-protection-conversation.webp",
  "first-salary": "/images/pexels/young-professional-savings-planning.webp",
};

/**
 * Continue-learning thumbnail: the lesson's photo with its glyph as a small badge, or — when the
 * lesson has no photo or it fails to load — the glyph tile on its own. Never an empty box.
 */
function LessonCover({ id, category }: { id: string; category: string }) {
  const [failed, setFailed] = useState(false);
  const src = lessonImages[id];
  if (!src || failed) {
    return <LessonGlyph id={id} category={category} className="size-20 shrink-0 rounded-2xl ring-1 ring-white/10 sm:size-24" />;
  }
  return (
    <span className="relative block size-20 shrink-0 overflow-hidden rounded-2xl bg-navy-800 ring-1 ring-white/10 sm:size-24" aria-hidden>
      <img src={src} alt="" onError={() => setFailed(true)} className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-navy-950/5 to-transparent" />
      <LessonGlyph id={id} category={category} className="absolute bottom-1.5 left-1.5 size-8 rounded-lg shadow-e2 ring-2 ring-white/80" />
    </span>
  );
}

/* ========================================================================================== */
/* LEARN HOME                                                                                  */
/* ========================================================================================== */

export function LearnHome() {
  const progress = useLearnProgress();
  const [category, setCategory] = useState<LearningCategoryKey | "all">("all");
  const longForm = videos.find((v) => v.format === "long-form")!;
  const shorts = videos.filter((v) => v.format === "short");
  const lang = progress.language;
  const longEdition = editionFor(longForm, lang);
  const longShown = longEdition ?? editionFor(longForm, "en")!;
  const next = demoLessons.find((l) => !progress.completed.includes(l.id)) ?? demoLessons[0];
  const lessonsDone = demoLessons.filter((l) => progress.completed.includes(l.id)).length;
  const lessonsPercent = Math.round((lessonsDone / demoLessons.length) * 100);
  const lessons = category === "all" ? demoLessons : demoLessons.filter((l) => l.category === category);

  return (
    <>
      <PageHero
        eyebrow="Learn"
        title="Money basics, made clear."
        text="Short lessons, videos and visual guides on saving, health costs and protection."
        image="/images/pexels/learning-academy-students-in-library.webp"
        imagePosition="60% 30%"
        backLabel="Learn"
        onBack={() => go("app/home")}
        titleId="learn-title"
      />

      {/* Format shortcuts */}
      <Container className="-mt-4 relative">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Videos", hint: "Watch & learn", icon: Play, tone: "bg-crimson-50 text-crimson-600", target: "learn-videos" },
            { label: "Infographics", hint: "At a glance", icon: ImageIcon, tone: "bg-navy-50 text-navy-700", target: "learn-infographics" },
            { label: "Lessons", hint: "Read & reflect", icon: Layers, tone: "bg-teal-50 text-teal-700", target: "learn-lessons" },
          ].map(({ label, hint, icon: Icon, tone, target }) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToId(target)}
              className="flex min-h-[4.5rem] flex-col items-start gap-1.5 rounded-2xl bg-surface p-3 text-left shadow-e1 ring-1 ring-ink/[0.06] sm:flex-row sm:items-center"
            >
              <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-xl", tone)}>
                <Icon size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-body-sm font-semibold text-navy-950">{label}</span>
                <span className="block text-[11px] text-ink-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      </Container>

      {/* Continue learning */}
      {next && (
        <Container className="mt-5">
          <button
            type="button"
            onClick={() => go(`app/learn/lesson/${next.id}`)}
            className="group flex w-full items-center gap-4 rounded-[1.25rem] bg-navy-950 p-3.5 text-left text-white shadow-e2 transition-shadow hover:shadow-e3"
          >
            <LessonCover id={next.id} category={next.category} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">Continue learning</span>
              <span className="mt-0.5 block font-brand text-[1.375rem] font-semibold leading-tight">{next.title}</span>
              <span className="mt-1.5 flex items-center gap-2 text-caption text-white/70">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                  <span className="block h-full rounded-full bg-teal-300" style={{ width: `${lessonsPercent}%` }} />
                </span>
                {lessonsDone} of {demoLessons.length}
              </span>
            </span>
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-navy-950">
              <Play size={18} className="ml-0.5" aria-hidden />
            </span>
          </button>
        </Container>
      )}

      {/* Featured long-form lesson */}
      <Container className="mt-8" >
        <section id="learn-videos" className="scroll-mt-20" aria-labelledby="videos-title">
          <h2 id="videos-title" className="font-brand text-[1.875rem] font-semibold text-navy-950">Video lessons</h2>
          <LanguageSelector className="mt-2" />
          {lang !== "en" && (
            <p className="mt-2 text-caption text-ink-muted">
              {longEdition
                ? `The foundation lesson is available in ${languageLabels[lang].label}. Quick explainers and text lessons are in English for now.`
                : `Not yet available in ${languageLabels[lang].label}.`}
            </p>
          )}
          <button
            type="button"
            onClick={() => go(`app/learn/video/${longForm.id}`)}
            className="group mt-3 block w-full overflow-hidden rounded-[1.25rem] bg-surface text-left shadow-e1 ring-1 ring-ink/[0.06]"
          >
            <span className="relative block aspect-video">
              <img src={longShown.poster} alt="" className="ge-skeleton h-full w-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" aria-hidden />
              <span className="absolute left-3 top-3 rounded-md bg-crimson-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white">Foundation lesson</span>
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-caption font-semibold text-white">
                <Clock3 size={12} aria-hidden /> {formatDuration(longShown.seconds)} · {languageLabels[longShown.lang].native}
              </span>
              <span className="absolute left-1/2 top-1/2 inline-flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-950 shadow-e3 transition-transform group-hover:scale-105">
                <Play size={24} className="ml-1" aria-hidden />
              </span>
            </span>
            <span className="block p-4">
              <span lang={languageLabels[longShown.lang].htmlLang} className="block font-brand text-[1.5rem] font-semibold leading-tight text-navy-950">{longShown.title}</span>
              <span className="mt-1 block text-body-sm text-ink-secondary">{longForm.description}</span>
            </span>
          </button>

          <h3 className="mt-6 text-subheading text-navy-950">Quick explainers</h3>
          <ul className="-mx-5 mt-3 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 scrollbar-none">
            {shorts.map((v) => (
              <li key={v.id} className="w-[9.5rem] shrink-0 snap-start sm:w-[11rem]">
                <button type="button" onClick={() => go(`app/learn/video/${v.id}`)} className="group block w-full text-left">
                  <span className="relative block aspect-[9/16] overflow-hidden rounded-2xl bg-navy-900">
                    <img src={v.poster} alt="" loading="lazy" className="ge-skeleton h-full w-full object-cover" />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent" aria-hidden />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-caption font-semibold text-white">
                      <Play size={12} aria-hidden /> {formatDuration(v.seconds)}
                    </span>
                    {progress.completed.includes(v.id) && (
                      <CheckCircle2 size={20} className="absolute right-2 top-2 text-success-600 drop-shadow" aria-label="Watched" />
                    )}
                    {lang !== "en" && (
                      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                        English only
                      </span>
                    )}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-body-sm font-semibold text-navy-950">{v.title}</span>
                  <span className="text-caption text-ink-muted">{mediaTopicLabels[v.topic]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      {/* Infographics */}
      <Container className="mt-8">
        <section id="learn-infographics" className="scroll-mt-20" aria-labelledby="ig-title">
          <h2 id="ig-title" className="font-brand text-[1.875rem] font-semibold text-navy-950">Infographics</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {infographics.map((g) => (
              <li key={g.id}>
                <button type="button" onClick={() => go(`app/learn/infographic/${g.id}`)} className="group block w-full text-left">
                  <span className="ge-skeleton relative block aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-ink/[0.06]">
                    <img
                      src={g.thumb}
                      alt=""
                      loading="lazy"
                      className={cn("h-full w-full transition-transform duration-500 group-hover:scale-[1.03]", g.orientation === "portrait" ? "object-cover object-top" : "object-contain p-2")}
                    />
                    {progress.completed.includes(g.id) && (
                      <CheckCircle2 size={20} className="absolute right-2 top-2 rounded-full bg-white text-success-600" aria-label="Viewed" />
                    )}
                  </span>
                  <span className="mt-2 line-clamp-2 block text-body-sm font-semibold text-navy-950">{g.title}</span>
                  <span className="text-caption text-ink-muted">{mediaTopicLabels[g.topic]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </Container>

      {/* All lessons */}
      <Container className="mt-8">
        <section id="learn-lessons" className="scroll-mt-20" aria-labelledby="lessons-title">
          <h2 id="lessons-title" className="font-brand text-[1.875rem] font-semibold text-navy-950">All lessons</h2>
          <p className="mt-0.5 text-body-sm text-ink-secondary">Build your financial protection knowledge, one topic at a time.</p>
          <div className="-mx-5 mt-3 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 py-1.5 scrollbar-none" role="tablist" aria-label="Lesson topics">
            {[{ key: "all" as const, label: "All", icon: undefined }, ...topics.map((c) => ({ key: c.key, label: c.label, icon: c.icon }))].map((c) => {
              const count = lessonCount(c.key);
              if (!count) return null;
              const selected = category === c.key;
              const Icon = c.icon;
              return (
                <button
                  key={c.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setCategory(c.key)}
                  className={cn(
                    "inline-flex h-11 shrink-0 snap-start items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold transition-[background-color,color,box-shadow] duration-300",
                    selected ? "bg-navy-900 text-white shadow-e2" : "bg-surface text-navy-900 shadow-e1 ring-1 ring-ink/[0.08] hover:bg-navy-50",
                  )}
                >
                  {Icon && <Icon size={16} aria-hidden />}
                  {c.label}
                  <span className={cn("text-caption", selected ? "text-white/70" : "text-ink-muted")}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Topic cards: a visual way into the same filter. Counts come from the lesson list. */}
          <ul className="mt-3 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {topics.map((c) => {
              const count = lessonCount(c.key);
              if (!count) return null;
              const selected = category === c.key;
              const saved = demoLessons.filter((l) => l.category === c.key && progress.bookmarked.includes(l.id)).length;
              const unit = count === 1 ? "Lesson" : "Lessons";
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${c.label}: ${count} ${unit.toLowerCase()}${saved ? `, ${saved} saved` : ""}. ${selected ? "Showing this topic." : "Show this topic."}`}
                    onClick={() => setCategory(selected ? "all" : c.key)}
                    className={cn(
                      "ge-lift group relative flex h-full min-h-[12rem] w-full flex-col items-start justify-start overflow-hidden rounded-[1.25rem] bg-gradient-to-br p-4 text-left text-white shadow-e2 md:min-h-[12rem] md:p-5 lg:min-h-[12.5rem] lg:p-4",
                      topicTone[c.key],
                      selected && "ring-[3px] ring-navy-950 ring-offset-2 ring-offset-canvas",
                    )}
                  >
                    {/* Layered background shapes */}
                    <span className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-white/10" aria-hidden />
                    <span className="pointer-events-none absolute -bottom-20 -left-12 size-40 rounded-full bg-black/[0.07]" aria-hidden />
                    <span className="pointer-events-none absolute -bottom-6 -right-6 size-32 rounded-full bg-white/20 blur-2xl md:size-40" aria-hidden />
                    {/* Supplied illustration: contained (never stretched or cropped), anchored bottom-right. */}
                    <img
                      src={topicArt[c.key]}
                      alt=""
                      decoding="async"
                      className="pointer-events-none absolute bottom-2 right-2 h-[45%] w-[66%] object-contain object-right-bottom drop-shadow-[0_10px_14px_rgb(10_28_51/0.3)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.04] md:bottom-3 md:right-4 md:h-[60%] md:w-[46%] lg:right-3 lg:h-[46%] lg:w-[48%]"
                    />
                    <span className={cn("relative block text-[1.125rem] font-bold leading-[1.2] [text-shadow:0_1px_2px_rgb(10_28_51/0.25)] md:text-[1.25rem]", saved > 0 && "pr-9")}>
                      {c.label}
                    </span>
                    {saved > 0 && (
                      <span className="absolute right-3 top-3 inline-flex h-7 items-center gap-1 rounded-full bg-white/95 px-2 text-[11px] font-bold text-crimson-600 shadow-e1" aria-hidden>
                        <Heart size={13} className="fill-crimson-600" /> {saved}
                      </span>
                    )}
                    <span className="relative mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/95 py-1 pl-1.5 pr-2.5 text-caption font-semibold text-navy-950 shadow-e1">
                      <CirclePlay size={16} className="text-crimson-600" aria-hidden />
                      {count} {unit}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <ul key={category} className="ge-reveal mt-5 grid gap-2.5">
            {lessons.map((lesson) => {
              const done = progress.completed.includes(lesson.id);
              const saved = progress.bookmarked.includes(lesson.id);
              return (
                <li key={lesson.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-ink/[0.07]">
                  <button type="button" onClick={() => go(`app/learn/lesson/${lesson.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <LessonGlyph id={lesson.id} category={lesson.category} className="size-14 shrink-0" />
                    <span className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">{lesson.categoryLabel}</span>
                      <span className="mt-0.5 block font-brand text-[1.1875rem] font-semibold leading-tight text-navy-950">{lesson.title}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-caption text-ink-muted">
                        <Clock3 size={12} aria-hidden /> {lesson.minutes} min read
                        {done && <span className="ml-1 inline-flex items-center gap-0.5 font-semibold text-success-700"><CheckCircle2 size={12} aria-hidden /> Completed</span>}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => learnActions.toggleBookmark(lesson.id)}
                    aria-pressed={saved}
                    aria-label={saved ? `Remove ${lesson.title} from saved` : `Save ${lesson.title}`}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-navy-900 hover:bg-navy-50"
                  >
                    {saved ? <BookmarkCheck size={20} className="text-crimson-600" aria-hidden /> : <Bookmark size={20} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </Container>
    </>
  );
}

/* ========================================================================================== */
/* VIDEO LESSON                                                                                */
/* ========================================================================================== */

export function VideoLessonView({ id }: { id: string }) {
  const video = findVideo(id)!;
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useLearnProgress();
  const done = progress.completed.includes(id);
  const portrait = video.orientation === "portrait";
  const lang = progress.language;
  const selected = editionFor(video, lang);
  const playing = selected ?? editionFor(video, "en")!;
  const missing = !selected;
  // Points depend on valid watch time, never on reaching the end (seeking there doesn't count).
  const watch = useWatchTime(videoRef, id, playing.lang);
  const earned = watch.justEarned !== null ? `+${watch.justEarned} pts for watching this video` : null;

  useEffect(() => {
    if (watch.earned && !done) learnActions.complete(id);
  }, [watch.earned, done, id]);

  return (
    <div className={cn("pb-4", portrait ? "bg-navy-950" : "")}>
      <Container className={cn("pt-4", portrait && "text-white")}>
        <button
          type="button"
          onClick={() => go("app/learn")}
          className={cn("-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold", portrait ? "text-white/80 hover:text-white" : "text-navy-900")}
        >
          <ArrowLeft size={18} aria-hidden /> Learn
        </button>
      </Container>

      <Container className={cn("pt-1", portrait ? "max-w-[22rem]" : "max-w-[60rem]")}>
        <LanguageSelector dark={portrait} />
        {missing && (
          <p
            role="status"
            className={cn("mt-2 rounded-xl px-3 py-2 text-caption font-semibold", portrait ? "bg-white/10 text-white" : "bg-gold-50 text-gold-700")}
          >
            This video isn't available in {languageLabels[lang].label}. You're watching the English version.
          </p>
        )}
      </Container>

      <div className={cn(portrait ? "mx-auto mt-2 w-full max-w-[22rem] px-5" : "mx-auto mt-2 w-full max-w-[60rem] sm:px-8 lg:px-12")}>
        <video
          ref={videoRef}
          key={`${video.id}-${playing.lang}`}
          lang={languageLabels[playing.lang].htmlLang}
          controls
          crossOrigin="anonymous"
          playsInline
          preload="metadata"
          poster={playing.poster}
          onPlay={() => learnActions.start(id)}
          className={cn("block w-full bg-black", portrait ? "aspect-[9/16] rounded-[1.25rem]" : "aspect-video sm:rounded-[1.25rem]")}
        >
          <source src={playing.src} type="video/mp4" />
          {video.captions?.map((c, i) => (
            <track key={c.src} kind="subtitles" src={c.src} srcLang={c.lang} label={c.label} default={i === 0 && c.default} />
          ))}
          Your browser can't play this video.
        </video>
      </div>

      <Container className={cn("max-w-[44rem] pt-5", portrait && "text-white")}>
        <p className={cn("text-overline uppercase tracking-[0.2em]", portrait ? "text-teal-200" : "text-teal-700")}>
          {video.format === "long-form" ? "Foundation lesson" : "Quick explainer"} · {mediaTopicLabels[video.topic]} · {formatDuration(playing.seconds)} · {languageLabels[playing.lang].native}
        </p>
        <h1 className={cn("mt-2 font-brand text-[2rem] font-semibold leading-tight", portrait ? "text-white" : "text-navy-950")}><span lang={languageLabels[playing.lang].htmlLang}>{playing.title}</span></h1>
        <p className={cn("mt-2 text-body", portrait ? "text-white/80" : "text-ink-secondary")}>
          {playing.lang === "en"
            ? video.description
            : `Foundation lesson in ${languageLabels[playing.lang].label}: an introduction to insurance in Malaysia.`}
        </p>
        <div className="mt-3">
          <CaptionControl videoRef={videoRef} dark={portrait} />
        </div>
        {watch.earned ? (
          <p className={cn("mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-caption font-bold", portrait ? "bg-white/10 text-white" : "bg-success-50 text-success-700")} role="status">
            <CheckCircle2 size={14} aria-hidden /> {earned ?? "Watched · points earned"}
          </p>
        ) : watch.required > 0 ? (
          <div className={cn("mt-4 rounded-2xl p-4", portrait ? "bg-white/10" : "bg-surface ring-1 ring-ink/[0.07]")}>
            <ProgressBar
              value={watch.watched}
              max={watch.required}
              tone={portrait ? "white" : "teal"}
              size="sm"
              onDark={portrait}
              label="Watch progress"
              valueLabel={`${formatDuration(watch.watched)} / ${formatDuration(watch.required)}`}
            />
            <p className={cn("mt-2 text-caption", portrait ? "text-white/70" : "text-ink-muted")}>
              Earn {earningRules["video-finished"].points} pts once you've watched the whole video. Only time spent watching counts — skipping ahead,
              pauses and time on other tabs don't. You can finish over several visits.
            </p>
            {watch.error && (
              <p role="status" className={cn("mt-1.5 text-caption font-semibold", portrait ? "text-gold-300" : "text-gold-700")}>
                {watch.error} Your progress will be saved again shortly.
              </p>
            )}
          </div>
        ) : null}
      </Container>

      {video.summary && playing.lang !== "en" && (
        <Container className="max-w-[44rem] pt-6">
          <p className="rounded-2xl bg-surface p-4 text-body-sm text-ink-secondary ring-1 ring-ink/[0.07]">
            Key takeaways are written for the English video only. This {languageLabels[playing.lang].label} edition is a separate recording.
          </p>
        </Container>
      )}
      {video.summary && playing.lang === "en" && (
        <Container className="max-w-[44rem] pt-6">
          <section className="rounded-2xl bg-surface p-5 ring-1 ring-ink/[0.07]">
            <h2 className="text-subheading text-navy-950">Key takeaways</h2>
            <p className="text-caption text-ink-muted">Lesson summary by GREAT EMPOWER — not a transcript.</p>
            <ol className="mt-3 grid gap-2.5">
              {video.summary.map((point, i) => (
                <li key={point} className="grid grid-cols-[1.5rem_1fr] text-body-sm text-ink-secondary">
                  <span className="font-brand text-[1.125rem] font-semibold text-crimson-600">{i + 1}</span>
                  {point}
                </li>
              ))}
            </ol>
          </section>
        </Container>
      )}

      <Related ids={video.related} dark={portrait} />
    </div>
  );
}

/* ========================================================================================== */
/* INFOGRAPHIC                                                                                 */
/* ========================================================================================== */

export function InfographicDetailView({ id }: { id: string }) {
  const g = findInfographic(id)!;
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Opening an infographic starts it; passing its quiz (perfect score) completes it and pays.
  useEffect(() => {
    learnActions.start(id);
  }, [id]);

  return (
    <div className="pb-4">
      <Container className="max-w-[44rem] pt-4">
        <button type="button" onClick={() => go("app/learn")} className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-body-sm font-semibold text-navy-900">
          <ArrowLeft size={18} aria-hidden /> Learn
        </button>
        <p className="mt-2 text-overline uppercase tracking-[0.2em] text-teal-700">Infographic · {mediaTopicLabels[g.topic]}</p>
        <h1 className="mt-2 font-brand text-[2rem] font-semibold leading-tight text-navy-950">{g.title}</h1>
        <p className="mt-1 text-body text-ink-secondary">{g.description}</p>
      </Container>
      <Container className="max-w-[44rem] pt-4">
        <button
          type="button"
          onClick={() => dialogRef.current?.showModal()}
          className="group relative block w-full overflow-hidden rounded-2xl ring-1 ring-ink/10"
          aria-label={`Zoom into ${g.title}`}
        >
          <img src={g.full} alt={`${g.title}. ${g.description}`} width={g.width} height={g.height} className="ge-skeleton block h-auto w-full" />
          <span className="absolute right-3 top-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-950/80 px-3 text-caption font-semibold text-white">
            <Maximize2 size={14} aria-hidden /> Zoom
          </span>
        </button>
        <p className="mt-2 text-caption text-ink-muted">General education. Product features vary by insurer — check the policy wording.</p>
      </Container>
      <Container className="max-w-[44rem] pt-6">
        <RewardQuiz key={id} kind="infographic-viewed" contentId={id} onPassed={() => learnActions.complete(id)} />
      </Container>

      <dialog
        ref={dialogRef}
        aria-label={`${g.title}, zoomed`}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="m-0 h-full max-h-none w-full max-w-none bg-navy-950/95 p-0 backdrop:bg-navy-950/80"
      >
        <div className="sticky top-0 z-10 flex justify-end p-3">
          <button type="button" autoFocus onClick={() => dialogRef.current?.close()} aria-label="Close" className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X size={20} aria-hidden />
          </button>
        </div>
        <div className="overflow-auto px-3 pb-6">
          <img
            src={g.full}
            alt={g.title}
            className={cn("mx-auto block h-auto max-w-none", g.orientation === "portrait" ? "w-[max(100%,44rem)] lg:w-[56rem]" : "w-[max(100%,72rem)]")}
          />
        </div>
      </dialog>

      <Related ids={g.related} />
    </div>
  );
}

function Related({ ids, dark }: { ids: string[]; dark?: boolean }) {
  const items = ids.map(findMedia).filter(Boolean) as Array<VideoResource | InfographicResource>;
  if (!items.length) return null;
  return (
    <Container className="max-w-[44rem] pt-7">
      <h2 className={cn("text-subheading", dark ? "text-white" : "text-navy-950")}>Keep learning</h2>
      <ul className="mt-3 grid gap-2.5">
        {items.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => go(`app/learn/${m.kind}/${m.id}`)}
              className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left ring-1", dark ? "bg-white/5 ring-white/10" : "bg-surface ring-ink/[0.07]")}
            >
              <img src={m.kind === "video" ? m.poster : m.thumb} alt="" loading="lazy" className="size-14 shrink-0 rounded-xl object-cover object-top" />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[10px] font-bold uppercase tracking-[0.1em]", dark ? "text-teal-200" : "text-teal-700")}>
                  {m.kind === "video" ? `Video · ${formatDuration(m.seconds)}` : "Infographic"}
                </span>
                <span className={cn("block text-body-sm font-semibold", dark ? "text-white" : "text-navy-950")}>{m.title}</span>
              </span>
              <ArrowRight size={18} className={dark ? "text-white/60" : "text-navy-900"} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </Container>
  );
}
