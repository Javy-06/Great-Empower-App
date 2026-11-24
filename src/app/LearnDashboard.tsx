import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Clock3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/Progress";
import { LessonCard } from "@/components/cards/LearnCards";
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

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="text-overline uppercase text-teal-700">{eyebrow}</p>
        <h2 className="mt-1 text-heading text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}

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

const categoryAccentByKey: Record<LearningCategoryKey, string> = {
  all: "border-t-navy-700 bg-navy-50/50",
  "financial-wellness": "border-t-teal-600 bg-teal-50/40",
  protection: "border-t-crimson-600 bg-crimson-50/30",
  "life-planning": "border-t-navy-700 bg-navy-50/50",
  practical: "border-t-teal-700 bg-surface",
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
            <h1 className="mt-3 max-w-2xl text-title md:text-display">{lesson.title}</h1>
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
        <Card variant="navy" radius="3xl" padding="lg" className="overflow-hidden">
          <div className="flex items-start gap-4">
            <IconTile icon={Icon} tone="teal" size="lg" />
            <div>
              <p className="text-overline uppercase text-teal-300">Learn category · Demo</p>
              <h1 className="mt-1 text-title text-white md:text-display">{category.label}</h1>
              <p className="mt-2 max-w-2xl text-body-sm text-white/75 md:text-body">
                {category.description}.
              </p>
            </div>
          </div>
        </Card>

        {lessons.length > 0 && (
          <section aria-label={`${category.label} featured lesson`}>
            <SectionHeading eyebrow="Featured" title="Featured lesson" />
            <LessonGrid
              lessons={[lessons[0]]}
              bookmarked={bookmarked}
              onBookmark={toggleBookmark}
              started={started}
              completed={completed}
            />
          </section>
        )}

        <section aria-label={`${category.label} available lessons`}>
          <SectionHeading eyebrow="Available" title="Available lessons" />
          {lessons.length > 0 ? (
            <LessonGrid
              lessons={lessons}
              bookmarked={bookmarked}
              onBookmark={toggleBookmark}
              started={started}
              completed={completed}
            />
          ) : (
            <Card padding="lg">
              <p className="text-body-sm text-ink-secondary">
                No lessons are available in this category yet.
              </p>
            </Card>
          )}
        </section>

        <section aria-label="Relevant learning paths">
          <SectionHeading eyebrow="Learning path" title="Relevant learning paths" />
          <div className="grid gap-3 md:grid-cols-2">
            <Card padding="md">
              <p className="text-overline uppercase text-teal-700">Path</p>
              <h3 className="mt-1 text-subheading text-ink">
                Build your {category.label.toLowerCase()} foundation
              </h3>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Follow the featured lessons and short practical activities in this category.
              </p>
            </Card>
            <Card padding="md">
              <p className="text-overline uppercase text-navy-700">Progress</p>
              <h3 className="mt-1 text-subheading text-ink">
                {lessons.length} demo lessons available
              </h3>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Illustrative learning data only.
              </p>
            </Card>
          </div>
        </section>

        {route.category === "protection" && (
          <section aria-label="Eight financial protection purposes">
            <SectionHeading
              eyebrow="Protection education"
              title="Eight Financial Protection Purposes"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {protectionPurposes.map((purpose, index) => (
                <Card key={purpose.title} padding="md">
                  <div className="flex items-start justify-between gap-3">
                    <IconTile
                      icon={Icon}
                      tone={index % 3 === 0 ? "crimson" : index % 3 === 1 ? "navy" : "teal"}
                    />
                    <span className="text-caption font-semibold tabular-nums text-ink-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-3 text-body font-semibold text-ink">{purpose.title}</h3>
                  <p className="mt-1 text-body-sm text-ink-secondary">{purpose.description}</p>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const protectionCategory = demoLearningCategories.find(
    (category) => category.key === "protection",
  );

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <section aria-label="Continue learning">
        <Card variant="navy" radius="3xl" padding="none" className="overflow-hidden">
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
            <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 md:p-8 lg:p-10">
              <p className="text-overline uppercase tracking-[0.08em] text-teal-300">
                Learn Academy · Demo account
              </p>
              <p className="mt-4 text-caption font-semibold text-teal-200">
                Build your financial confidence.
              </p>
              <h1 className="mt-1 text-title text-white sm:text-display">
                {demoLearning.courseName}
              </h1>
              {protectionCategory && (
                <p className="mt-2 max-w-xl text-body-sm text-white/80 md:text-body">
                  {protectionCategory.description}.
                </p>
              )}
              <div className="mt-5 max-w-xl">
                <ProgressBar
                  value={demoLearning.completionPercent}
                  tone="white"
                  onDark
                  label="Course progress"
                  valueLabel={`${demoLearning.completionPercent}%`}
                />
                <p className="mt-2 text-caption text-white/75">
                  {demoLearning.lessonsCompleted} of {demoLearning.lessonsTotal} lessons complete ·
                  Demo data
                </p>
              </div>
              <div className="mt-5 max-w-xl rounded-2xl bg-white p-2">
                <p className="px-3 pt-2 text-overline uppercase text-teal-700">Up next</p>
                <div className="flex min-w-0 items-start gap-3 rounded-2xl bg-teal-50 p-3">
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
                variant="inverse"
                trailingIcon={ArrowRight}
                onClick={() => navigateToLearn({ view: "lesson", lessonId: "hospital-bills" })}
                className="mt-5 w-full scroll-mb-24 sm:w-fit"
              >
                Continue learning
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Explore categories">
        <SectionHeading
          eyebrow="Explore"
          title="Learning categories"
          action={
            <Button
              size="sm"
              variant="ghost"
              trailingIcon={ArrowRight}
              onClick={() => navigateToLearn({ view: "category", category: "all" })}
            >
              All lessons
            </Button>
          }
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {demoLearningCategories
            .filter((category) => category.key !== "all")
            .map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => navigateToLearn({ view: "category", category: category.key })}
                  className={`flex min-h-40 scroll-mb-24 flex-col rounded-2xl border border-line border-t-4 p-3 text-left transition-colors hover:border-navy-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700 sm:p-4 ${categoryAccentByKey[category.key]}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <IconTile icon={Icon} tone={categoryToneByKey[category.key]} />
                    <Badge tone="neutral" size="sm">
                      {category.lessonCount} lessons
                    </Badge>
                  </div>
                  <h3 className="mt-3 text-body-sm font-semibold text-ink sm:text-body">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-caption leading-5 text-ink-secondary">
                    {category.description}
                  </p>
                </button>
              );
            })}
        </div>
      </section>

      <section aria-label="Recommended lessons">
        <SectionHeading
          eyebrow="For you"
          title="Recommended lessons"
          action={
            <Button
              size="sm"
              variant="ghost"
              trailingIcon={ArrowRight}
              onClick={() => navigateToLearn({ view: "category", category: "all" })}
            >
              View all
            </Button>
          }
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
