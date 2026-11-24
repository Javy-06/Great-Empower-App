import { useState } from 'react'
import {
  Banknote,
  BriefcaseBusiness,
  CarFront,
  ChevronRight,
  Dice5,
  GraduationCap,
  HeartPulse,
  Hospital,
  LifeBuoy,
  Plane,
  Route,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { IconTile } from '@/components/ui/IconTile'
import { Slider } from '@/components/ui/Field'
import { cn } from '@/lib/cn'

const rm = (v: number) => `RM ${v.toLocaleString('en-MY')}`

/** Interactive calculator pattern: inputs on top, consequence summary below. Figures are illustrative only. */
export function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(2200)
  const [months, setMonths] = useState(6)
  const [saved, setSaved] = useState(5000)
  const target = expenses * months
  const pct = Math.min(100, Math.round((saved / target) * 100))
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <IconTile icon={LifeBuoy} tone="teal" />
        <div>
          <h3 className="text-subheading text-ink">Emergency fund calculator</h3>
          <p className="text-caption text-ink-muted">Educational estimate · not financial advice</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Slider label="Monthly expenses" min={800} max={6000} step={100} value={expenses} onChange={setExpenses} format={rm} />
        <Slider label="Months of cover" min={3} max={12} value={months} onChange={setMonths} format={(v) => `${v} mo`} />
        <Slider label="Already saved" min={0} max={30000} step={500} value={saved} onChange={setSaved} format={rm} />
      </div>
      <div className="bg-navy-900 p-4 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption text-white/70">Suggested target</p>
            <p className="text-numeric tabular-nums">{rm(target)}</p>
          </div>
          <Badge tone={pct >= 100 ? 'success' : pct >= 50 ? 'teal' : 'warning'} variant="solid">
            {pct}% there
          </Badge>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-teal-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-caption text-white/70">
          {pct >= 100 ? 'You have reached your target.' : `${rm(Math.max(0, target - saved))} to go — about ${Math.ceil(Math.max(0, target - saved) / 300)} months at RM 300/mo.`}
        </p>
      </div>
    </Card>
  )
}

export function ScenarioCard({ icon, title, prompt, impact, tone = 'crimson' }: { icon: LucideIcon; title: string; prompt: string; impact: string; tone?: 'crimson' | 'teal' | 'navy' }) {
  return (
    <Card padding="md" interactive className="group flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <IconTile icon={icon} tone={tone} size="lg" />
        <Badge tone="neutral" size="sm">
          Scenario
        </Badge>
      </div>
      <div>
        <h3 className="text-subheading text-ink">{title}</h3>
        <p className="mt-1 text-body-sm text-ink-secondary">{prompt}</p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
        <span className="text-caption font-semibold text-ink-muted">{impact}</span>
        <ChevronRight size={20} className="text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Card>
  )
}

export const lifeTrackResources: Array<{ id: string; label: string; icon: LucideIcon; value: number; bar: string; text: string }> = [
  { id: 'cash', label: 'Cash', icon: Banknote, value: 62, bar: 'bg-navy-900', text: 'text-navy-900' },
  { id: 'health', label: 'Health', icon: HeartPulse, value: 80, bar: 'bg-crimson-600', text: 'text-crimson-700' },
  { id: 'emergency', label: 'Emergency Fund', icon: LifeBuoy, value: 35, bar: 'bg-teal-600', text: 'text-teal-700' },
  { id: 'protection', label: 'Protection', icon: ShieldCheck, value: 48, bar: 'bg-navy-500', text: 'text-navy-600' },
  { id: 'stability', label: 'Financial Stability', icon: Scale, value: 55, bar: 'bg-gold-500', text: 'text-gold-700' },
]

export function ResourceMeter({ label, icon: Icon, value, bar, text, compact }: (typeof lifeTrackResources)[number] & { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn('inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface shadow-e1', text)} aria-hidden>
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        {!compact && (
          <div className="flex justify-between text-caption">
            <span className="truncate font-medium text-ink-secondary">{label}</span>
            <span className="font-semibold tabular-nums text-ink">{value}</span>
          </div>
        )}
        <div className={cn('h-1.5 overflow-hidden rounded-full bg-line', !compact && 'mt-1')} role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
          <div className={cn('h-full rounded-full', bar)} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  )
}

