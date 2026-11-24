import { useState } from 'react'
import { ChartPie, Compass, GraduationCap, Gift, House, Route, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { Section, Sub } from '../kit'
import { cn } from '@/lib/cn'
import { WellnessOverviewCard, RewardsEntryCard } from '@/components/cards/HomeCards'
import { LessonCard, LessonRow } from '@/components/cards/LearnCards'
import { EmergencyFundCalculator, LifeTrackBoard, lifeTrackResources, ResourceMeter } from '@/components/cards/SimulateCards'
import { ProtectionGapCard, InsightSummaryCard } from '@/components/cards/AnalyzeCards'
import { FaqItem, TopicCard } from '@/components/cards/GuideCards'
import { rewardCategories, RewardCategoryCard, WalletCard } from '@/components/cards/RewardsCards'
import { SearchField } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { HeartPulse, Landmark, PiggyBank, ShieldCheck } from 'lucide-react'

type ModuleKey = 'home' | 'learn' | 'simulate' | 'lifetrack' | 'analyze' | 'guide' | 'rewards'

const modules: Array<{
  key: ModuleKey
  name: string
  icon: LucideIcon
  persona: string
  accent: string
  swatches: string[]
  traits: string[]
  rules: string[]
}> = [
  {
    key: 'home',
    name: 'Home',
    icon: House,
    persona: 'Premium fintech dashboard',
    accent: 'Navy hero · crimson Rewards entry',
    swatches: ['#0F294A', '#FFFFFF', '#C8102E', '#297E85'],
    traits: ['Welcoming greeting', 'Wellness overview', 'Rewards entry above the fold', 'Quick access to every module'],
    rules: ['One navy hero card maximum', 'Personal summaries before discovery content', 'Rewards card always in the first viewport'],
  },
  {
    key: 'learn',
    name: 'Learn',
    icon: GraduationCap,
    persona: 'Modern youthful editorial',
    accent: 'Teal progress · illustrated headers',
    swatches: ['#297E85', '#EFF8F8', '#0F294A', '#F2F5FA'],
    traits: ['Visual lesson cards', 'Infographics & bite-size steps', 'Quizzes with segmented progress', 'Points per lesson'],
    rules: ['Overline category in teal-700', 'Max 7-minute lessons', 'Illustration or photo — never both'],
  },
  {
    key: 'simulate',
    name: 'Simulate',
    icon: SlidersHorizontal,
    persona: 'Interactive financial experience',
    accent: 'Navy result panels · live sliders',
    swatches: ['#0F294A', '#297E85', '#7DC2C6', '#FFFFFF'],
    traits: ['Interactive calculators', 'Real-life scenarios', 'LifeTrack entry', 'Consequences shown instantly'],
    rules: ['Inputs above, consequence panel below', 'Label every figure as an estimate', 'Animate values, not layout'],
  },
  {
    key: 'lifetrack',
    name: 'LifeTrack',
    icon: Route,
    persona: 'Youthful life simulation',
    accent: 'Teal/navy board · five resources',
    swatches: ['#297E85', '#C8102E', '#0F294A', '#C9A03F'],
    traits: ['Illustrated board game', 'Malaysian young-adult moments', 'Decision → consequence', 'Five resource meters'],
    rules: ['Lives inside Simulate', 'Risk tiles crimson, opportunity tiles teal', 'Resource colours are fixed'],
  },
  {
    key: 'analyze',
    name: 'Analyze',
    icon: ChartPie,
    persona: 'Professional financial dashboard',
    accent: 'Navy data · restrained colour',
    swatches: ['#0F294A', '#9CB2D2', '#297E85', '#C8102E'],
    traits: ['Structured insights', 'Protection gap analysis', 'Charts with plain-language takeaways', 'Numerical summaries'],
    rules: ['Highest density, least decoration', 'Every chart has a one-line explanation', 'Illustrative data clearly labelled'],
  },
  {
    key: 'guide',
    name: 'Guide',
    icon: Compass,
    persona: 'Clean knowledge centre',
    accent: 'White space · neutral tiles',
    swatches: ['#FFFFFF', '#F1F5F9', '#0F294A', '#475569'],
    traits: ['Searchable articles', 'Practical guidance', 'FAQs', 'Topic browsing'],
    rules: ['Search first', 'Readable 65–75ch measure', 'Neutral icon tiles; colour only for links/state'],
  },
  {
    key: 'rewards',
    name: 'Rewards',
    icon: Gift,
    persona: 'Premium gamified experience',
    accent: 'Deep navy wallet · gold tiers',
    swatches: ['#0A1C33', '#C8102E', '#C9A03F', '#FFFFFF'],
    traits: ['Points wallet', 'Four reward categories', 'Voucher cards', 'Challenges & achievements'],
    rules: ['Gold only appears here', 'Placeholder values until partners confirmed', 'Clear expiry and balance info'],
  },
]

function Preview({ k }: { k: ModuleKey }) {
  switch (k) {
    case 'home':
      return (
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <WellnessOverviewCard />
          <RewardsEntryCard />
        </div>
      )
    case 'learn':
      return (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <LessonCard art="shield" tone="teal" category="Protection education" title="Medical cards, explained simply" minutes={5} points={50} progress={60} />
          <div className="rounded-2xl border border-line bg-surface p-3">
            <p className="px-3 pb-2 pt-1 text-overline uppercase text-ink-muted">Protection basics · path</p>
            <LessonRow index={1} title="Why protection matters in your 20s" minutes={4} done />
            <LessonRow index={2} title="Hospital bills: what to expect" minutes={5} done />
            <LessonRow index={3} title="Medical cards, explained simply" minutes={5} active />
            <LessonRow index={4} title="Income protection concepts" minutes={6} />
          </div>
        </div>
      )
    case 'simulate':
      return (
        <div className="max-w-xl">
          <EmergencyFundCalculator />
        </div>
      )
    case 'lifetrack':
      return (
        <div className="grid gap-4 rounded-3xl bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-navy-50))] p-3 sm:p-5 md:grid-cols-[1.2fr_1fr]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <Badge tone="teal" variant="solid">
                Age 24 · Year 2
              </Badge>
              <span className="text-caption text-ink-muted">Turn 7</span>
            </div>
            <LifeTrackBoard position={4} />
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-surface/70 p-3 md:flex md:flex-col">
            <p className="text-overline uppercase text-ink-muted">Your resources</p>
            {lifeTrackResources.map((r) => (
              <ResourceMeter key={r.id} {...r} />
            ))}
          </div>
        </div>
      )
    case 'analyze':
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <ProtectionGapCard title="Medical coverage" current={50000} reference={100000} note="Illustrative. Reference amounts vary by hospital type and personal circumstances." />
          <InsightSummaryCard />
        </div>
      )
    case 'guide':
      return (
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col gap-3">
            <SearchField placeholder="Search the Guide" />
            <div className="grid grid-cols-2 gap-3">
              <TopicCard icon={ShieldCheck} title="Protection" count={24} />
              <TopicCard icon={PiggyBank} title="Saving" count={18} />
              <TopicCard icon={HeartPulse} title="Health" count={12} />
              <TopicCard icon={Landmark} title="Money basics" count={30} />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface px-5">
            <FaqItem q="Is GREAT EMPOWER an insurance company?" a="No. GREAT EMPOWER is an independent education platform concept. It explains financial and protection concepts and does not sell or recommend products." defaultOpen />
            <FaqItem q="How do I earn points?" a="Complete lessons, quizzes, simulations and challenges. Points appear in your wallet in the Rewards Hub." />
            <FaqItem q="Is my check-in data shared?" a="In this concept, check-in data stays on your device and is only used to personalise learning." />
          </div>
        </div>
      )
    case 'rewards':
      return (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <WalletCard />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {rewardCategories.map((c, i) => (
              <RewardCategoryCard key={c.id} {...c} count={[6, 9, 8, 7][i]} />
            ))}
          </div>
        </div>
      )
  }
}

