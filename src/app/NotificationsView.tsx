import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Bell, BellOff, BookOpen, CheckCheck, Gamepad2, Gift, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { goBack } from "@/lib/nav";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/data/notifications";
import { cn } from "@/lib/cn";

const filters: Array<{ key: "all" | NotificationCategory; label: string; icon: typeof Gift }> = [
  { key: "all", label: "All", icon: Bell },
  { key: "updates", label: "Updates", icon: Megaphone },
  { key: "learning", label: "Learning", icon: BookOpen },
  { key: "gameplay", label: "Gameplay", icon: Gamepad2 },
  { key: "rewards", label: "Rewards", icon: Gift },
];

const categoryIcon: Record<NotificationCategory, typeof Gift> = {
  updates: Megaphone,
  learning: BookOpen,
  gameplay: Gamepad2,
  rewards: Gift,
};

const labelTone: Record<NotificationCategory, string> = {
  updates: "bg-navy-100 text-navy-800",
  learning: "bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-300/60",
  gameplay: "bg-success-50 text-success-700",
  rewards: "bg-crimson-50 text-crimson-700",
};

const fmt = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });

/** "Recent" = within 7 days of the newest item; the rest are grouped as "Earlier". */
function groupOf(n: AppNotification, newest: number) {
  return newest - new Date(`${n.date}T00:00:00`).getTime() <= 7 * 86_400_000 ? "Recent" : "Earlier";
}

