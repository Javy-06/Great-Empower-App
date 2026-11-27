import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CheckCircle2, Clock3 } from "lucide-react";
import { ProgressBar } from "@/components/ui/Progress";
import { LessonArt } from "@/components/cards/LearnCards";
import { Band, Chapter, Container, TextLink } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import { demoLearningCategories, demoLessons, protectionPurposes } from "@/data/demo-courses";
import type { LearningCategoryKey, LearningLesson } from "@/types/learning";
import { findInfographic, findVideo } from "@/data/learn-media";
import { learnActions, useLearnProgress } from "@/state/learnProgress";
import { InfographicDetailView, LearnHome, VideoLessonView } from "./learn/LearnMedia";
import { ProtectionExplained } from "./protection/ProtectionHub";
import { ProductExplorer } from "./protection/ProductExplorer";
import { findProtectionCategory, type ProtectionSlug } from "@/data/protection";
import { RewardQuiz } from "./learn/RewardQuiz";
import { cn } from "@/lib/cn";

type LearnRoute =
  | { view: "dashboard" }
  | { view: "video"; id: string }
  | { view: "infographic"; id: string }
  | { view: "category"; category: LearningCategoryKey }
  | { view: "lesson"; lessonId: string }
  | { view: "protection"; slug?: ProtectionSlug }
  | { view: "products" };

