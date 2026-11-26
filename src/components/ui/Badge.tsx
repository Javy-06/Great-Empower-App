import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'navy' | 'teal' | 'crimson' | 'gold' | 'success' | 'warning' | 'error' | 'info'

const soft: Record<BadgeTone, string> = {
  neutral: 'bg-sunken text-ink-secondary',
  navy: 'bg-navy-50 text-navy-900',
  teal: 'bg-teal-50 text-teal-700',
  crimson: 'bg-crimson-50 text-crimson-700',
  gold: 'bg-gold-50 text-gold-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  error: 'bg-error-50 text-error-700',
  info: 'bg-info-50 text-info-600',
}

const solid: Record<BadgeTone, string> = {
  neutral: 'bg-ink-secondary text-white',
  navy: 'bg-navy-900 text-white',
  teal: 'bg-teal-600 text-white',
  crimson: 'bg-crimson-600 text-white',
  gold: 'bg-gold-500 text-navy-950',
  success: 'bg-success-700 text-white',
  warning: 'bg-warning-500 text-navy-950',
  error: 'bg-error-700 text-white',
  info: 'bg-info-600 text-white',
}

const outline: Record<BadgeTone, string> = {
  neutral: 'border-line-strong text-ink-secondary',
  navy: 'border-navy-200 text-navy-900',
  teal: 'border-teal-200 text-teal-700',
  crimson: 'border-crimson-200 text-crimson-700',
  gold: 'border-gold-300 text-gold-700',
  success: 'border-success-200 text-success-700',
  warning: 'border-warning-200 text-warning-700',
  error: 'border-error-200 text-error-700',
  info: 'border-info-200 text-info-600',
}

const dotColor: Record<BadgeTone, string> = {
  neutral: 'bg-ink-muted',
  navy: 'bg-navy-900',
  teal: 'bg-teal-600',
  crimson: 'bg-crimson-600',
  gold: 'bg-gold-500',
  success: 'bg-success-600',
  warning: 'bg-warning-500',
  error: 'bg-error-600',
  info: 'bg-info-600',
}

export interface BadgeProps {
  tone?: BadgeTone
  variant?: 'soft' | 'solid' | 'outline'
  size?: 'sm' | 'md'
  icon?: LucideIcon
  dot?: boolean
  className?: string
  children: ReactNode
}

export function Badge({ tone = 'neutral', variant = 'soft', size = 'md', icon: Icon, dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md font-semibold',
        size === 'sm' ? 'h-5 px-1.5 text-[11px] leading-4' : 'h-6 px-2 text-caption font-semibold',
        variant === 'soft' && soft[tone],
        variant === 'solid' && solid[tone],
        variant === 'outline' && cn('border bg-transparent', outline[tone]),
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', variant === 'solid' ? 'bg-current' : dotColor[tone])} aria-hidden />}
      {Icon && <Icon size={size === 'sm' ? 12 : 14} strokeWidth={2} aria-hidden />}
      {children}
    </span>
  )
}

/** Chip: rounded-full, used for filters and tags. Selected chips use navy fill. */
export function Chip({
  selected,
  onClick,
  icon: Icon,
  children,
  tone = 'light',
}: {
  selected?: boolean
  onClick?: () => void
  icon?: LucideIcon
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-body-sm font-medium transition-colors duration-200',
        tone === 'light' &&
          (selected
            ? 'border-navy-900 bg-navy-900 text-white'
            : 'border-line-strong bg-surface text-ink-secondary hover:border-navy-300 hover:text-navy-900'),
        tone === 'dark' &&
          (selected ? 'border-white bg-white text-navy-900' : 'border-white/25 text-white/80 hover:bg-white/10 hover:text-white'),
      )}
    >
      {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
      {children}
    </button>
  )
}