export function NotificationsView() {
  const { items, isRead, unread } = useNotifications();
  const [filter, setFilter] = useState<"all" | NotificationCategory>("all");
  const shown = items
    .filter((n) => filter === "all" || n.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const newest = Math.max(...items.map((n) => new Date(`${n.date}T00:00:00`).getTime()));
  const unreadIn = (key: "all" | NotificationCategory) =>
    items.filter((n) => (key === "all" || n.category === key) && !isRead(n.id)).length;

  const open = (n: AppNotification) => {
    markNotificationRead(n.id);
    if (n.external) window.open(n.href, "_blank", "noopener,noreferrer");
    else {
      window.location.hash = n.href;
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <>
      {/* Header: compact navy band — back, title with the bulk action beside it, one line of context. */}
      <section aria-labelledby="notifications-title" className="ge-pagehero relative isolate overflow-hidden text-white">
        <Container className="relative pb-14 pt-3 md:pb-16 md:pt-12">
          <button
            type="button"
            onClick={() => goBack("app/home")}
            className="-ml-2 inline-flex min-h-11 items-center gap-3 rounded-lg px-2 text-[1.0625rem] font-semibold text-white md:hidden"
          >
            <ArrowLeft size={22} aria-hidden />
            Back
          </button>
          <div className="mt-2 flex items-center justify-between gap-3 md:mt-0">
            <h1 id="notifications-title" className="font-brand text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.01em] sm:text-[2.75rem] md:text-[3.25rem]">
              Notifications
            </h1>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              disabled={unread === 0}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-body-sm font-semibold ring-1 backdrop-blur transition-[background-color,color,box-shadow] duration-200",
                unread > 0
                  ? "bg-white text-navy-950 shadow-e2 ring-white hover:bg-navy-50"
                  : "cursor-default bg-white/10 text-white/70 ring-white/15",
              )}
            >
              <CheckCheck size={17} aria-hidden />
              {unread > 0 ? "Mark all as read" : "All read"}
            </button>
          </div>
          <p className="mt-2 max-w-[30rem] text-body-sm leading-relaxed text-white/75 sm:text-body">
            News, learning updates and rewards in one place.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-caption font-semibold text-teal-200" role="status">
            {unread > 0 ? (
              <>
                <span className="size-2 rounded-full bg-crimson-500" aria-hidden />
                {unread} unread
              </>
            ) : (
              <>
                <CheckCheck size={14} aria-hidden /> You're all caught up
              </>
            )}
          </p>
        </Container>
      </section>

      {/* Content sheet overlaps the header, like the app's other card-on-navy pages. */}
      <div className="relative -mt-7 rounded-t-[1.75rem] bg-canvas pt-5 md:-mt-8">
        <Container>
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="-mx-5 flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 py-1.5 scrollbar-none md:flex-wrap"
          >
            {filters.map(({ key, label, icon: Icon }) => {
              const selected = filter === key;
              const count = unreadIn(key);
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full pl-3.5 pr-4 text-body-sm font-semibold transition-[background-color,color,box-shadow] duration-300",
                    selected
                      ? "bg-navy-900 text-white shadow-e2"
                      : "bg-surface text-navy-900 shadow-e1 ring-1 ring-ink/[0.08] hover:bg-navy-50",
                  )}
                >
                  <Icon size={16} aria-hidden />
                  {label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-bold leading-5 transition-colors duration-300",
                        selected ? "bg-white text-navy-950" : "bg-crimson-600 text-white",
                      )}
                    >
                      {count}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Re-keyed per filter so the new list fades in rather than snapping. */}
          <div key={filter} className="ge-reveal">
            {shown.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-[1.25rem] bg-surface px-6 py-14 text-center ring-1 ring-ink/[0.06]">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-sunken text-ink-muted">
                  <BellOff size={24} aria-hidden />
                </span>
                <p className="mt-4 text-subheading text-navy-950">Nothing here yet</p>
                <p className="mt-1 text-body-sm text-ink-muted">New items in this category will appear here.</p>
              </div>
            ) : (
              (["Recent", "Earlier"] as const).map((group) => {
                const list = shown.filter((n) => groupOf(n, newest) === group);
                if (!list.length) return null;
                return (
                  <section key={group} aria-label={group} className="mt-6">
                    <h2 className="flex items-baseline gap-2 text-heading text-navy-950">
                      {group}
                      <span className="text-caption font-semibold text-ink-muted">{list.length}</span>
                    </h2>
                    <ul className="mt-3 grid gap-3">
                      {list.map((n) => {
                        const read = isRead(n.id);
                        const Icon = categoryIcon[n.category];
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => open(n)}
                              className={cn(
                                "ge-lift group relative flex w-full gap-3.5 overflow-hidden rounded-[1.25rem] p-3 text-left ring-1 sm:gap-4 sm:p-4",
                                read
                                  ? "bg-surface shadow-e1 ring-ink/[0.07] hover:ring-ink/15"
                                  : "bg-gradient-to-br from-navy-50 via-white to-white shadow-e1 ring-navy-200/80 hover:ring-navy-300",
                              )}
                            >
                              {!read && <span className="sr-only">Unread. </span>}
                              {n.image ? (
                                <span className="ge-zoom relative block size-[5.5rem] shrink-0 overflow-hidden rounded-2xl bg-sunken ring-1 ring-ink/[0.06] sm:size-28">
                                  <img src={n.image} alt="" loading="lazy" className="ge-skeleton h-full w-full object-cover" />
                                </span>
                              ) : (
                                <span className={cn("inline-flex size-[5.5rem] shrink-0 items-center justify-center rounded-2xl sm:size-28", labelTone[n.category])} aria-hidden>
                                  <Icon size={28} />
                                </span>
                              )}
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                  <span className={cn("min-w-0 rounded-md px-2 py-0.5 text-[12px] font-bold uppercase leading-tight tracking-[0.06em]", labelTone[n.category])}>
                                    {n.label}
                                  </span>
                                  <span className="flex shrink-0 items-center gap-2 text-caption text-ink-muted">
                                    {fmt(n.date)}
                                    {!read && <span className="size-2.5 rounded-full bg-crimson-600 ring-[3px] ring-crimson-100" aria-hidden />}
                                  </span>
                                </span>
                                <span className={cn("mt-1.5 line-clamp-2 text-body leading-snug text-navy-950", read ? "font-medium" : "font-semibold")}>
                                  {n.title}
                                </span>
                                <span className="mt-1 line-clamp-2 text-body-sm text-ink-secondary">{n.body}</span>
                                <span className="mt-2 block text-body-sm font-semibold text-crimson-600">
                                  {n.external ? (
                                    <>
                                      Read on {n.source} <ArrowUpRight size={15} className="inline align-[-2px] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                                    </>
                                  ) : (
                                    <>
                                      Open <ArrowRight size={15} className="inline align-[-2px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                                    </>
                                  )}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })
            )}
          </div>
          <p className="mt-6 text-caption text-ink-muted">
            Notifications appear inside the app. Push notifications are not available yet.
          </p>
        </Container>
      </div>
    </>
  );
}
