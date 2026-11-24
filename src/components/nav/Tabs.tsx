import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Underline tabs for in-page sub-navigation (e.g. Learn → Lessons / Quizzes / Saved). */
export function Tabs({ tabs, active, onChange, onDark }: { tabs: Array<{ key: string; label: string; count?: number }>; active: string; onChange: (k: string) => void; onDark?: boolean }) {
  return (
    <div role="tablist" className={cn('scrollbar-none flex gap-6 overflow-x-auto border-b', onDark ? 'border-white/15' : 'border-line')}>
      {tabs.map((t) => {
        const isActive = t.key === active
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.key)}
            className={cn(
              'relative inline-flex h-12 shrink-0 items-center gap-2 text-label transition-colors',
              onDark ? (isActive ? 'text-white' : 'font-medium text-white/65 hover:text-white') : isActive ? 'text-navy-900' : 'font-medium text-ink-muted hover:text-ink',
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn('rounded-md px-1.5 text-caption tabular-nums', isActive ? (onDark ? 'bg-white text-navy-900' : 'bg-navy-900 text-white') : onDark ? 'bg-white/10' : 'bg-sunken text-ink-muted')}>{t.count}</span>
            )}
            {isActive && <span className={cn('absolute inset-x-0 -bottom-px h-0.5 rounded-full', onDark ? 'bg-white' : 'bg-navy-900')} aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-body-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1
          return (
            <li key={item} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-semibold text-ink">
                  {item}
                </span>
              ) : (
                <a href="#navigation" className="rounded text-ink-muted underline-offset-4 hover:text-navy-900 hover:underline">
                  {item}
                </a>
              )}
              {!last && <ChevronRight size={16} className="text-ink-disabled" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