type TileKind = 'milestone' | 'opportunity' | 'risk' | 'start'
const boardTiles: Array<{ label: string; icon: LucideIcon; kind: TileKind }> = [
  { label: 'Start', icon: Route, kind: 'start' },
  { label: 'PTPTN', icon: GraduationCap, kind: 'milestone' },
  { label: 'First job', icon: BriefcaseBusiness, kind: 'opportunity' },
  { label: 'Car loan', icon: CarFront, kind: 'milestone' },
  { label: 'Clinic visit', icon: Hospital, kind: 'risk' },
  { label: 'Raya trip', icon: Plane, kind: 'opportunity' },
  { label: 'Side hustle', icon: Banknote, kind: 'opportunity' },
  { label: 'Phone broke', icon: LifeBuoy, kind: 'risk' },
]

const kindCls: Record<TileKind, string> = {
  start: 'bg-navy-900 text-white border-navy-900',
  milestone: 'bg-surface text-navy-900 border-navy-200',
  opportunity: 'bg-teal-50 text-teal-800 border-teal-200',
  risk: 'bg-crimson-50 text-crimson-700 border-crimson-200',
}

/** Illustrated board fragment used in the LifeTrack entry and module previews. */
export function LifeTrackBoard({ position = 2 }: { position?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="LifeTrack board preview">
      {boardTiles.map((t, i) => {
        // Snake layout: second row reads right-to-left.
        const order = i < 4 ? i : 7 - (i - 4)
        const Icon = t.icon
        return (
          <div
            key={t.label}
            style={{ order }}
            className={cn('relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-1 text-center', kindCls[t.kind])}
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden />
            <span className="text-[10px] font-semibold leading-tight">{t.label}</span>
            {i === position && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 items-center justify-center rounded-full bg-crimson-600 px-1.5 text-[10px] font-bold text-white ring-2 ring-white" aria-label="You are here">
                You
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Compact Home preview. The full playable board lives inside the LifeTrack experience in Simulate. */
export function LifeTrackPreview() {
  const previewTiles = [boardTiles[0], boardTiles[2], boardTiles[4], boardTiles[6]]
  return (
    <div aria-label="LifeTrack board preview" className="rounded-2xl border border-teal-200/70 bg-white/55 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-caption font-semibold text-navy-900">Board preview</p>
        <span className="text-[10px] font-medium text-ink-muted">Representative spaces</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {previewTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <div key={tile.label} className={cn('flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-1 text-center', kindCls[tile.kind])}>
              <Icon size={16} strokeWidth={1.75} aria-hidden />
              <span className="text-[9px] font-semibold leading-tight">{tile.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function LifeTrackEntryCard() {
  const [position, setPosition] = useState(2)
  const [dice, setDice] = useState<number | null>(null)
  const [showHow, setShowHow] = useState(false)
  const [started, setStarted] = useState(false)

  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1
    setDice(result)
    setPosition((current) => (current + result) % boardTiles.length)
    setStarted(true)
  }

  return (
    <Card padding="none" radius="3xl" className="overflow-hidden border-teal-200">
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
        <div className="flex min-w-0 flex-col p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Badge tone="teal" variant="solid" icon={Dice5}>
              LifeTrack
            </Badge>
            <Badge tone="neutral" size="sm">
              Inside Simulate
            </Badge>
          </div>
          <h3 className="mt-3 text-heading text-ink">Play your twenties, one decision at a time</h3>
          <p className="mt-1.5 text-body-sm text-ink-secondary">From your first payslip to unexpected bills — see how each choice moves your five life resources.</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {lifeTrackResources.slice(0, 3).map((r) => (
              <ResourceMeter key={r.id} {...r} />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="support" leadingIcon={Dice5} onClick={rollDice}>
              {started ? 'Roll again' : 'Continue game'}
            </Button>
            <Button variant="ghost" onClick={() => setShowHow((value) => !value)} aria-expanded={showHow}>
              How to play
            </Button>
          </div>
          {started && (
            <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-caption text-teal-800">
              Dice: {dice} · You moved to {boardTiles[position].label}. This is a demo decision journey.
            </p>
          )}
          {showHow && (
            <p className="mt-3 text-caption text-ink-secondary">
              Roll the dice, move across the life journey and consider how each money or health event changes your resources.
            </p>
          )}
        </div>
        <div className="bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-navy-50))] p-5">
          <LifeTrackBoard position={position} />
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-caption text-ink-secondary">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-teal-600" /> Opportunity
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full bg-crimson-600" /> Risk
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full border border-navy-300 bg-white" /> Milestone
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
