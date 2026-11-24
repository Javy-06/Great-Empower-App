import { Flame, HeartPulse, PiggyBank } from "lucide-react";
import { VoucherCard, WalletCard, rewardCategories } from "@/components/cards/RewardsCards";
import { PageHeader, SectionHeader } from "@/components/layout/Page";
import { ProgressBar } from "@/components/ui/Progress";
import { demoRewards } from "@/data/demo-rewards";
import { cn } from "@/lib/cn";

const challenges = [
  { title: "5-day learning streak", desc: "One lesson a day", progress: 3, total: 5, points: 150, daysLeft: 2 },
  { title: "Build your safety net", desc: "Try the emergency fund tool", progress: 1, total: 3, points: 80, daysLeft: 6 },
  { title: "Know your coverage", desc: "Finish the protection path", progress: 4, total: 5, points: 200, daysLeft: 9 },
];

export function RewardsView() {
  return (
    <div className="flex flex-col gap-12 md:gap-14">
      <PageHeader
        eyebrow="Rewards Hub"
        tone="crimson"
        title="Points for progress."
        lede="Earn demo points for learning and trying the tools. This is a sample wallet — points and vouchers are not redeemable."
      />

      <section aria-label="Points wallet" className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <WalletCard points={demoRewards.points} />
        <ol className="flex flex-col gap-4 text-body-sm text-ink-secondary">
          {[
            ["Learn", "Finish lessons and quizzes."],
            ["Practise", "Use the simulators and play LifeTrack."],
            ["Unlock", "Reach a tier to see sample rewards."],
          ].map(([title, text], index) => (
            <li key={title} className="flex items-start gap-4">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-body-sm font-semibold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block text-body font-semibold text-ink">{title}</span>
                {text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="challenges-title">
        <SectionHeader id="challenges-title" title="Active challenges" />
        <ul className="divide-y divide-line">
          {challenges.map((challenge) => (
            <li
              key={challenge.title}
              className="grid gap-3 py-4 sm:grid-cols-[1fr_minmax(12rem,16rem)_auto] sm:items-center sm:gap-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-crimson-50 text-crimson-700"
                  aria-hidden
                >
                  <Flame size={20} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-body font-semibold text-ink">{challenge.title}</p>
                  <p className="text-body-sm text-ink-muted">{challenge.desc}</p>
                </div>
              </div>
              <ProgressBar
                value={challenge.progress}
                max={challenge.total}
                tone="crimson"
                size="sm"
                label={`${challenge.daysLeft} days left`}
                valueLabel={`${challenge.progress}/${challenge.total}`}
              />
              <p className="text-body-sm font-semibold tabular-nums text-gold-700 sm:text-right">
                +{challenge.points} pts
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="categories-title">
        <SectionHeader id="categories-title" title="Reward categories" />
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {rewardCategories.map(({ id, label, icon: Icon, desc, tile }) => (
            <li key={id} className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
              <span
                className={cn("inline-flex size-11 items-center justify-center rounded-xl", tile)}
                aria-hidden
              >
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-body-sm font-semibold text-ink">{label}</p>
                <p className="text-caption text-ink-muted">{desc}</p>
              </div>
              <p className="mt-auto text-caption font-semibold text-ink-secondary">
                {id === "financial" ? 9 : 6} sample rewards
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vouchers-title">
        <SectionHeader
          id="vouchers-title"
          title="Sample vouchers"
          description="Partners and values are placeholders until confirmed."
        />
        <div className="grid gap-3 lg:grid-cols-2">
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
      </section>
    </div>
  );
}
