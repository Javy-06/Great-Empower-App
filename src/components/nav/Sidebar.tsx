import { ChevronRight, LogOut, Settings } from 'lucide-react'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { ProgressBar } from '@/components/ui/Progress'
import { primaryNav, type NavKey } from './navItems'
import { Avatar } from './AppHeader'
import { cn } from '@/lib/cn'

export function Sidebar({ active, onChange, points = 2450, onRewardsClick, onLogoClick, onSettingsClick, className }: { active: NavKey; onChange?: (k: NavKey) => void; points?: number; onRewardsClick?: () => void; onLogoClick?: () => void; onSettingsClick?: () => void; className?: string }) {
  return (
    <aside className={cn('flex w-[264px] shrink-0 flex-col border-r border-line bg-surface', className)}>
      <div className="flex h-18 items-center px-6 py-5">
        <button type="button" aria-label="Go to Home" onClick={onLogoClick} className="inline-flex rounded-lg">
          <Logo size="sm" />
        </button>
      </div>
      <nav aria-label="Primary" className="px-3">
        <p className="px-3 pb-2 pt-2 text-overline uppercase text-ink-muted">Menu</p>
        <ul className="flex flex-col gap-1">
          {primaryNav.map(({ key, label, icon: Icon }) => {
            const isActive = key === active
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onChange?.(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-label transition-colors duration-150',
                    isActive ? 'bg-navy-50 text-navy-900' : 'font-medium text-ink-secondary hover:bg-sunken hover:text-ink',
                  )}
                >
                  {isActive && <span className="absolute -left-3 top-3 h-6 w-1 rounded-r-full bg-crimson-600" aria-hidden />}
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} aria-hidden />
                  {label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-6 px-3">
        <button type="button" onClick={onRewardsClick} className="group w-full rounded-2xl bg-navy-900 p-4 text-left text-white transition-colors hover:bg-navy-800">
          <div className="flex items-center justify-between">
            <span className="text-overline uppercase text-white/70">Rewards Hub</span>
            <ChevronRight size={18} className="text-white/70 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
          <p className="mt-2 text-numeric tabular-nums">
            {points.toLocaleString('en-MY')} <span className="text-body-sm font-medium text-white/70">pts</span>
          </p>
          <div className="mt-3">
            <ProgressBar value={72} tone="gold" size="sm" onDark />
          </div>
          <p className="mt-2 text-caption text-white/70">550 pts to Silver tier</p>
        </button>
      </div>

      <div className="mt-auto border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar initials="AH" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold text-ink">Aisyah Hassan</p>
            <p className="truncate text-caption text-ink-muted">Demo profile · Bronze</p>
          </div>
          <button type="button" aria-label="Settings" onClick={onSettingsClick} className="inline-flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-sunken">
            <Settings size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}

/** Tablet rail: icon-only primary navigation at 80px. */
export function NavRail({ active, onChange, onLogoClick, onSignOutClick }: { active: NavKey; onChange?: (k: NavKey) => void; onLogoClick?: () => void; onSignOutClick?: () => void }) {
  return (
    <aside className="flex w-20 shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-4">
      <button type="button" aria-label="Go to Home" onClick={onLogoClick} className="inline-flex rounded-lg">
        <LogoMark size={36} />
      </button>
      <div className="h-4" />
      {primaryNav.map(({ key, label, icon: Icon }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            aria-current={isActive ? 'page' : undefined}
            className="flex w-full flex-col items-center gap-1 py-1.5"
          >
            <span className={cn('inline-flex h-8 w-12 items-center justify-center rounded-full', isActive ? 'bg-navy-900 text-white' : 'text-ink-muted hover:bg-sunken')}>
              <Icon size={20} strokeWidth={isActive ? 2 : 1.75} aria-hidden />
            </span>
            <span className={cn('text-[11px]', isActive ? 'font-semibold text-navy-900' : 'font-medium text-ink-muted')}>{label}</span>
          </button>
        )
      })}
      <button type="button" aria-label="Sign out" title="Demo only · No signed-in account" onClick={onSignOutClick} className="mt-auto inline-flex size-12 items-center justify-center rounded-xl text-ink-muted hover:bg-sunken">
        <LogOut size={20} strokeWidth={1.75} aria-hidden />
      </button>
    </aside>
  )
}
