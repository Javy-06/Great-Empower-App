import type { ReactNode } from "react";
import { Bell, ChevronLeft, Gift } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { IconButton } from "@/components/ui/Button";
import { RewardsShortcut } from "./RewardsShortcut";
import { cn } from "@/lib/cn";

export function Avatar({
  initials = "AH",
  size = 40,
  tone = "teal",
}: {
  initials?: string;
  size?: number;
  tone?: "teal" | "navy";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-body-sm font-semibold",
        tone === "teal" ? "bg-teal-100 text-teal-800" : "bg-navy-100 text-navy-900",
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/**
 * Lightweight Home app bar: sits on the navy hero with no title or divider. Brand mark on the left,
 * a compact rewards balance and a visually secondary notifications button on the right.
 */
/**
 * The app bar on every phone screen: brand, live points shortcut to the Rewards Hub and the
 * notification bell with an unread count. Page titles and back actions live in each page hero.
 */
export function AppTopBar({
  points,
  unread = 0,
  onRewardsClick,
  onNotificationsClick,
  onHome,
  account,
}: {
  points: number;
  unread?: number;
  onRewardsClick?: () => void;
  onNotificationsClick?: () => void;
  onHome?: () => void;
  /** Optional account button (demo accounts). */
  account?: ReactNode;
}) {
  return (
    <div className="flex h-14 items-center gap-1 bg-navy-950 pl-4 pr-2 text-white">
      <button
        type="button"
        onClick={onHome}
        aria-label="GREAT EMPOWER home"
        className="mr-auto inline-flex min-h-11 items-center rounded-lg"
      >
        <Logo tone="white" className="w-[112px]" />
      </button>
      <button
        type="button"
        onClick={onRewardsClick}
        aria-label={`Rewards Hub, ${points.toLocaleString("en-MY")} points`}
        className="inline-flex h-11 shrink-0 items-center"
      >
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/10 px-3.5 text-body-sm font-semibold tabular-nums text-white transition-colors hover:bg-white/15">
          <Gift size={16} className="text-gold-300" aria-hidden />
          {points.toLocaleString("en-MY")}
        </span>
      </button>
      <span className="mx-1 h-6 w-px bg-white/20" aria-hidden />
      <button
        type="button"
        onClick={onNotificationsClick}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white"
      >
        <Bell size={20} strokeWidth={1.75} aria-hidden />
        {unread > 0 && (
          <span
            className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-crimson-600 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-navy-950"
            aria-hidden
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {account}
    </div>
  );
}

/** @deprecated kept for the design-system showcase; the app uses AppTopBar. */
export const MobileHomeHeader = AppTopBar;

/** Mobile top app bar. `variant="root"` for tab roots, `"detail"` for pushed screens. */
export function MobileAppHeader({
  title,
  variant = "root",
  points = 2450,
  onDark,
  onRewardsClick,
  onBack,
  onNotificationsClick,
}: {
  title: string;
  variant?: "root" | "detail";
  points?: number;
  onDark?: boolean;
  onRewardsClick?: () => void;
  onBack?: () => void;
  onNotificationsClick?: () => void;
}) {
  return (
    <header
      className={cn(
        "flex h-16 items-center gap-2 px-4",
        onDark ? "bg-navy-900 text-white" : "border-b border-line bg-surface",
      )}
    >
      {variant === "detail" ? (
        <IconButton
          icon={ChevronLeft}
          label="Back"
          variant={onDark ? "inverse-outline" : "ghost"}
          className={cn("-ml-2", onDark && "border-0")}
          onClick={onBack}
        />
      ) : (
        <LogoMark size={32} tone={onDark ? "white" : "navy"} />
      )}
      <p
        className={cn(
          "min-w-0 flex-1 truncate text-subheading",
          variant === "root" && "ml-1",
          onDark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </p>
      <RewardsShortcut points={points} compact onDark={onDark} onClick={onRewardsClick} />
      <IconButton
        icon={Bell}
        label="Notifications"
        variant={onDark ? "inverse-outline" : "ghost"}
        badge
        className={cn("-mr-2", onDark && "border-0")}
        onClick={onNotificationsClick}
      />
    </header>
  );
}
