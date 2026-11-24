import { Gift } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Persistent header entry point to the Rewards Hub. */
export function RewardsShortcut({ points, compact, onDark, onClick }: { points: number; compact?: boolean; onDark?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Rewards Hub, ${points.toLocaleString('en-MY')} points`}
      className={cn(
        'inline-flex h-12 shrink-0 items-center gap-2 rounded-full pl-1.5 pr-4 transition-colors duration-150',
        onDark ? 'bg-white/10 text-white hover:bg-white/15' : 'border border-line bg-surface text-navy-900 hover:border-navy-200 hover:bg-navy-50',
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-full bg-crimson-600 text-white">
        <Gift size={18} strokeWidth={2} aria-hidden />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-body-sm font-bold tabular-nums">{points.toLocaleString('en-MY')}</span>
        {!compact && <span className={cn('mt-0.5 text-[11px] font-medium', onDark ? 'text-white/70' : 'text-ink-muted')}>pts</span>}
      </span>
    </button>
  )
}