export function ModulesSection() {
  const [active, setActive] = useState<ModuleKey>('home')
  const mod = modules.find((m) => m.key === active)!
  return (
    <Section id="modules" index="12" eyebrow="Module identity" title="One brand, seven personalities" intro="Each module tunes density, colour emphasis and illustration within the same tokens and components. Select a module to see its guidelines and signature components.">
      <div role="tablist" aria-label="Modules" className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 sm:-mx-4 sm:px-4 md:mx-0 md:flex-wrap md:px-0">
        {modules.map((m) => {
          const Icon = m.icon
          const on = m.key === active
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(m.key)}
              className={cn(
                'inline-flex h-12 shrink-0 items-center gap-2 rounded-xl border px-4 text-label transition-colors',
                on ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-surface font-medium text-ink-secondary hover:border-navy-200 hover:text-ink',
              )}
            >
              <Icon size={18} strokeWidth={on ? 2 : 1.75} aria-hidden />
              {m.name}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" aria-label={mod.name} className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6">
          <div>
            <p className="text-overline uppercase text-teal-700">{mod.name}</p>
            <h3 className="mt-1 text-heading text-ink">{mod.persona}</h3>
            <p className="mt-1 text-body-sm text-ink-secondary">{mod.accent}</p>
          </div>
          <div className="flex gap-1.5">
            {mod.swatches.map((s) => (
              <span key={s} className="h-10 flex-1 rounded-lg ring-1 ring-inset ring-black/10" style={{ background: s }} title={s} />
            ))}
          </div>
          <div>
            <p className="mb-2 text-body-sm font-semibold text-ink">Signature elements</p>
            <ul className="flex flex-wrap gap-1.5">
              {mod.traits.map((t) => (
                <li key={t}>
                  <Badge tone="navy">{t}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-body-sm font-semibold text-ink">Rules</p>
            <ul className="flex flex-col gap-2">
              {mod.rules.map((r) => (
                <li key={r} className="flex gap-2 text-body-sm text-ink-secondary">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Sub title="Signature components">
          <Preview k={active} />
        </Sub>
      </div>
    </Section>
  )
}