function readLearnRoute(): LearnRoute {
  const hash = window.location.hash.replace(/^#/, "").split("?")[0]; // "?format=…" is read by the Learn view itself
  const segments = hash.split("/");
  if (segments[0] === "app" && segments[1] === "learn") {
    if (segments[2] === "category" && segments[3]) {
      const category = demoLearningCategories.find((item) => item.key === segments[3]);
      if (category) return { view: "category", category: category.key };
    }
    if (segments[2] === "protection") {
      if (!segments[3]) return { view: "protection" };
      if (segments[3] === "products") return { view: "products" };
      const found = findProtectionCategory(segments[3]);
      if (found) return { view: "protection", slug: found.slug };
      return { view: "protection" };
    }
    if (segments[2] === "video" && segments[3] && findVideo(segments[3]))
      return { view: "video", id: segments[3] };
    if (segments[2] === "infographic" && segments[3] && findInfographic(segments[3]))
      return { view: "infographic", id: segments[3] };
    if (segments[2] === "lesson" && segments[3]) {
      if (demoLessons.some((lesson) => lesson.id === segments[3])) {
        return { view: "lesson", lessonId: segments[3] };
      }
    }
  }
  return { view: "dashboard" };
}

function navigateToLearn(route: LearnRoute) {
  if (route.view === "category") window.location.hash = `app/learn/category/${route.category}`;
  else if (route.view === "lesson") window.location.hash = `app/learn/lesson/${route.lessonId}`;
  else window.location.hash = "app/learn";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function lessonStatus(lesson: LearningLesson, started: Set<string>, completed: Set<string>) {
  if (completed.has(lesson.id)) return "Completed" as const;
  if (started.has(lesson.id)) return "In progress" as const;
  return "Upcoming" as const;
}

const lessonKeyPoints: Record<string, string[]> = {
  "money-talks": [
    "Agree on a budget before making shared plans, and make room for different spending limits.",
    "A clear split can be equal or based on what each person can comfortably contribute.",
    "Keep the conversation practical and revisit the arrangement when circumstances change.",
  ],
  "medical-cards": [
    "Medical and health cover is generally designed for eligible healthcare costs, subject to the policy or certificate.",
    "Benefits can have limits, exclusions, waiting periods, deductibles or co-payments. The exact terms matter.",
    "Medical cover does not automatically replace salary or other income.",
  ],
  "emergency-fund": [
    "An emergency reserve can help cover unexpected costs or a temporary change in income.",
    "A useful target depends on personal circumstances, essential costs and available support.",
    "The calculator is illustrative. It does not assess your situation or guarantee an outcome.",
  ],
  "hospital-bills": [
    "Hospital bills can include accommodation, treatment, procedures and other services.",
    "Whether a cost is covered depends on the specific plan terms, limits, exclusions and claim assessment.",
    "Medical cover relates to eligible healthcare costs; it is not automatically income replacement.",
  ],
  "income-replacement": [
    "Income protection is a broad planning purpose. Different benefits can have different qualifying events and payment methods.",
    "A critical illness benefit may be a defined lump sum if the policy conditions are met; it does not automatically match salary.",
    "Medical reimbursement, hospital income and disability income are different benefit types. Review the relevant terms and limits.",
  ],
  "first-salary": [
    "A first payslip is a good place to identify take-home pay, regular commitments and near-term goals.",
    "Budgets are personal. Track actual spending before making assumptions about what is affordable.",
    "The figures in this demo are examples and are not personal financial recommendations.",
  ],
  deductibles: [
    "A deductible is an amount you may need to pay before some benefits apply; a co-payment is a share of eligible costs.",
    "Limits and exclusions can also affect what a plan pays.",
    "Definitions and amounts vary. Check the policy or certificate wording for the specific arrangement.",
  ],
};


type RelatedLink = { kind: string; label: string; href: string };
const defaultRelated: RelatedLink[] = [
  { kind: "Video", label: "What is insurance?", href: "app/learn/video/what-is-insurance" },
];
/** Links each text lesson to the most relevant video, infographic or guide. */
const lessonRelated: Record<string, RelatedLink[]> = {
  "hospital-bills": [
    { kind: "Infographic", label: "Medical insurance in Malaysia", href: "app/learn/infographic/medical-insurance-malaysia" },
    { kind: "Guide", label: "How to make a medical claim", href: "app/guide/article/make-a-claim" },
  ],
  "medical-cards": [
    { kind: "Infographic", label: "Medical insurance in Malaysia", href: "app/learn/infographic/medical-insurance-malaysia" },
    { kind: "Video", label: "How insurance actually works in Malaysia", href: "app/learn/video/how-insurance-works-in-malaysia" },
  ],
  deductibles: [
    { kind: "Guide", label: "Deductible, co-payment and annual limit explained", href: "app/guide/article/cost-sharing-explained" },
    { kind: "Simulate", label: "Try the medical bill simulator", href: "app/simulate/needs/tool-bill" },
  ],
  "income-replacement": [
    { kind: "Infographic", label: "Life insurance in Malaysia", href: "app/learn/infographic/life-insurance-malaysia" },
    { kind: "Infographic", label: "Critical illness insurance in Malaysia", href: "app/learn/infographic/critical-illness-malaysia" },
  ],
  "emergency-fund": [
    { kind: "Guide", label: "Building an emergency fund", href: "app/guide/article/emergency-fund" },
    { kind: "Simulate", label: "Size your emergency fund", href: "app/simulate/needs/tool-fund" },
  ],
  "first-salary": [{ kind: "Guide", label: "Starting your first job", href: "app/guide/article/first-job" }],
  "money-talks": [{ kind: "Video", label: "How risk pooling powers insurance", href: "app/learn/video/risk-pooling-powers-insurance" }],
};

/** Topic index: text tabs, not tiles. */
function TopicTabs({ active }: { active: LearningCategoryKey | null }) {
  return (
    <nav aria-label="Learning topics" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 border-b border-ink/15 sm:w-auto sm:flex-wrap">
        {demoLearningCategories.map((category) => {
          const isActive = category.key === active || (active === null && category.key === "all");
          return (
            <li key={category.key}>
              <button
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() =>
                  category.key === "all" && active === null
                    ? undefined
                    : navigateToLearn({ view: "category", category: category.key })
                }
                className={cn(
                  "relative inline-flex h-12 items-center whitespace-nowrap px-3 text-body-sm font-semibold transition-colors",
                  isActive ? "text-navy-950" : "text-ink-muted hover:text-navy-900",
                )}
              >
                {category.label}
                <span className="ml-1.5 text-caption font-normal tabular-nums text-ink-muted">
                  {category.lessonCount}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 -bottom-px h-0.5",
                    isActive ? "bg-crimson-600" : "bg-transparent",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Numbered editorial index of lessons — replaces the card grid. */
function LessonIndex({
  lessons,
  bookmarked,
  onBookmark,
  started,
  completed,
}: {
  lessons: LearningLesson[];
  bookmarked: Set<string>;
  onBookmark: (lessonId: string) => void;
  started: Set<string>;
  completed: Set<string>;
}) {
  if (!lessons.length)
    return <p className="py-8 text-body text-ink-secondary">No lessons in this topic yet.</p>;
  return (
    <ol className="border-t border-ink/15">
      {lessons.map((lesson, index) => {
        const status = lessonStatus(lesson, started, completed);
        const saved = bookmarked.has(lesson.id);
        return (
          <li
            key={lesson.id}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-5 border-b border-ink/15 py-5 sm:gap-x-8"
          >
            <span className="w-10 font-brand text-serif-title tabular-nums text-ink-muted sm:w-14">
              {String(index + 1).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => navigateToLearn({ view: "lesson", lessonId: lesson.id })}
              className="min-w-0 text-left"
            >
              <span className="block font-brand text-serif-title text-navy-950 group-hover:underline group-hover:underline-offset-4">
                {lesson.title}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-muted">
                <span>{lesson.categoryLabel}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={13} aria-hidden /> {lesson.minutes} min
                </span>
                {status !== "Upcoming" && (
                  <span
                    className={
                      status === "Completed"
                        ? "font-semibold text-teal-700"
                        : "font-semibold text-navy-800"
                    }
                  >
                    {status}
                  </span>
                )}
              </span>
            </button>
            <button
              type="button"
              aria-pressed={saved}
              aria-label={
                saved ? `Remove bookmark for ${lesson.title}` : `Bookmark ${lesson.title}`
              }
              onClick={() => onBookmark(lesson.id)}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full transition-colors",
                saved ? "text-crimson-600" : "text-ink-muted hover:text-navy-900",
              )}
            >
              {saved ? <BookmarkCheck size={20} aria-hidden /> : <Bookmark size={20} aria-hidden />}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function LearnDashboard() {
  const [route, setRoute] = useState<LearnRoute>(readLearnRoute);
  const learnProgress = useLearnProgress();
  const bookmarked = new Set(learnProgress.bookmarked);
  const started = new Set(learnProgress.started);
  const completed = new Set(learnProgress.completed);
  const [featurePhotoUnavailable, setFeaturePhotoUnavailable] = useState(false);

  useEffect(() => {
    const updateRoute = () => setRoute(readLearnRoute());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  const toggleBookmark = (lessonId: string) => learnActions.toggleBookmark(lessonId);
  const startLesson = (lessonId: string) => learnActions.start(lessonId);

  if (route.view === "video") return <VideoLessonView id={route.id} />;
  if (route.view === "infographic") return <InfographicDetailView id={route.id} />;
  if (route.view === "protection") return <ProtectionExplained key={route.slug ?? "hub"} slug={route.slug} />;
  if (route.view === "products") return <ProductExplorer />;

  /* ---------- Lesson: a reading layout ---------- */
  if (route.view === "lesson") {
    const lesson = demoLessons.find((item) => item.id === route.lessonId);
    if (!lesson) return null;
    const status = lessonStatus(lesson, started, completed);
    const progress =
      status === "Completed"
        ? 100
        : status === "In progress"
          ? 10
          : 0;
    const points = lessonKeyPoints[lesson.id] ?? [];
    return (
      <article aria-labelledby="lesson-title">
        <PageHero
          eyebrow={`${lesson.categoryLabel} · ${lesson.minutes} min lesson`}
          title={lesson.title}
          backLabel="Learn"
          onBack={() => navigateToLearn({ view: "dashboard" })}
          titleId="lesson-title"
        />
        <Container className="max-w-[44rem] pt-5">
          <div className="aspect-[21/9] overflow-hidden rounded-2xl">
            <LessonArt art={lesson.art ?? "shield"} tone={lesson.tone ?? "teal"} />
          </div>
          <h2 className="mt-6 text-subheading text-navy-950">Key points</h2>
          <p className="text-caption text-ink-muted">
            General examples only — not personal financial, insurance or medical advice.
          </p>
          <ol className="mt-3 grid gap-2.5">
            {points.map((point, index) => (
              <li key={point} className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-body-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-body text-ink">{point}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-2xl bg-surface p-4 ring-1 ring-ink/[0.07]">
            <ProgressBar
              value={progress}
              tone="teal"
              size="sm"
              label={`Lesson progress · ${status}`}
              valueLabel={`${progress}%`}
            />
            <div className="mt-4 flex flex-wrap gap-2.5">
              {status === "Completed" ? (
                <span className="inline-flex h-12 items-center gap-1.5 rounded-full bg-success-50 px-5 text-body-sm font-semibold text-success-700">
                  <CheckCircle2 size={16} aria-hidden /> Lesson completed
                </span>
              ) : (
                <span className="inline-flex h-12 items-center text-body-sm text-ink-secondary">
                  Pass the quiz below to complete this lesson.
                </span>
              )}
              <button
                type="button"
                aria-pressed={bookmarked.has(lesson.id)}
                onClick={() => toggleBookmark(lesson.id)}
                className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-body-sm font-semibold text-navy-900 ring-1 ring-ink/20 hover:ring-navy-400"
              >
                {bookmarked.has(lesson.id) ? (
                  <BookmarkCheck size={16} className="text-crimson-600" aria-hidden />
                ) : (
                  <Bookmark size={16} aria-hidden />
                )}
                {bookmarked.has(lesson.id) ? "Saved" : "Save lesson"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <RewardQuiz
              key={lesson.id}
              kind="lesson-complete"
              contentId={lesson.id}
              onStart={() => startLesson(lesson.id)}
              onPassed={() => learnActions.complete(lesson.id)}
            />
          </div>

          {(lessonRelated[lesson.id] ?? defaultRelated).length > 0 && (
            <section className="mt-7">
              <h2 className="text-subheading text-navy-950">Keep learning</h2>
              <ul className="mt-2 grid gap-2">
                {(lessonRelated[lesson.id] ?? defaultRelated).map((r) => (
                  <li key={r.href}>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = r.href;
                        window.scrollTo({ top: 0 });
                      }}
                      className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-navy-50 px-4 text-left text-body-sm font-semibold text-navy-900"
                    >
                      <span>
                        <span className="block text-[12px] font-bold uppercase tracking-[0.1em] text-teal-700">{r.kind}</span>
                        {r.label}
                      </span>
                      <ArrowRight size={16} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </article>
    );
  }

  /* ---------- Category ---------- */
  if (route.view === "category") {
    const category = demoLearningCategories.find((item) => item.key === route.category)!;
    const lessons =
      route.category === "all"
        ? demoLessons
        : demoLessons.filter((lesson) => lesson.category === route.category);
    return (
      <>
        <Band tone="paper" labelledBy="category-title" className="!pb-10 sm:!pb-12">
          <Container>
            <button
              type="button"
              onClick={() => navigateToLearn({ view: "dashboard" })}
              className="mb-8 inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800 hover:text-navy-950"
            >
              <ArrowLeft size={16} aria-hidden /> Back to Learn
            </button>
            <Chapter
              as="h1"
              label="Learn · Topic"
              id="category-title"
              title={category.label}
              lede={`${category.description}.`}
            />
          </Container>
        </Band>
        <Band tone="canvas" label={`${category.label} lessons`} className="!pt-8">
          <Container>
            <TopicTabs active={route.category} />
            <div className="mt-6">
              <LessonIndex
                lessons={lessons}
                bookmarked={bookmarked}
                onBookmark={toggleBookmark}
                started={started}
                completed={completed}
              />
            </div>
          </Container>
        </Band>
        {route.category === "protection" && (
          <Band tone="night" labelledBy="purposes-title">
            <Container>
              <Chapter
                label="Protection education"
                id="purposes-title"
                onDark
                title="Eight financial protection purposes"
                lede="The reasons people plan for protection — each needs its own kind of cover."
              />
              <ol className="mt-12 grid gap-x-12 border-t border-white/15 md:grid-cols-2">
                {protectionPurposes.map((purpose, index) => (
                  <li
                    key={purpose.title}
                    className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-white/15 py-6"
                  >
                    <span className="font-brand text-chapter leading-none text-teal-200 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-body font-semibold text-white">{purpose.title}</h3>
                      <p className="mt-1 text-body-sm text-white/70">{purpose.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                href="#app/learn/protection"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-body-sm font-semibold text-navy-950 hover:bg-white/90"
              >
                See which insurance covers which purpose <ArrowRight size={16} aria-hidden />
              </a>
            </Container>
          </Band>
        )}
      </>
    );
  }

  /* ---------- Dashboard ---------- */
  return <LearnHome />;
}
