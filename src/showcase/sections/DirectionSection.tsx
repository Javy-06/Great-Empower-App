import { ArrowRight, BookOpen, Gift, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Section, Sub, DoDont } from "../kit";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/cn";

const spectrum = [
  { name: "Analyze", pos: 8 },
  { name: "Guide", pos: 20 },
  { name: "Home", pos: 34 },
  { name: "Rewards", pos: 58 },
  { name: "Learn", pos: 66 },
  { name: "Simulate", pos: 76 },
  { name: "LifeTrack", pos: 92 },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Earned trust",
    body: "Calm navy surfaces, precise numbers and honest labels. Every figure says where it comes from.",
  },
  {
    icon: BookOpen,
    title: "Clarity over cleverness",
    body: "One idea per card. Plain-language explanations sit next to every chart and result.",
  },
  {
    icon: TrendingUp,
    title: "Progress you can feel",
    body: "Teal progress, streaks and milestones make learning visible without feeling like a toy.",
  },
  {
    icon: Sparkles,
    title: "Made for Malaysian twenties",
    body: "Real moments — PTPTN, first payslip, balik kampung, Raya — told with warmth and respect.",
  },
];

export function DirectionSection() {
  return (
    <Section
      id="direction"
      index="01"
      eyebrow="Brand visual direction"
      title="Premium meets youthful"
      intro="GREAT EMPOWER should feel like a modern fintech education product: the credibility of a financial institution, the energy of a product young adults actually want to open."
    >
      {/* Hero board */}
      <div className="overflow-hidden rounded-3xl bg-navy-900 text-white">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="relative flex flex-col p-6 md:p-10">
            <div
              className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full border border-white/5"
              aria-hidden
            />
            <Logo tone="white" size="md" />
            <div className="mt-10 flex flex-wrap gap-2 md:mt-14">
              <Badge tone="teal" variant="solid">
                Brand hero · reference
              </Badge>
              <Badge variant="outline" className="border-white/25 text-white/80">
                Independent concept
              </Badge>
            </div>
            <h3 className="mt-5 max-w-lg text-display text-white md:text-display-xl">
              Empowering You to Protect Your Tomorrow.
            </h3>
            <p className="mt-4 flex flex-wrap gap-x-3 text-body-lg font-medium text-white/80">
              <span>Learn Better.</span>
              <span>Live Better.</span>
              <span className="text-crimson-300">Get Rewarded.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="accent" size="lg" trailingIcon={ArrowRight}>
                Start learning
              </Button>
              <Button variant="inverse-outline" size="lg" leadingIcon={Gift}>
                Rewards Hub
              </Button>
            </div>
          </div>
          <div className="relative min-h-72 lg:min-h-full">
            <img
              src="/images/pexels/learning-academy-students-in-library.webp"
              alt="Two students studying together in a library with books and a laptop."
              width={1800}
              height={1200}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-navy-900 lg:via-navy-900/10 lg:to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/95 p-3 text-ink shadow-e3 backdrop-blur sm:left-auto sm:w-72">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <TrendingUp size={20} strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-caption text-ink-muted">This week</p>
                <p className="text-body-sm font-semibold">3 lessons · +180 pts earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Sub
        title="Personality spectrum"
        description="Every module shares one brand, but sits at a different point between premium restraint and youthful energy."
      >
        <div className="rounded-3xl border border-line bg-surface p-5 md:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-overline uppercase text-navy-900">Premium</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Trustworthy · Sophisticated · Restrained colour · Clear hierarchy · Precise data
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-overline uppercase text-teal-700">Youthful</p>
              <p className="mt-1 text-body-sm text-ink-secondary">
                Approachable · Interactive · Illustrated · Rewarding · Energetic
              </p>
            </div>
          </div>
          <div className="relative mt-10 mb-10">
            <div className="h-2 rounded-full bg-[linear-gradient(90deg,var(--color-navy-900),var(--color-navy-400)_45%,var(--color-teal-400)_70%,var(--color-teal-600))]" />
            {spectrum.map((m, i) => (
              <div
                key={m.name}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${m.pos}%` }}
              >
                <span className="block size-4 rounded-full border-[3px] border-white bg-navy-900 shadow-e2" />
                <span
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-caption font-semibold text-ink",
                    i % 2 === 0 ? "top-6" : "bottom-6",
                  )}
                >
                  {m.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Sub>

      <Sub title="Design principles">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                <Icon size={20} strokeWidth={1.75} aria-hidden />
              </span>
              <h4 className="mt-4 text-subheading text-ink">{title}</h4>
              <p className="mt-1 text-body-sm text-ink-secondary">{body}</p>
            </div>
          ))}
        </div>
      </Sub>

      <Sub
        title="Brand mark"
        description="The supplied lion artwork is the brand mark. Keep it legible at small sizes, retaining its white tile when placed on navy surfaces."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex min-h-40 items-center justify-center rounded-3xl border border-line bg-surface p-6">
            <Logo size="lg" />
          </div>
          <div className="flex min-h-40 items-center justify-center rounded-3xl bg-navy-900 p-6">
            <Logo size="lg" tone="white" />
          </div>
          <div className="flex min-h-40 items-center justify-center gap-5 rounded-3xl border border-line bg-canvas p-6">
            <LogoMark size={56} />
            <LogoMark size={40} />
            <LogoMark size={28} />
            <LogoMark size={40} tone="white" className="rounded-[9px] shadow-e1" />
          </div>
        </div>
      </Sub>

      <Sub title="Feels like / never feels like">
        <div className="grid gap-3 md:grid-cols-2">
          <DoDont kind="do">
            A premium fintech app with a learning brain: modular cards, confident numbers, warm
            illustrated moments.
          </DoDont>
          <DoDont kind="dont">
            A traditional insurance brochure — stock handshakes, dense legal copy, red everywhere.
          </DoDont>
          <DoDont kind="do">
            Gamification that respects adults: progress, streaks, tiers and achievements framed as
            real-life wins.
          </DoDont>
          <DoDont kind="dont">
            A children&apos;s game, a crypto exchange (neon, dark gradients, hype) or a generic
            e-wallet.
          </DoDont>
        </div>
      </Sub>
    </Section>
  );
}
