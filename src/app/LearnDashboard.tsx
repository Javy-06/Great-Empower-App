import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Clock3 } from "lucide-react";
import { ProgressBar } from "@/components/ui/Progress";
import { LessonArt } from "@/components/cards/LearnCards";
import { Band, Chapter, Container, TextLink } from "@/components/layout/Editorial";
import { demoLearning } from "@/data/demo-learning";
import { demoLearningCategories, demoLessons, protectionPurposes } from "@/data/demo-courses";
import type { LearningCategoryKey, LearningLesson } from "@/types/learning";
import { cn } from "@/lib/cn";

type LearnRoute =
  | { view: "dashboard" }
  | { view: "category"; category: LearningCategoryKey }
  | { view: "lesson"; lessonId: string };

function readLearnRoute(): LearnRoute {
  const hash = window.location.hash.replace(/^#/, "");
  const segments = hash.split("/");
  if (segments[0] === "app" && segments[1] === "learn") {
    if (segments[2] === "category" && segments[3]) {
      const category = demoLearningCategories.find((item) => item.key === segments[3]);
      if (category) return { view: "category", category: category.key };
    }
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
  if (completed.has(lesson.id) || lesson.progress === 100) return "Completed" as const;
  if (started.has(lesson.id) || (lesson.progress ?? 0) > 0) return "In progress" as const;
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
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(["medical-cards"]));
  const [started, setStarted] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [featurePhotoUnavailable, setFeaturePhotoUnavailable] = useState(false);

  useEffect(() => {
    const updateRoute = () => setRoute(readLearnRoute());
    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  const toggleBookmark = (lessonId: string) => {
    setBookmarked((current) => {
      const next = new Set(current);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  };
  const startLesson = (lessonId: string) => setStarted((current) => new Set(current).add(lessonId));
  const completeLesson = (lessonId: string) => {
    setStarted((current) => new Set(current).add(lessonId));
    setCompleted((current) => new Set(current).add(lessonId));
  };

  /* ---------- Lesson: a reading layout ---------- */
  if (route.view === "lesson") {
    const lesson = demoLessons.find((item) => item.id === route.lessonId);
    if (!lesson) return null;
    const status = lessonStatus(lesson, started, completed);
    const progress =
      status === "Completed"
        ? 100
        : status === "In progress"
          ? Math.max(lesson.progress ?? 0, started.has(lesson.id) ? 10 : 0)
          : 0;
    const points = lessonKeyPoints[lesson.id] ?? [];
    return (
      <Band tone="paper" label={lesson.title} className="!pt-10 sm:!pt-14">
        <Container className="max-w-[860px]">
          <button
            type="button"
            onClick={() => navigateToLearn({ view: "category", category: lesson.category })}
            className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-navy-800 hover:text-navy-950"
          >
            <ArrowLeft size={16} aria-hidden /> Back to category
          </button>
          <p className="mt-8 text-overline uppercase text-teal-700">
            {lesson.categoryLabel} · {lesson.minutes} min · demo lesson
          </p>
          <h1 className="mt-4 font-brand text-mega text-navy-950">{lesson.title}</h1>
          <div className="mt-10 aspect-[21/9] overflow-hidden">
            <LessonArt art={lesson.art ?? "shield"} tone={lesson.tone ?? "teal"} />
          </div>
          <p className="mt-10 max-w-2xl text-lede text-ink-secondary">
            Three ideas to take away. General examples only — not personal financial, insurance or
            medical advice.
          </p>
          <ol className="mt-8 border-t border-ink/15">
            {points.map((point, index) => (
              <li
                key={point}
                className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ink/15 py-6"
              >
                <span className="font-brand text-chapter leading-none text-teal-700 tabular-nums">
                  {index + 1}
                </span>
                <span className="text-lede text-ink">{point}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
            <ProgressBar
              value={progress}
              tone="teal"
              size="sm"
              label={`Demo lesson progress · ${status}`}
              valueLabel={`${progress}%`}
            />
            <div className="flex flex-wrap gap-3">
              {status === "Completed" ? (
                <span className="inline-flex h-12 items-center rounded-full bg-teal-50 px-6 text-body-sm font-semibold text-teal-800">
                  Lesson completed
                </span>
              ) : started.has(lesson.id) || (lesson.progress ?? 0) > 0 ? (
                <button
                  type="button"
                  onClick={() => completeLesson(lesson.id)}
                  className="inline-flex h-12 items-center rounded-full bg-navy-950 px-6 text-body-sm font-semibold text-white hover:bg-navy-800"
                >
                  Mark demo lesson complete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startLesson(lesson.id)}
                  className="inline-flex h-12 items-center rounded-full bg-navy-950 px-6 text-body-sm font-semibold text-white hover:bg-navy-800"
                >
                  Start lesson
                </button>
              )}
              <button
                type="button"
                aria-pressed={bookmarked.has(lesson.id)}
                onClick={() => toggleBookmark(lesson.id)}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/20 px-5 text-body-sm font-semibold text-navy-900 hover:border-navy-400"
              >
                <Bookmark size={16} aria-hidden />{" "}
                {bookmarked.has(lesson.id) ? "Saved" : "Save lesson"}
              </button>
            </div>
          </div>
        </Container>
      </Band>
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
            </Container>
          </Band>
        )}
      </>
    );
  }

  /* ---------- Dashboard: featured lesson + index ---------- */
  const nextLesson = demoLessons.find((lesson) => lesson.id === "hospital-bills");
  return (
    <>
      <Band tone="paper" labelledBy="learn-title" flush>
        <div className="grid lg:grid-cols-[6fr_6fr]">
          <div className="flex flex-col justify-center px-5 py-14 sm:px-8 sm:py-20 lg:py-24 lg:pl-[max(3rem,calc((100vw-1200px)/2+3rem))] lg:pr-16">
            <Chapter
              as="h1"
              label="Learn"
              id="learn-title"
              title="Money basics, made clear."
              lede="Short lessons on saving, health costs and protection."
            />
            <div className="mt-10 max-w-md border-t border-ink/15 pt-6">
              <p className="text-caption font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Continue · {demoLearning.courseName}
              </p>
              <p className="mt-2 font-brand text-serif-title text-navy-950">
                {nextLesson?.title ?? demoLearning.nextLesson.title}
              </p>
              <div className="mt-4">
                <ProgressBar
                  value={demoLearning.completionPercent}
                  tone="teal"
                  size="sm"
                  label="Course progress · demo"
                  valueLabel={`${demoLearning.lessonsCompleted} of ${demoLearning.lessonsTotal}`}
                />
              </div>
              <button
                type="button"
                onClick={() => navigateToLearn({ view: "lesson", lessonId: "hospital-bills" })}
                className="group mt-6 inline-flex h-14 items-center gap-3 rounded-full bg-navy-950 px-7 text-body font-semibold text-white hover:bg-navy-800"
              >
                Continue lesson
                <ArrowRight
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </button>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden bg-sand-100 lg:min-h-[640px]">
            {!featurePhotoUnavailable && (
              <img
                src="/images/pexels/learning-academy-students-in-library.webp"
                alt="Two students studying together in a library with books and a laptop."
                width={1800}
                height={1200}
                loading="eager"
                decoding="async"
                onError={() => setFeaturePhotoUnavailable(true)}
                className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
              />
            )}
          </div>
        </div>
      </Band>

      <Band tone="canvas" labelledBy="index-title">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="index-title" className="font-brand text-chapter text-navy-950">
              All lessons
            </h2>
            <TextLink onClick={() => navigateToLearn({ view: "category", category: "protection" })}>
              The eight protection purposes
            </TextLink>
          </div>
          <div className="mt-8">
            <TopicTabs active={null} />
          </div>
          <div className="mt-6">
            <LessonIndex
              lessons={demoLessons}
              bookmarked={bookmarked}
              onBookmark={toggleBookmark}
              started={started}
              completed={completed}
            />
          </div>
        </Container>
      </Band>
    </>
  );
}
