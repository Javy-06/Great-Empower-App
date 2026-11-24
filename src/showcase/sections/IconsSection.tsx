import {
  Banknote,
  Bell,
  BookOpen,
  Calculator,
  ChartPie,
  Compass,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  LifeBuoy,
  Lightbulb,
  PiggyBank,
  Route,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Ticket,
  TrendingUp,
  Trophy,
  Umbrella,
  Users,
  Wallet,
  Clock3,
  type LucideIcon,
} from 'lucide-react'
import { Section, Sub, SpecList, DoDont, Code } from '../kit'
import { IconTile, type TileTone } from '@/components/ui/IconTile'

const library: Array<[LucideIcon, string]> = [
  [House, 'house'],
  [GraduationCap, 'graduation-cap'],
  [SlidersHorizontal, 'sliders-horizontal'],
  [ChartPie, 'chart-pie'],
  [Compass, 'compass'],
  [Gift, 'gift'],
  [Route, 'route'],
  [ShieldCheck, 'shield-check'],
  [Umbrella, 'umbrella'],
  [HeartPulse, 'heart-pulse'],
  [LifeBuoy, 'life-buoy'],
  [PiggyBank, 'piggy-bank'],
  [Wallet, 'wallet'],
  [Banknote, 'banknote'],
  [Landmark, 'landmark'],
  [Scale, 'scale'],
  [TrendingUp, 'trending-up'],
  [Calculator, 'calculator'],
  [Target, 'target'],
  [Trophy, 'trophy'],
  [Ticket, 'ticket'],
  [Users, 'users'],
  [BookOpen, 'book-open'],
  [Lightbulb, 'lightbulb'],
  [Bell, 'bell'],
  [Search, 'search'],
  [Settings, 'settings'],
  [Clock3, 'clock-3'],
]

const moduleIcons: Array<{ name: string; icon: LucideIcon; tone: TileTone; note: string }> = [
  { name: 'Home', icon: House, tone: 'navy', note: 'Dashboard' },
  { name: 'Learn', icon: GraduationCap, tone: 'teal', note: 'Lessons' },
  { name: 'Simulate', icon: SlidersHorizontal, tone: 'navy', note: 'Calculators' },
  { name: 'LifeTrack', icon: Route, tone: 'teal', note: 'Board game' },
  { name: 'Analyze', icon: ChartPie, tone: 'navy', note: 'Insights' },
  { name: 'Guide', icon: Compass, tone: 'neutral', note: 'Knowledge' },
  { name: 'Rewards', icon: Gift, tone: 'crimson', note: 'Hub' },
]

export function IconsSection() {
  return (
    <Section id="icons" index="09" eyebrow="Iconography" title="One outline icon family" intro={<>All icons come from Lucide — a consistent, open-source outline set on a 24px grid with rounded caps. Import from <Code>lucide-react</Code>; never mix in filled or third-party sets.</>}>
      <Sub title="Core library">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {library.map(([Icon, name]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-4 text-center">
              <Icon size={24} strokeWidth={1.75} className="text-navy-900" aria-hidden />
              <span className="w-full truncate font-mono text-[10px] text-ink-muted">{name}</span>
            </div>
          ))}
        </div>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Sizes & stroke">
          <div className="flex items-end gap-8 rounded-3xl border border-line bg-surface p-6">
            {[
              [16, 2, 'Inline, badges'],
              [20, 1.75, 'Buttons, nav, inputs'],
              [24, 1.75, 'Tiles, standalone'],
              [28, 1.5, 'Empty states, rewards'],
            ].map(([s, w, u]) => (
              <div key={s} className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck size={s as number} strokeWidth={w as number} className="text-navy-900" aria-hidden />
                <span className="text-caption font-semibold text-ink">{s}px</span>
                <span className="text-[11px] leading-tight text-ink-muted">
                  stroke {w}
                  <br />
                  {u}
                </span>
              </div>
            ))}
          </div>
        </Sub>
        <Sub title="Icon tiles" description="Tinted 50-step backgrounds with 700-step icons pass contrast and add colour without noise.">
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-line bg-surface p-6">
            {(['navy', 'teal', 'crimson', 'gold', 'neutral', 'navy-solid'] as TileTone[]).map((t) => (
              <IconTile key={t} icon={ShieldCheck} tone={t} size="lg" />
            ))}
            <span className="rounded-xl bg-navy-900 p-1">
              <IconTile icon={ShieldCheck} tone="glass" size="lg" />
            </span>
            <span className="mx-2 h-10 w-px bg-line" />
            <IconTile icon={PiggyBank} tone="teal" size="sm" />
            <IconTile icon={PiggyBank} tone="teal" size="md" />
            <IconTile icon={PiggyBank} tone="teal" size="lg" />
            <IconTile icon={PiggyBank} tone="teal" size="xl" />
          </div>
        </Sub>
      </div>

      <Sub title="Module icons">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {moduleIcons.map((m) => (
            <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3">
              <IconTile icon={m.icon} tone={m.tone} />
              <div>
                <p className="text-body-sm font-semibold text-ink">{m.name}</p>
                <p className="text-caption text-ink-muted">{m.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="Rules">
        <SpecList
          items={[
            ['Grid', '24 × 24 artboard, 2px padding, rounded caps & joins.'],
            ['Stroke', '1.75px default; 2px for active nav and at 16px; 1.5px at 28px+.'],
            ['Colour', 'Inherit text colour. Navy or ink by default; module tint only inside an icon tile.'],
            ['Labels', <>Icon-only buttons need <Code>aria-label</Code>. Decorative icons get <Code>aria-hidden</Code>.</>],
            ['Illustration', 'Lessons and LifeTrack use flat geometric illustration built from brand shapes — no 3D, no mascots, no clip-art.'],
          ]}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DoDont kind="do">Pair icons with a text label in navigation and primary actions.</DoDont>
          <DoDont kind="dont">Use emoji, filled icons or multicolour pictograms as UI symbols.</DoDont>
        </div>
      </Sub>
    </Section>
  )
}
