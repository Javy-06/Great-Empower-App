import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  ChartPie,
  Compass,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { LessonRow } from "@/components/cards/LearnCards";
import { LifeTrackPreview } from "@/components/cards/SimulateCards";
import { Dice5, Route } from "lucide-react";
import type { ReactNode } from "react";
import { demoUser } from "@/data/demo-user";
import { demoLearning } from "@/data/demo-learning";
import { demoWellness } from "@/data/demo-wellness";
import { demoRewards } from "@/data/demo-rewards";
import { demoActivities } from "@/data/demo-activities";

export type DashboardDestination = "home" | "learn" | "simulate" | "analyze" | "guide" | "rewards";

const homeQuickActions: Array<{
  label: string;
  destination: DashboardDestination;
  icon: LucideIcon;
}> = [
  { label: "Learn", destination: "learn", icon: BookOpen },
  { label: "Simulate", destination: "simulate", icon: Calculator },
  { label: "Analyze", destination: "analyze", icon: ChartPie },
  { label: "Guide", destination: "guide", icon: Compass },
];

function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-overline uppercase text-teal-700">{eyebrow}</p>}
        <h2 className="mt-1 text-heading text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
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
    <div className="flex flex-col gap-6 md:gap-8">
      <Card variant="navy" radius="3xl" padding="none" className="overflow-hidden">
        <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 md:p-8 lg:p-10">
            <p className="text-overline uppercase tracking-[0.08em] text-teal-300">
              GREAT EMPOWER · Demo account
            </p>
            <p className="mt-4 text-caption font-semibold text-teal-200">
              Empowering You to Protect Your Tomorrow.
            </p>
            <h1 className="mt-2 text-title text-white sm:text-display">
              {greeting}, {profileName}
            </h1>
            <p className="mt-3 max-w-lg text-body-sm text-white/80 sm:text-body">
              Build everyday financial confidence through clear lessons, practical simulations and
              thoughtful protection education.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                variant="inverse"
                trailingIcon={ArrowRight}
                onClick={() => onNavigate("learn")}
              >
                Continue learning
              </Button>
              <Badge tone="teal" variant="solid" className="hidden sm:inline-flex">
                Daily suggestion · 5 min
              </Badge>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-white/15 pt-4 sm:mt-6">
              <div className="sm:hidden">
                <ProgressRing
                  value={demoLearning.wellness}
                  size={72}
                  stroke={6}
                  tone="white"
                  onDark
                  label={String(demoLearning.wellness)}
                  caption="Demo score"
                />
              </div>
              <div className="hidden sm:block">
                <ProgressRing
                  value={demoLearning.wellness}
                  size={84}
                  stroke={8}
                  tone="white"
                  onDark
                  label={String(demoLearning.wellness)}
                  caption="Demo score"
                />
              </div>
              <p className="max-w-[15rem] text-body-sm text-white/75">
                An illustrative indicator from sample learning and planning activity.
              </p>
            </div>
          </div>
          <div className="relative aspect-[16/7] overflow-hidden bg-teal-50 md:aspect-[16/5] lg:aspect-auto lg:min-h-[360px]">
            {heroPhotoUnavailable ? (
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
                src="/images/pexels/young-asian-students-learning-together.webp"
                alt="Three young Asian women studying together with laptops outdoors."
                width={1800}
                height={1200}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={() => setHeroPhotoUnavailable(true)}
                className="absolute inset-0 h-full w-full object-cover object-[center_45%] md:object-[center_35%]"
              />
            )}
          </div>
        </div>
      </Card>

      <section aria-label="Quick actions">
        <div className="mb-3">
          <p className="text-overline uppercase text-teal-700">Explore</p>
          <h2 className="mt-1 text-heading text-ink">Quick actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {homeQuickActions.map(({ label, destination, icon }) => (
            <Button
              key={destination}
              variant="secondary"
              size="sm"
              leadingIcon={icon}
              fullWidth
              className="justify-start scroll-mb-24"
              onClick={() => onNavigate(destination)}
            >
              {label}
            </Button>
          ))}
        </div>
      </section>

      <section aria-label="Financial wellness overview">
        <SectionHeading
          eyebrow="Your overview"
          title="Financial wellness"
          action={
            <Badge tone="neutral" size="sm">
              Demo data
            </Badge>
          }
        />
        <Card padding="lg" className="grid gap-5 sm:grid-cols-[0.75fr_1.25fr] lg:gap-8">
          <div>
            <p className="text-overline uppercase text-ink-muted">Overall status</p>
            <p className="mt-2 text-numeric text-ink">Building steadily</p>
            <p className="mt-2 text-body-sm text-ink-secondary">
              Your demo learning and planning activity shows steady progress. This is not a
              financial assessment.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {demoWellness.map(({ label, value, detail }) => (
                <div
                  key={String(label)}
                  className="min-w-0 rounded-xl bg-sunken p-2.5 sm:rounded-2xl sm:p-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-caption font-semibold text-ink">{label}</p>
                    <p className="text-body font-bold tabular-nums text-navy-900 sm:text-subheading">
                      {value}
                    </p>
                  </div>
                  <div className="mt-2">
                    <ProgressBar
                      value={Number(value)}
                      tone={
                        label === "Protection" ? "crimson" : label === "Planning" ? "navy" : "teal"
                      }
                      size="sm"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-4 text-ink-muted sm:text-caption">
                    {detail} · Demo
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Continue learning">
        <SectionHeading
          eyebrow="My learning"
          title="Continue learning"
          action={
            <Button
              size="sm"
              variant="ghost"
              trailingIcon={ArrowRight}
              onClick={() => onNavigate("learn")}
            >
              View course
            </Button>
          }
        />
        <Card padding="lg" className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="flex items-start gap-3 sm:items-center sm:gap-4">
            <div className="shrink-0 sm:hidden">
              <ProgressRing
                value={demoLearning.completionPercent}
                size={72}
                stroke={7}
                tone="teal"
                label={`${demoLearning.completionPercent}%`}
                caption="complete"
              />
            </div>
            <div className="hidden shrink-0 sm:block">
              <ProgressRing
                value={demoLearning.completionPercent}
                size={88}
                stroke={8}
                tone="teal"
                label={`${demoLearning.completionPercent}%`}
                caption="complete"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-overline uppercase text-ink-muted">Current course</p>
              <h3 className="mt-1 text-body font-semibold text-ink sm:text-subheading">
                {demoLearning.courseName}
              </h3>
              <p className="mt-1 text-caption font-semibold text-teal-700">
                {demoLearning.lessonsCompleted} of {demoLearning.lessonsTotal} lessons complete
              </p>
              <div className="mt-2">
                <ProgressBar
                  value={demoLearning.lessonsCompleted}
                  max={demoLearning.lessonsTotal}
                  tone="teal"
                  size="sm"
                  label="Learning progress"
                  valueLabel={`${demoLearning.lessonsCompleted}/${demoLearning.lessonsTotal}`}
                />
              </div>
              <p className="mt-2 truncate text-caption text-ink-muted">
                Quiz progress: {demoLearning.quizProgress}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3 sm:p-4">
            <p className="text-overline uppercase text-teal-700">Next recommended lesson</p>
            <LessonRow
              index={demoLearning.nextLesson.index}
              title={demoLearning.nextLesson.title}
              minutes={demoLearning.nextLesson.minutes}
              active
            />
            <div className="mt-2">
              <Button
                variant="support"
                trailingIcon={ArrowRight}
                onClick={() => {
                  window.location.hash = "app/learn/lesson/hospital-bills";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Continue lesson
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Featured LifeTrack experience">
        <Card padding="none" radius="3xl" className="overflow-hidden border-teal-200">
          <div className="grid md:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col p-5 md:p-7">
              <div className="flex items-center gap-2">
                <Badge tone="teal" variant="solid" icon={Dice5}>
                  LifeTrack
                </Badge>
                <Badge tone="neutral" size="sm">
                  Inside Simulate
                </Badge>
              </div>
              <h2 className="mt-4 text-heading text-ink md:text-title">
                Make decisions. Experience consequences. Learn protection.
              </h2>
              <p className="mt-2 max-w-xl text-body-sm text-ink-secondary md:text-body">
                Navigate a Malaysian young-adult life journey through jobs, bills and unexpected
                moments in a financial life simulation board game.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="support"
                  leadingIcon={Route}
                  onClick={() => onNavigate("simulate")}
                >
                  Play LifeTrack
                </Button>
                <Button variant="secondary" onClick={() => onNavigate("simulate")}>
                  View how it works
                </Button>
              </div>
            </div>
            <div className="bg-teal-50 p-4 md:flex md:items-center md:p-5">
              <LifeTrackPreview />
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Protection education entry">
        <Card
          padding="md"
          className="flex flex-col gap-4 border-l-4 border-l-teal-600 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <IconTile icon={ShieldCheck} tone="teal" size="lg" />
            <div>
              <p className="text-overline uppercase text-teal-700">Protection education</p>
              <h2 className="mt-1 text-subheading text-ink">
                Explore the Eight Financial Protection Purposes
              </h2>
              <p className="mt-1 text-body-sm text-ink-secondary">
                A short educational guide to the reasons people plan for protection.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            trailingIcon={ArrowRight}
            onClick={() => onNavigate("learn")}
          >
            Explore in Learn
          </Button>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section aria-label="Rewards preview">
          <SectionHeading
            eyebrow="Rewards Hub"
            title="Rewards preview"
            action={
              <Button size="sm" variant="accent" onClick={() => onNavigate("rewards")}>
                Open Rewards Hub
              </Button>
            }
          />
          <Card padding="md" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span
                className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-crimson-600 text-white"
                aria-hidden
              >
                <Dice5 size={24} />
              </span>
              <div className="min-w-0">
                <p className="text-caption text-ink-muted">Available demo points</p>
                <p className="text-numeric tabular-nums text-ink">
                  {demoRewards.points.toLocaleString("en-MY")}{" "}
                  <span className="text-body-sm text-ink-muted">pts</span>
                </p>
              </div>
            </div>
            <div className="min-w-0 rounded-xl bg-sunken p-3 sm:max-w-[15rem]">
              <p className="text-overline uppercase text-ink-muted">Featured challenge</p>
              <p className="mt-1 text-body-sm font-semibold text-ink-secondary">
                {demoRewards.featuredChallenge}
              </p>
            </div>
          </Card>
        </section>

        <section aria-label="Recent activities">
          <SectionHeading
            eyebrow="Activity"
            title="Recent activities"
            action={
              <Button
                size="sm"
                variant="ghost"
                trailingIcon={ArrowRight}
                onClick={() => onNavigate("learn")}
              >
                View all
              </Button>
            }
          />
          <Card padding="md">
            <div className="divide-y divide-line">
              {demoActivities.map(({ title, detail, icon: Icon, tone }) => (
                <div key={title} className="flex min-h-16 items-center gap-3 py-3">
                  <IconTile icon={Icon} tone={tone} />
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-caption text-ink-muted">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
