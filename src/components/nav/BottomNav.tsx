import { primaryNav, type NavKey } from './navItems'
import { cn } from '@/lib/cn'

/**
 * Floating, pill-shaped glass navigation. It sits above the phone's own home indicator using the
 * safe-area inset — it never imitates the operating system's navigation buttons.
 */
export function BottomNav({ active, onChange, className }: { active: NavKey; onChange?: (k: NavKey) => void; className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        'ge-glass-nav rounded-full px-1.5 py-1.5 ring-1 ring-white/60 shadow-[0_12px_32px_-10px_rgb(10_28_51/0.35),0_2px_6px_-2px_rgb(10_28_51/0.12)]',
        className,
      )}
    >
      <ul className="grid grid-cols-5">
        {primaryNav.map(({ key, label, icon: Icon }) => {
          const isActive = key === active
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onChange?.(key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-full outline-offset-[-3px] transition-[background-color,color,box-shadow] duration-300',
                  isActive ? 'bg-navy-900 text-white shadow-e2' : 'text-navy-900/70 hover:bg-navy-900/5 hover:text-navy-900',
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.1 : 1.75} aria-hidden />
                <span className={cn('text-[11px] leading-none', isActive ? 'font-semibold' : 'font-medium')}>{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
