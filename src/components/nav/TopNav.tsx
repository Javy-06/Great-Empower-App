import type { ReactNode } from "react";
import { Bell, Gift } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { primaryNav, type NavKey } from "./navItems";
import { cn } from "@/lib/cn";

/**
 * Editorial top navigation for tablet and desktop: wordmark, the five primary destinations,
 * and the Rewards Hub points shortcut (Rewards stays separate from the five tabs).
 */
export function TopNav({
  active,
  onChange,
  onHome,
  onRewards,
  points,
  rewardsActive,
  onNotifications,
  unread = 0,
  account,
}: {
  active: NavKey | null;
  onChange: (key: NavKey) => void;
  onHome: () => void;
  onRewards: () => void;
  points: number;
  rewardsActive?: boolean;
  onNotifications?: () => void;
  unread?: number;
  /** Optional account button (demo accounts). */
  account?: ReactNode;
}) {
  return (
    <div className="mx-auto flex h-[72px] w-full max-w-[1200px] items-center gap-6 px-5 sm:px-8 lg:px-12">
      <button
        type="button"
        aria-label="GREAT EMPOWER home"
        onClick={onHome}
        className="shrink-0 rounded-lg"
      >
        <span className="lg:hidden">
          <LogoMark size={36} />
        </span>
        <span className="hidden lg:inline-flex">
          <Logo size="sm" />
        </span>
      </button>
      <nav aria-label="Primary" className="flex min-w-0 flex-1 justify-center">
        <ul className="flex items-center gap-1 lg:gap-2">
          {primaryNav.map(({ key, label }) => {
            const isActive = key === active;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onChange(key)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-11 items-center px-3 text-body-sm font-semibold transition-colors",
                    isActive ? "text-navy-950" : "text-ink-muted hover:text-navy-900",
                  )}
                >
                  {label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-1 h-0.5 rounded-full transition-colors",
                      isActive ? "bg-crimson-600" : "bg-transparent",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={onRewards}
        aria-current={rewardsActive ? "page" : undefined}
        className={cn(
          "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-body-sm font-semibold tabular-nums transition-colors",
          rewardsActive
            ? "border-navy-950 bg-navy-950 text-white"
            : "border-line text-navy-900 hover:border-navy-300",
        )}
      >
        <Gift size={16} className={rewardsActive ? "text-white" : "text-crimson-600"} aria-hidden />
        {points.toLocaleString("en-MY")}
        <span className="sr-only">points — open Rewards Hub</span>
      </button>
      {onNotifications && (
        <button
          type="button"
          onClick={onNotifications}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative -ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-navy-900 hover:bg-navy-900/5"
        >
          <Bell size={20} strokeWidth={1.75} aria-hidden />
          {unread > 0 && (
            <span
              className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-crimson-600 px-1 text-[12px] font-bold leading-4 text-white"
              aria-hidden
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      )}
      {account}
    </div>
  );
}
