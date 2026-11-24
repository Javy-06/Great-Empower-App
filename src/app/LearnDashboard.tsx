import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/Progress";
import { LessonCard } from "@/components/cards/LearnCards";
import { ListRow, PageHeader, SectionHeader } from "@/components/layout/Page";
import { demoLearning } from "@/data/demo-learning";
import { demoLearningCategories, demoLessons, protectionPurposes } from "@/data/demo-courses";
import type { LearningCategoryKey, LearningLesson } from "@/types/learning";
import type { ReactNode } from "react";

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

function LessonGrid({
  lessons,
  bookmarked,
  onBookmark,
  started,
  completed,
}: {
  lessons: LearningLesson[];
  bookmarked: Set<string>;
  onBookmark: (lessonId?: string) => void;
  started: Set<string>;
  completed: Set<string>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {lessons.map((lesson) => {
        const status = lessonStatus(lesson, started, completed);
        const description = demoLearningCategories.find(
          (category) => category.key === lesson.category,
        )?.description;

        return (
          <LessonCard
            key={lesson.id}
            lessonId={lesson.id}
            category={lesson.categoryLabel}
            title={lesson.title}
            description={description}
            minutes={lesson.minutes}
            points={lesson.points}
            progress={
              status === "Completed"
                ? 100
                : status === "In progress"
                  ? (lesson.progress ?? 10)
                  : undefined
            }
            status={status}
            art={lesson.art}
            tone={lesson.tone}
            level={lesson.level}
            isBookmarked={bookmarked.has(lesson.id)}
            onBookmark={onBookmark}
            onClick={(lessonId) => lessonId && navigateToLearn({ view: "lesson", lessonId })}
          />
        );
      })}
    </div>
  );
}

