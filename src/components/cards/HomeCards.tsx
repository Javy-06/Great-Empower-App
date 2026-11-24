import { ArrowDownRight, ArrowUpRight, ChevronRight, Gift, Sparkles, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { IconTile, type TileTone } from '@/components/ui/IconTile'
import { ProgressBar, ProgressRing } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

export function StatCard({
  icon,
  tone = 'navy',
  label,
  value,
  unit,
  delta,
  deltaDirection = 'up',
  caption,
}: {
  icon: LucideIcon
  tone?: TileTone
  label: string
  value: string
  unit?: string
  delta?: string
  deltaDirection?: 'up' | 'down'
  caption?: string
}) {
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <IconTile icon={icon} tone={tone} />
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-caption font-semibold tabular-nums',
              deltaDirection === 'up' ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700',
            )}
          >
            {deltaDirection === 'up' ? <ArrowUpRight size={14} aria-hidden /> : <ArrowDownRight size={14} aria-hidden />}
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-body-sm text-ink-secondary">{label}</p>
        <p className="mt-1 text-numeric tabular-nums text-ink">
          {value}
          {unit && <span className="ml-1 text-body-sm font-medium text-ink-muted">{unit}</span>}
        </p>
        {caption && <p className="mt-1 text-caption text-ink-muted">{caption}</p>}
      </div>
    </Card>
  )
}

/** Home hero: personal wellness overview on navy. Score is illustrative, derived from learning & check-ins. */
export function WellnessOverviewCard({ name = 'Aisyah', score = 68 }: { name?: string; score?: number }) {
  return (
    <Card variant="navy" radius="3xl" padding="none" className="p-5 md:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-white/10" aria-hidden />
      <div className="pointer-events-none absolute -right-4 -top-4 size-32 rounded-full border border-white/10" aria-hidden />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <ProgressRing value={score} size={96} stroke={9} tone="white" onDark label={String(score)} caption="of 100" />
        <div className="min-w-0">
          <p className="text-body-sm text-white/70">Selamat pagi, {name}</p>
          <p className="mt-1 text-heading text-white">Your wellness score is building nicely</p>
          <p className="mt-1 text-body-sm text-teal-300">+6 this month · 2 lessons completed</p>
        </div>
      </div>
      <div className="relative mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
        {[
          ['Knowledge', 74],
          ['Planning', 61],
          ['Protection', 52],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-caption text-white/65">{l}</p>
            <p className="mt-0.5 text-body font-semibold tabular-nums text-white">{v}</p>
            <div className="mt-1.5">
              <ProgressBar value={Number(v)} tone="white" size="sm" onDark />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/** Prominent Rewards Hub entry on Home. */
export function RewardsEntryCard({ points = 2450 }: { points?: number }) {
  return (
    <Card padding="none" interactive className="group border-navy-100">
      <div className="flex items-center gap-4 p-4">
        <span className="relative inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-crimson-600 text-white" aria-hidden>
          <Gift size={26} strokeWidth={1.75} />
          <Sparkles size={14} className="absolute -right-1 -top-1 text-gold-500" fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-overline uppercase text-crimson-700">Rewards Hub</p>
          <p className="text-subheading text-ink">
            <span className="tabular-nums">{points.toLocaleString('en-MY')}</span> points ready
          </p>
          <p className="text-body-sm text-ink-secondary">3 new challenges this week</p>
        </div>
        <ChevronRight size={22} className="shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
      <div className="border-t border-line bg-gold-50/60 px-4 py-3">
        <ProgressBar value={72} tone="gold" size="sm" label="Bronze → Silver" valueLabel="1,950 / 2,500" />
      </div>
    </Card>
  )
}

export function QuickAction({ icon, label, tone = 'navy', onClick }: { icon: LucideIcon; label: string; tone?: TileTone; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-3 transition-colors hover:border-navy-200 hover:bg-navy-50/50">
      <IconTile icon={icon} tone={tone} size="lg" />
      <span className="text-body-sm font-semibold text-ink">{label}</span>
    </button>
  )
}

export function ContinueCard({ title, meta, progress }: { title: string; meta: string; progress: number }) {
  return (
    <Card padding="md" interactive className="flex items-center gap-4">
      <ProgressRing value={progress} size={52} stroke={5} tone="teal" />
      <div className="min-w-0 flex-1">
        <p className="text-caption text-ink-muted">{meta}</p>
        <p className="truncate text-body font-semibold text-ink">{title}</p>
      </div>
      <Button size="sm" variant="secondary">
        Resume
      </Button>
    </Card>
  )
}
