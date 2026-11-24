import { primaryNav, type NavKey } from './navItems'
import { cn } from '@/lib/cn'

export function BottomNav({ active, onChange, className }: { active: NavKey; onChange?: (k: NavKey) => void; className?: string }) {
  return (
    <nav aria-label="Primary" className={cn('border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur', className)}>
      <ul className="grid grid-cols-5">
        {primaryNav.map(({ key, label, icon: Icon }) => {
          const isActive = key === active
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange?.(key)}
                aria-current={isActive ? 'page' : undefined}
                className="group flex h-16 w-full flex-col items-center justify-center gap-1 outline-offset-[-4px]"
              >
                <span
                  className={cn(
                    'inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-150',
                    isActive ? 'bg-navy-900 text-white' : 'text-ink-muted group-hover:bg-sunken group-hover:text-ink',
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} aria-hidden />
                </span>
                <span className={cn('text-[11px] leading-none', isActive ? 'font-semibold text-navy-900' : 'font-medium text-ink-muted')}>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
