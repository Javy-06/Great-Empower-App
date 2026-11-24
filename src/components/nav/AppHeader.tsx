import { Bell, ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
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
