import { Flame, HeartPulse, Lock, PiggyBank, ShieldCheck, Ticket, Trophy, Users, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { cn } from '@/lib/cn'

export const rewardCategories: Array<{ id: string; label: string; icon: LucideIcon; desc: string; tile: string }> = [
  { id: 'wellness', label: 'Wellness', icon: HeartPulse, desc: 'Fitness, health & mindfulness', tile: 'bg-crimson-50 text-crimson-700' },
  { id: 'financial', label: 'Financial Wellness', icon: PiggyBank, desc: 'Budgeting & saving tools', tile: 'bg-navy-50 text-navy-900' },
  { id: 'protection', label: 'Protection Education', icon: ShieldCheck, desc: 'Courses & expert sessions', tile: 'bg-teal-50 text-teal-700' },
  { id: 'community', label: 'Community & Lifestyle', icon: Users, desc: 'Events, dining & experiences', tile: 'bg-gold-50 text-gold-700' },
]

export function RewardCategoryCard({ label, icon: Icon, desc, tile, count }: (typeof rewardCategories)[number] & { count: number }) {
  return (
    <Card padding="md" interactive className="flex flex-col gap-3">
      <span className={cn('inline-flex size-12 items-center justify-center rounded-xl', tile)} aria-hidden>
        <Icon size={24} strokeWidth={1.75} />
      </span>
      <div>
        <h3 className="text-body font-semibold text-ink">{label}</h3>
        <p className="text-body-sm text-ink-muted">{desc}</p>
      </div>
      <p className="mt-auto text-caption font-semibold text-ink-secondary">{count} rewards</p>
    </Card>
  )
}

/** Voucher card with ticket notches. Values and partners are placeholders until confirmed. */
export function VoucherCard({ category, title, points, icon: Icon, tile, locked }: { category: string; title: string; points: number; icon: LucideIcon; tile: string; locked?: boolean }) {
  return (
    <div className={cn('relative flex overflow-hidden rounded-2xl border border-line bg-surface', locked && 'opacity-90')}>
      <div className={cn('flex w-20 shrink-0 flex-col items-center justify-center gap-1', tile)}>
        <Icon size={26} strokeWidth={1.75} aria-hidden />
      </div>
      {/* perforation */}
      <div className="relative w-0 border-l-2 border-dashed border-line">
        <span className="absolute -left-[9px] -top-2 size-4 rounded-full border border-line bg-canvas" aria-hidden />
        <span className="absolute -bottom-2 -left-[9px] size-4 rounded-full border border-line bg-canvas" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <p className="truncate text-overline uppercase text-ink-muted">{category}</p>
          <Badge tone="neutral" size="sm" variant="outline">
            Sample
          </Badge>
        </div>
        <h3 className="text-body font-semibold text-ink">{title}</h3>
        <p className="text-caption text-ink-muted">Partner and value to be confirmed</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-body-sm font-bold tabular-nums text-navy-900">
            <Ticket size={16} className="text-crimson-600" aria-hidden />
            {points.toLocaleString('en-MY')} pts
          </span>
          {locked ? (
            <Badge tone="neutral" icon={Lock}>
              Silver tier
            </Badge>
          ) : (
            <Button size="sm" variant="primary" disabled title="Voucher redemption is not available in this demo" aria-label={`Demo only: ${title} cannot be redeemed`}>
              Demo only
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ChallengeCard({ title, desc, progress, total, points, daysLeft }: { title: string; desc: string; progress: number; total: number; points: number; daysLeft: number }) {
  return (
    <Card padding="md" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-crimson-50 text-crimson-700" aria-hidden>
          <Flame size={20} strokeWidth={1.75} />
        </span>
        <Badge tone="gold" variant="soft">
          +{points} pts
        </Badge>
      </div>
      <div>
        <h3 className="text-body font-semibold text-ink">{title}</h3>
        <p className="text-body-sm text-ink-muted">{desc}</p>
      </div>
      <ProgressBar value={progress} max={total} tone="crimson" size="sm" label={`${daysLeft} days left`} valueLabel={`${progress}/${total}`} />
    </Card>
  )
}

export function AchievementBadge({ label, earned, icon: Icon = Trophy }: { label: string; earned?: boolean; icon?: LucideIcon }) {
  return (
    <div className="flex w-20 flex-col items-center gap-2 text-center">
      <span
        className={cn(
          'relative inline-flex size-16 items-center justify-center rounded-full',
          earned ? 'bg-[radial-gradient(circle_at_30%_30%,var(--color-gold-100),var(--color-gold-300))] text-gold-700 ring-4 ring-gold-50' : 'border-2 border-dashed border-line-strong bg-sunken text-ink-disabled',
        )}
        aria-hidden
      >
        <Icon size={26} strokeWidth={1.75} />
      </span>
      <span className={cn('text-caption', earned ? 'font-semibold text-ink' : 'text-ink-muted')}>{label}</span>
    </div>
  )
}

export function WalletCard({ points = 2450 }: { points?: number }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-navy-950 p-5 text-white">
      <div className="pointer-events-none absolute -right-10 -top-20 size-56 rounded-full bg-crimson-600/25 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 left-10 size-56 rounded-full bg-teal-600/25 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-overline uppercase text-white/70">Points wallet</p>
          <Badge tone="gold" variant="solid" size="sm">
            Bronze
          </Badge>
        </div>
        <p className="mt-3 text-numeric-xl tabular-nums">{points.toLocaleString('en-MY')}</p>
        <p className="text-body-sm text-white/70">available points</p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-body-sm">
          <div>
            <p className="text-caption text-white/60">Earned</p>
            <p className="font-semibold tabular-nums">3,820</p>
          </div>
          <div>
            <p className="text-caption text-white/60">Redeemed</p>
            <p className="font-semibold tabular-nums">1,370</p>
          </div>
          <div>
            <p className="text-caption text-white/60">Expiring</p>
            <p className="font-semibold tabular-nums text-gold-300">120</p>
          </div>
        </div>
      </div>
    </div>
  )
}
