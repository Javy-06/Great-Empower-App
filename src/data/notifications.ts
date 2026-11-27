import { createStore, useStore } from "@/state/store";

export type NotificationCategory = "updates" | "learning" | "gameplay" | "rewards";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  label: string;
  title: string;
  body: string;
  /** ISO date shown to the user. */
  date: string;
  image?: string;
  /** In-app hash route, or an external source URL. */
  href: string;
  external?: boolean;
  source?: string;
}

/**
 * Notification content. News items restate verified published sources (checked 25 Nov 2026);
 * in-app items describe features that exist in this build. Nothing here is a push message.
 */
export const notifications: AppNotification[] = [
  {
    id: "mediasas-bernama-2026-11-16",
    category: "updates",
    label: "Latest update",
    title: "MediAsas: what the BNM Deputy Governor said",
    body: "How MediAsas, planned for January 2027, fits into wider reforms on medical costs — summarised for learners.",
    date: "2026-11-16",
    image: "/images/news/mediasas/mediasas-overview-2027-1080.webp",
    href: "app/home/news/mediasas-2027",
    source: "BernamaBiz",
  },
  {
    id: "mediasas-board-2026-11-04",
    category: "updates",
    label: "Policy update",
    title: "Independent MediAsas Board established",
    body: "The Joint Ministerial Committee on Private Healthcare Costs announced an independent board to oversee MediAsas ahead of its January 2027 rollout.",
    date: "2026-11-04",
    image: "/images/pexels/family-protection-conversation.webp",
    href: "https://mof.gov.my/portal/en/news/press-release/jbmkks-establishes-independent-mediasas-board-to-ensure-sound-governance-and-oversight-supporting-long-term-sustainability",
    external: true,
    source: "Ministry of Finance Malaysia",
  },
  {
    id: "learn-video-lessons",
    category: "learning",
    label: "Learning",
    title: "New video lessons and infographics",
    body: "Watch short explainers on risk pooling and a full lesson on what insurance is, plus five visual guides.",
    date: "2026-11-25",
    image: "/media/learn/videos/what-is-insurance-poster.webp",
    href: "app/learn",
  },
  {
    id: "rewards-marketplace",
    category: "rewards",
    label: "Rewards",
    title: "The Great Empower Marketplace is open",
    body: "Spend the points you earn by learning on vouchers and in-game items from six fictional brands.",
    date: "2026-11-25",
    image: "/images/lifetrack/marketplace/products/greenbowl/veggie-bowl-640.webp",
    href: "app/rewards/marketplace",
  },
  {
    id: "gameplay-lifetrack",
    category: "gameplay",
    label: "Gameplay",
    title: "Play LifeTrack",
    body: "Our insurance board game now has its own website. It opens in a new tab.",
    date: "2026-11-20",
    image: "/images/lifetrack/lifetrack-cover-960.webp",
    href: "https://lifetrack-plum.vercel.app/",
    external: true,
  },
];

export const NOTIFICATIONS_KEY = "ge-notifications-v1";
export const readStore = createStore<{ read: string[] }>(NOTIFICATIONS_KEY, () => ({ read: [] }));

export function useNotifications() {
  const { read } = useStore(readStore);
  const readSet = new Set(read);
  const unread = notifications.filter((n) => !readSet.has(n.id)).length;
  return { items: notifications, isRead: (id: string) => readSet.has(id), unread };
}

export function markNotificationRead(id: string) {
  const { read } = readStore.get();
  if (!read.includes(id)) readStore.set({ read: [...read, id] });
}

export function markAllNotificationsRead() {
  readStore.set({ read: notifications.map((n) => n.id) });
}
