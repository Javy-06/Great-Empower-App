import { useState } from "react";
import { ArrowRight, ArrowUpRight, BellOff, BookOpen, Check, Gamepad2, Gift, Megaphone } from "lucide-react";
import { Container } from "@/components/layout/Editorial";
import { PageHero } from "@/components/layout/PageHero";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
  type AppNotification,
  type NotificationCategory,
} from "@/data/notifications";
import { cn } from "@/lib/cn";

const filters: Array<{ key: "all" | NotificationCategory; label: string; icon?: typeof Gift }> = [
  { key: "all", label: "All" },
  { key: "updates", label: "Updates", icon: Megaphone },
  { key: "learning", label: "Learning", icon: BookOpen },
  { key: "gameplay", label: "Gameplay", icon: Gamepad2 },
  { key: "rewards", label: "Rewards", icon: Gift },
];

const labelTone: Record<NotificationCategory, string> = {
  updates: "bg-navy-100 text-navy-800",
  learning: "bg-gold-100 text-gold-700",
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
      <PageHero
        eyebrow="Stay in the loop"
        title="Notifications"
        text="News, learning updates and rewards in one place."
        backLabel="Back"
        onBack={() => history.back()}
        titleId="notifications-title"
      >
        <button
          type="button"
          onClick={markAllNotificationsRead}
          disabled={unread === 0}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white/12 px-4 text-body-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20 disabled:opacity-50"
        >
          Mark all as read <Check size={16} aria-hidden />
        </button>
      </PageHero>

      <div className="-mt-4 rounded-t-[1.5rem] bg-canvas pt-4">
        <Container>
          <div role="tablist" aria-label="Filter notifications" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none">
            {filters.map(({ key, label, icon: Icon }) => {
              const selected = filter === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={selected}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={cn(
                    "relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-body-sm font-semibold transition-colors",
                    selected ? "bg-navy-900 text-white" : "bg-surface text-navy-900 ring-1 ring-ink/10 hover:bg-navy-50",
                  )}
                >
                  {Icon && <Icon size={16} aria-hidden />}
                  {label}
                  {key === "all" && unread > 0 && (
                    <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-crimson-600 px-1.5 text-[11px] font-bold leading-5 text-white">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {shown.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
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
                  <h2 className="text-heading text-navy-950">{group}</h2>
                  <ul className="mt-3 grid gap-3">
                    {list.map((n) => {
                      const read = isRead(n.id);
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => open(n)}
                            className={cn(
                              "group flex w-full gap-3.5 rounded-2xl p-3 text-left ring-1 transition-colors sm:p-4",
                              read ? "bg-surface ring-ink/[0.07] hover:ring-ink/15" : "bg-navy-50/70 ring-navy-200/70 hover:ring-navy-300",
                            )}
                          >
                            {n.image && (
                              <img
                                src={n.image}
                                alt=""
                                loading="lazy"
                                className="ge-skeleton size-20 shrink-0 rounded-xl object-cover sm:size-24"
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-2">
                                <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]", labelTone[n.category])}>
                                  {n.label}
                                </span>
                                <span className="flex items-center gap-2 text-caption text-ink-muted">
                                  {fmt(n.date)}
                                  {!read && <span className="size-2 rounded-full bg-crimson-600" aria-label="Unread" />}
                                </span>
                              </span>
                              <span className="mt-1.5 block text-body font-semibold leading-snug text-navy-950">{n.title}</span>
                              <span className="mt-1 line-clamp-2 block text-body-sm text-ink-secondary">{n.body}</span>
                              <span className="mt-1.5 inline-flex items-center gap-1 text-body-sm font-semibold text-crimson-600">
                                {n.external ? <>Read on {n.source} <ArrowUpRight size={15} aria-hidden /></> : <>Open <ArrowRight size={15} aria-hidden /></>}
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
          <p className="mt-6 text-caption text-ink-muted">
            Notifications appear inside the app. Push notifications are not available yet.
          </p>
        </Container>
      </div>
    </>
  );
}
