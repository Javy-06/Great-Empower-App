import { HeartPulse, PiggyBank } from "lucide-react";
import { VoucherCard, rewardCategories } from "@/components/cards/RewardsCards";
import { Band, Chapter, Container } from "@/components/layout/Editorial";
import { demoRewards } from "@/data/demo-rewards";

// Existing demo values (unchanged): challenges, tier progress and wallet figures.
const challenges = [
  {
    title: "5-day learning streak",
    desc: "One lesson a day",
    progress: 3,
    total: 5,
    points: 150,
    daysLeft: 2,
  },
  {
    title: "Build your safety net",
    desc: "Try the emergency fund tool",
    progress: 1,
    total: 3,
    points: 80,
    daysLeft: 6,
  },
  {
    title: "Know your coverage",
    desc: "Finish the protection path",
    progress: 4,
    total: 5,
    points: 200,
    daysLeft: 9,
  },
];

export function RewardsView() {
  return (
    <>
      <Band tone="night" labelledBy="rewards-title">
        <Container className="grid gap-12 lg:grid-cols-[6fr_6fr] lg:items-end">
          <div>
            <Chapter
              as="h1"
              label="Rewards Hub"
              id="rewards-title"
              onDark
              title="Points for progress."
            />
            <p className="mt-5 max-w-md text-body text-white/70">
              A sample wallet. Demo points and vouchers are not redeemable.
            </p>
          </div>
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.14em] text-white/60">
              Demo points · Bronze
            </p>
            <p className="mt-2 font-brand text-figure tabular-nums text-white">
              {demoRewards.points.toLocaleString("en-MY")}
            </p>
            <div
              className="mt-6 h-1.5 w-full bg-white/10"
              role="meter"
              aria-label="Progress to Silver tier"
              aria-valuenow={72}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full w-[72%] bg-gold-300" />
            </div>
            <div className="mt-3 flex justify-between text-body-sm text-white/70">
              <span>550 pts to Silver</span>
              <span className="tabular-nums">Earned 3,820 · Redeemed 1,370</span>
            </div>
          </div>
        </Container>
      </Band>

      <Band tone="paper" labelledBy="challenges-title">
        <Container>
          <Chapter label="This week" id="challenges-title" title="Three challenges." />
          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-0">
            {challenges.map((challenge) => {
              const pct = Math.round((challenge.progress / challenge.total) * 100);
              return (
                <li
                  key={challenge.title}
                  className="sm:border-l sm:border-ink/15 sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                >
                  <p className="font-brand text-chapter tabular-nums text-navy-950">
                    {challenge.progress}
                    <span className="text-ink-muted">/{challenge.total}</span>
                  </p>
                  <div
                    className="mt-3 h-1 w-full bg-ink/10"
                    role="meter"
                    aria-label={`${challenge.title} progress`}
                    aria-valuenow={challenge.progress}
                    aria-valuemin={0}
                    aria-valuemax={challenge.total}
                  >
                    <div className="h-full bg-crimson-600" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-4 text-body font-semibold text-ink">{challenge.title}</p>
                  <p className="mt-1 text-body-sm text-ink-muted">
                    {challenge.desc} · {challenge.daysLeft} days left ·{" "}
                    <span className="font-semibold text-gold-700">+{challenge.points} pts</span>
                  </p>
                </li>
              );
            })}
          </ol>
        </Container>
      </Band>

      <Band tone="canvas" labelledBy="sample-title">
        <Container>
          <Chapter
            label="Sample rewards"
            id="sample-title"
            title="What points could unlock."
            lede="Partners and values are placeholders until confirmed."
          />
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-ink-secondary">
            {rewardCategories.map(({ id, label }) => (
              <span key={id}>
                {label}{" "}
                <span className="tabular-nums text-ink-muted">· {id === "financial" ? 9 : 6}</span>
              </span>
            ))}
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <VoucherCard
              category="Wellness"
              title="Fitness class pass"
              points={800}
              icon={HeartPulse}
              tile="bg-crimson-50 text-crimson-700"
            />
            <VoucherCard
              category="Community"
              title="Weekend experience"
              points={1500}
              icon={PiggyBank}
              tile="bg-gold-50 text-gold-700"
              locked
            />
          </div>
        </Container>
      </Band>
    </>
  );
}