const categoryToneByKey: Record<LearningCategoryKey, "teal" | "navy" | "crimson"> = {
  all: "navy",
  "financial-wellness": "teal",
  protection: "crimson",
  "life-planning": "navy",
  practical: "teal",
};

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

  const toggleBookmark = (lessonId?: string) => {
    if (!lessonId) return;
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
    return (
      <div className="mx-auto flex max-w-[900px] flex-col gap-5">
        <Button
          size="sm"
          variant="ghost"
          leadingIcon={ArrowLeft}
          onClick={() => navigateToLearn({ view: "category", category: lesson.category })}
          className="w-fit"
        >
          Back to category
        </Button>
        <Card padding="none" radius="3xl" className="overflow-hidden">
          <div className="bg-navy-900 p-5 text-white md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="teal" variant="solid">
                {lesson.categoryLabel}
              </Badge>
              <Badge
                tone={
                  status === "Completed" ? "success" : status === "In progress" ? "teal" : "neutral"
                }
              >
                {status}
              </Badge>
            </div>
            <h1 className="mt-3 max-w-2xl font-brand text-serif-title md:text-serif-hero">{lesson.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-caption text-white/75">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={14} /> {lesson.minutes} min
              </span>
              <span>Demo lesson · +{lesson.points} pts</span>
              <span>{progress}% progress</span>
            </div>
          </div>
          <div className="p-5 md:p-7">
            <p className="text-overline uppercase text-teal-700">
              Demo lesson · Educational content
            </p>
            <h2 className="mt-1 text-heading text-ink">Key ideas</h2>
            <p className="mt-2 max-w-2xl text-body text-ink-secondary">
              This short, self-guided lesson uses general examples. It is not personal financial,
              insurance or medical advice.
            </p>
            <ol className="mt-5 grid gap-3">
              {(lessonKeyPoints[lesson.id] ?? []).map((point, index) => (
                <li
                  key={point}
                  className="flex gap-3 rounded-xl bg-sunken p-3 text-body-sm text-ink-secondary"
                >
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-50 text-caption font-semibold text-navy-900">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <ProgressBar
                value={progress}
                tone="teal"
                size="sm"
                label="Demo lesson progress"
                valueLabel={`${progress}%`}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {status === "Completed" ? (
                <Button variant="support" leadingIcon={PlayCircle} disabled>
                  Lesson completed
                </Button>
              ) : started.has(lesson.id) || (lesson.progress ?? 0) > 0 ? (
                <Button
                  variant="support"
                  leadingIcon={PlayCircle}
                  onClick={() => completeLesson(lesson.id)}
                >
                  Mark demo lesson complete
                </Button>
              ) : (
                <Button
                  variant="support"
                  leadingIcon={PlayCircle}
                  onClick={() => startLesson(lesson.id)}
                >
                  Start lesson
                </Button>
              )}
              <Button
                variant="secondary"
                leadingIcon={Bookmark}
                onClick={() => toggleBookmark(lesson.id)}
              >
                {bookmarked.has(lesson.id) ? "Saved" : "Save lesson"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (route.view === "category") {
    const category = demoLearningCategories.find((item) => item.key === route.category)!;
    const lessons =
      route.category === "all"
        ? demoLessons
        : demoLessons.filter((lesson) => lesson.category === route.category);
    const Icon = category.icon;
    return (
      <div className="flex flex-col gap-6">
        <Button
          size="sm"
          variant="ghost"
          leadingIcon={ArrowLeft}
          onClick={() => navigateToLearn({ view: "dashboard" })}
          className="w-fit"
        >
          Back to Learn
        </Button>
        <PageHeader
          eyebrow="Learn · Category"
          tone="teal"
          title={category.label}
          lede={`${category.description}.`}
          aside={
            <span className="inline-flex items-center gap-2 text-body-sm text-ink-muted">
              <Icon size={18} aria-hidden /> {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
            </span>
          }
        />

        <section aria-labelledby="category-lessons-title" className="mt-4">
          <SectionHeader id="category-lessons-title" title="Lessons" />
          {lessons.length > 0 ? (
            <LessonGrid
              lessons={lessons}
              bookmarked={bookmarked}
              onBookmark={toggleBookmark}
              started={started}
              completed={completed}
            />
          ) : (
            <p className="text-body-sm text-ink-secondary">
              No lessons are available in this category yet.
            </p>
          )}
        </section>

        {route.category === "protection" && (
          <section aria-labelledby="purposes-title" className="mt-6">
            <SectionHeader
              id="purposes-title"
              title="Eight financial protection purposes"
              description="The reasons people plan for protection — each needs its own kind of cover."
            />
            <ol className="grid gap-x-10 md:grid-cols-2">
              {protectionPurposes.map((purpose, index) => (
                <li
                  key={purpose.title}
                  className="flex gap-4 border-b border-line py-4 last:border-b-0 md:[&:nth-last-child(2)]:border-b-0"
                >
                  <span className="font-brand text-serif-title leading-none text-teal-700 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-body font-semibold text-ink">{purpose.title}</h3>
                    <p className="mt-1 text-body-sm text-ink-secondary">{purpose.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    );
  }

  const protectionCategory = demoLearningCategories.find(
    (category) => category.key === "protection",
  );

  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <PageHeader
        eyebrow="Learn"
        tone="teal"
        title="Money basics, five minutes at a time."
        lede="Short lessons on saving, health costs and protection — written for your first years of earning."
      />
      <section aria-label="Continue learning">
        <Card variant="paper" radius="3xl" padding="none" className="overflow-hidden">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative aspect-[16/8] overflow-hidden bg-teal-50 md:aspect-[16/9] lg:aspect-auto lg:min-h-[380px]">
              {featurePhotoUnavailable ? (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-teal-50"
                  aria-hidden="true"
                >
                  <span className="inline-flex size-20 items-center justify-center rounded-3xl bg-white text-teal-700 shadow-e1">
                    <BookOpen size={36} strokeWidth={1.5} />
                  </span>
                </div>
              ) : (
                <img
                  src="/images/pexels/learning-academy-students-in-library.webp"
                  alt="Two students studying together in a library with books and a laptop."
                  width={1800}
                  height={1200}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => setFeaturePhotoUnavailable(true)}
                  className="absolute inset-0 h-full w-full object-cover object-[center_45%]"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-10">
              <p className="text-overline uppercase text-teal-700">Your course</p>
              <h2 className="mt-2 font-brand text-serif-title text-navy-900">
                {demoLearning.courseName}
              </h2>
              {protectionCategory && (
                <p className="mt-2 max-w-xl text-body-sm text-ink-secondary md:text-body">
                  {protectionCategory.description}.
                </p>
              )}
              <div className="mt-6 max-w-xl">
                <ProgressBar
                  value={demoLearning.completionPercent}
                  tone="teal"
                  label="Course progress"
                  valueLabel={`${demoLearning.completionPercent}%`}
                />
                <p className="mt-2 text-caption text-ink-muted">
                  {demoLearning.lessonsCompleted} of {demoLearning.lessonsTotal} lessons · demo
                  progress
                </p>
              </div>
              <div className="mt-6 max-w-xl border-t border-sand-100 pt-4">
                <p className="text-overline uppercase text-ink-muted">Up next</p>
                <div className="mt-2 flex min-w-0 items-start gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-teal-600 text-body-sm font-semibold tabular-nums text-teal-700">
                    {demoLearning.nextLesson.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold leading-5 text-ink">
                      {demoLearning.nextLesson.title}
                    </p>
                    <p className="text-caption text-ink-muted">
                      {demoLearning.nextLesson.minutes} min
                    </p>
                  </div>
                  <PlayCircle
                    size={24}
                    strokeWidth={1.75}
                    className="mt-1 shrink-0 text-teal-700"
                    aria-hidden
                  />
                </div>
              </div>
              <Button
                variant="primary"
                trailingIcon={ArrowRight}
                onClick={() => navigateToLearn({ view: "lesson", lessonId: "hospital-bills" })}
                className="mt-6 w-full scroll-mb-24 sm:w-fit"
              >
                Continue lesson
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section aria-labelledby="learn-categories-title">
        <SectionHeader
          id="learn-categories-title"
          title="Topics"
          action={{
            label: "All lessons",
            onClick: () => navigateToLearn({ view: "category", category: "all" }),
          }}
        />
        <div className="grid gap-x-10 md:grid-cols-2">
          {demoLearningCategories
            .filter((category) => category.key !== "all")
            .map((category) => (
              <div key={category.key} className="border-b border-line last:border-b-0 md:[&:nth-last-child(2)]:border-b-0">
                <ListRow
                  icon={category.icon}
                  tone={categoryToneByKey[category.key]}
                  title={category.label}
                  description={category.description}
                  meta={`${category.lessonCount} ${category.lessonCount === 1 ? "lesson" : "lessons"}`}
                  onClick={() => navigateToLearn({ view: "category", category: category.key })}
                />
              </div>
            ))}
        </div>
      </section>

      <section aria-labelledby="recommended-title">
        <SectionHeader
          id="recommended-title"
          title="Recommended for you"
          action={{
            label: "View all",
            onClick: () => navigateToLearn({ view: "category", category: "all" }),
          }}
        />
        <LessonGrid
          lessons={demoLessons.filter(
            (lesson) => lesson.id === "medical-cards" || lesson.id === "emergency-fund",
          )}
          bookmarked={bookmarked}
          onBookmark={toggleBookmark}
          started={started}
          completed={completed}
        />
      </section>
    </div>
  );
}
