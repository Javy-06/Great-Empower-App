import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ProgressTone = 'teal' | 'navy' | 'crimson' | 'gold' | 'white'

const fillCls: Record<ProgressTone, string> = {
  teal: 'bg-teal-600',
  navy: 'bg-navy-900',
  crimson: 'bg-crimson-600',
  gold: 'bg-gold-500',
  white: 'bg-white',
}

export function ProgressBar({
  value,
  max = 100,
  tone = 'teal',
  size = 'md',
  label,
  valueLabel,
  onDark,
}: {
  value: number
  max?: number
  tone?: ProgressTone
  size?: 'sm' | 'md' | 'lg'
  label?: string
  valueLabel?: string
  onDark?: boolean
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="w-full">
      {(label || valueLabel) && (
        <div className={cn('mb-2 flex items-baseline justify-between text-body-sm', onDark ? 'text-white/80' : 'text-ink-secondary')}>
          {label && <span className="font-medium">{label}</span>}
          {valueLabel && <span className={cn('font-semibold tabular-nums', onDark ? 'text-white' : 'text-ink')}>{valueLabel}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        className={cn('w-full overflow-hidden rounded-full', onDark ? 'bg-white/15' : 'bg-sunken', size === 'sm' ? 'h-1.5' : size === 'md' ? 'h-2' : 'h-3')}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-500 ease-out', fillCls[tone])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const ringStroke: Record<ProgressTone, string> = {
  teal: 'stroke-teal-600',
  navy: 'stroke-navy-900',
  crimson: 'stroke-crimson-600',
  gold: 'stroke-gold-500',
  white: 'stroke-white',
}

export function ProgressRing({
  value,
  size = 72,
  stroke = 8,
  tone = 'teal',
  label,
  caption,
  onDark,
}: {
  value: number
  size?: number
  stroke?: number
  tone?: ProgressTone
  label?: string
  caption?: string
  onDark?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (Math.min(100, value) / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label ?? 'Progress'} ${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={onDark ? 'stroke-white/15' : 'stroke-sunken'} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(ringStroke[tone], 'transition-[stroke-dashoffset] duration-700 ease-out')}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold tabular-nums leading-none', size >= 96 ? 'text-numeric' : 'text-body', onDark ? 'text-white' : 'text-ink')}>{label ?? `${value}%`}</span>
        {caption && <span className={cn('mt-1 text-caption', onDark ? 'text-white/70' : 'text-ink-muted')}>{caption}</span>}
      </div>
    </div>
  )
}

/** Segmented progress — used for multi-part lessons and quizzes. */
export function SegmentedProgress({ total, current, tone = 'teal' }: { total: number; current: number; tone?: ProgressTone }) {
  return (
    <div className="flex w-full gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < current ? fillCls[tone] : 'bg-sunken')} />
      ))}
    </div>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center last:flex-none sm:last:flex-1" aria-current={active ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done || active ? 'bg-teal-600' : 'bg-line')} />
              <span
                className={cn(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-body-sm font-semibold',
                  done && 'bg-teal-600 text-white',
                  active && 'border-2 border-teal-600 bg-surface text-teal-700',
                  !done && !active && 'border-2 border-line bg-surface text-ink-muted',
                )}
              >
                {done ? <Check size={16} strokeWidth={2.5} aria-hidden /> : i + 1}
              </span>
              <span className={cn('h-0.5 flex-1', i === steps.length - 1 ? 'bg-transparent' : done ? 'bg-teal-600' : 'bg-line')} />
            </div>
            <span className={cn('hidden text-caption sm:block', active ? 'text-ink' : 'text-ink-muted')}>{s}</span>
          </li>
        )
      })}
    </ol>
  )
}
