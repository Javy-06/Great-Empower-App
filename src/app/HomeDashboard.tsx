import { useState } from "react";
import { ArrowRight, BookOpen, Calculator, ChartPie, Compass, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListRow, SectionHeader, StatStrip } from "@/components/layout/Page";
import { LifeTrackLauncher } from "./lifetrack/LifeTrackLauncher";
import { demoUser } from "@/data/demo-user";
import { demoLearning } from "@/data/demo-learning";
import { demoRewards } from "@/data/demo-rewards";
import { demoActivities } from "@/data/demo-activities";

export type DashboardDestination = "home" | "learn" | "simulate" | "analyze" | "guide" | "rewards";

const destinations: Array<{
  destination: DashboardDestination;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}> = [
  {
    destination: "learn",
    title: "Learn",
    description: "Short lessons, from first payslip to the eight protection purposes.",
    icon: BookOpen,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    destination: "simulate",
    title: "Simulate",
    description: "Split a hospital bill, size an emergency fund, play LifeTrack.",
    icon: Calculator,
    tone: "bg-navy-50 text-navy-900",
  },
  {
    destination: "analyze",
    title: "Analyze",
    description: "See an income-protection gap and a monthly spending mix.",
    icon: ChartPie,
    tone: "bg-crimson-50 text-crimson-700",
  },
  {
    destination: "guide",
    title: "Guide",
    description: "Plain-language explainers on protection, health costs and saving.",
    icon: Compass,
    tone: "bg-gold-50 text-gold-700",
  },
];

function openLesson() {
  window.location.hash = "app/learn/lesson/hospital-bills";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

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
    <div className="flex flex-col gap-12 md:gap-16">
      <section
        aria-labelledby="home-title"
        className="overflow-hidden rounded-3xl bg-navy-900 text-white"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8 lg:p-12">
            <p className="text-overline uppercase tracking-[0.12em] text-teal-200">
              Empowering you to protect your tomorrow
            </p>
            <h1
              id="home-title"
              className="mt-4 font-brand text-serif-title text-white sm:text-serif-hero"
            >
              {greeting}, {profileName}.
            </h1>
            <p className="mt-4 max-w-md text-body text-white/80 sm:text-body-lg">
              Next up:{" "}
              <span className="font-semibold text-white">{demoLearning.nextLesson.title}</span> —{" "}
              {demoLearning.nextLesson.minutes} minutes.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button variant="inverse" trailingIcon={ArrowRight} onClick={openLesson}>
                Continue lesson
              </Button>
              <Button variant="inverse-outline" onClick={() => onNavigate("simulate")}>
                Try a simulator
              </Button>
            </div>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-navy-800 lg:aspect-auto lg:min-h-[420px]">
            {heroPhotoUnavailable ? (
              <div
                className="absolute inset-0 flex items-center justify-center bg-navy-800"
                aria-hidden="true"
              >
                <BookOpen size={40} strokeWidth={1.25} className="text-white/40" />
              </div>
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
                className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
              />
            )}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="week-title"
        className="rounded-3xl bg-paper p-6 ring-1 ring-sand-100 sm:p-8"
      >
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="week-title" className="text-heading text-ink">
            This week
          </h2>
          <p className="text-caption text-ink-muted">
            Demo activity · illustrative, not an assessment
          </p>
        </div>
        <StatStrip
          items={[
            {
              label: demoLearning.courseName,
              value: `${demoLearning.completionPercent}%`,
              hint: `${demoLearning.lessonsCompleted} of ${demoLearning.lessonsTotal} lessons`,
            },
            { label: "Wellness score", value: demoLearning.wellness, hint: "Out of 100" },
            {
              label: "Quizzes",
              value: demoLearning.quizProgress.split(" ")[0] + "/5",
              hint: "Completed",
            },
            {
              label: "Points",
              value: demoRewards.points.toLocaleString("en-MY"),
              hint: demoRewards.featuredChallenge,
            },
          ]}
        />
        <div className="mt-6 border-t border-sand-100 pt-4">
          <button
            type="button"
            onClick={() => onNavigate("rewards")}
            className="group inline-flex min-h-11 items-center gap-1 text-body-sm font-semibold text-crimson-700"
          >
            Open Rewards Hub
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>
      </section>

      <section aria-labelledby="start-title">
        <SectionHeader id="start-title" title="Where to start" />
        <div className="grid gap-3 sm:grid-cols-2">
          {destinations.map(({ destination, title, description, icon: Icon, tone }) => (
            <button
              key={destination}
              type="button"
              onClick={() => onNavigate(destination)}
              className="ge-lift group flex min-h-24 items-start gap-4 rounded-2xl border border-line bg-surface p-5 text-left hover:border-line-strong"
            >
              <span
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
                aria-hidden
              >
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-subheading text-ink">{title}</span>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-body-sm text-ink-secondary">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <LifeTrackLauncher compact />

      <section aria-labelledby="activity-title">
        <SectionHeader id="activity-title" title="Recent activity" />
        <div className="divide-y divide-line">
          {demoActivities.map(({ title, detail, icon, tone }) => (
            <ListRow key={title} icon={icon} tone={tone} title={title} description={detail} />
          ))}
        </div>
      </section>
    </div>
  );
}
