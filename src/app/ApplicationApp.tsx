import { lazy, Suspense, useEffect, useState } from "react";
import { AppTopBar } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopNav } from "@/components/nav/TopNav";
import { type NavKey } from "@/components/nav/navItems";
import { Container } from "@/components/layout/Editorial";
import { useRewards } from "@/rewards/store";
import { useNotifications } from "@/data/notifications";
import { DashboardDestination, HomeDashboard } from "./HomeDashboard";
import { AppSplash } from "./AppSplash";
// Route-level code splitting: Home ships in the main bundle; other destinations load on first visit.
const LearnDashboard = lazy(() => import("./LearnDashboard").then((m) => ({ default: m.LearnDashboard })));
const GuideCentre = lazy(() => import("./GuideCentre").then((m) => ({ default: m.GuideCentre })));
const SimulateHub = lazy(() => import("./SimulateHub").then((m) => ({ default: m.SimulateHub })));
const AnalyzeView = lazy(() => import("./AnalyzeView").then((m) => ({ default: m.AnalyzeView })));
const RewardsView = lazy(() => import("./RewardsView").then((m) => ({ default: m.RewardsView })));
const NotificationsView = lazy(() => import("./NotificationsView").then((m) => ({ default: m.NotificationsView })));

/** Shown while a destination's code loads: reserves the hero area so the layout doesn't jump. */
function RouteLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className="min-h-[70vh]">
      <span className="sr-only">Loading…</span>
      <div className="ge-skeleton h-[17rem] w-full" />
    </div>
  );
}
import { RETIRED_GAME_HASHES } from "./game/lifetrack";
import { NewsArticle } from "./news/NewsArticle";
import { findStory, NEWS_HASH_PREFIX } from "@/data/news";
import { goBack } from "@/lib/nav";
import { initAccounts, useSession } from "@/account/session";
import { AccountButton, WelcomeScreen } from "./account/AccountScreens";
import { readDemoMode, isDemoRuntime } from "@/demo/demoSession";
import { DemoAccountButton } from "@/demo/DemoAccountButton";

// Migrate pre-account data once and reopen the last active account (if any). Never in the Demo
// System: it runs in its own isolated namespace (src/demo/demoSession.ts) and must not open,
// sync or change any real account on this device.
if (!readDemoMode()) initAccounts();

const destinations: DashboardDestination[] = [
  "home",
  "learn",
  "simulate",
  "analyze",
  "guide",
  "rewards",
  "notifications",
];

function readDestination(): DashboardDestination {
  const hash = window.location.hash.replace(/^#/, "");
  const raw = (hash.startsWith("app/") ? hash.slice(4).split("/")[0] : "home").split(/[?#]/)[0];
  // GREAT EMPOWER 2.0: the Analyze destination is now "Protect" (#app/protect). #app/analyze still works.
  const key = raw === "protect" ? "analyze" : raw;
  return destinations.includes(key as DashboardDestination)
    ? (key as DashboardDestination)
    : "home";
}

const routeKey = () => window.location.hash.replace(/^#/, "") || "app/home";

/** A Home sub-route: `#app/home/news/<story-id>`. */
const readStory = (route: string) =>
  route.startsWith(NEWS_HASH_PREFIX) ? findStory(route.slice(NEWS_HASH_PREFIX.length)) : undefined;

function DestinationView({
  destination,
  route,
}: {
  destination: DashboardDestination;
  route: string;
}) {
  const story = destination === "home" ? readStory(route) : undefined;
  if (story) return <NewsArticle story={story} onBack={() => goBack("app/home")} />;
  const view =
    destination === "rewards" ? <RewardsView route={route} />
    : destination === "learn" ? <LearnDashboard />
    : destination === "simulate" ? <SimulateHub />
    : destination === "analyze" ? <AnalyzeView />
    : destination === "guide" ? <GuideCentre />
    : destination === "notifications" ? <NotificationsView />
    : null;
  if (!view) return <HomeDashboard />;
  return <Suspense fallback={<RouteLoading />}>{view}</Suspense>;
}

export function navigateTo(destination: DashboardDestination) {
  window.location.hash = `app/${destination === "analyze" ? "protect" : destination}`;
  window.scrollTo({ top: 0 });
}

export function ApplicationApp() {
  const [destination, setDestination] = useState<DashboardDestination>(readDestination);
  const [currentRoute, setCurrentRoute] = useState(routeKey);
  const { points } = useRewards();
  const { unread } = useNotifications();
  const session = useSession();

  useEffect(() => {
    const onHashChange = () => {
      const route = routeKey();
      // LifeTrack is now its own website (opened from Home). Old in-app game links land on Home.
      if (RETIRED_GAME_HASHES.includes(route)) {
        window.location.replace("#app/home");
        return;
      }
      setDestination(readDestination());
      setCurrentRoute(route);
    };
    if (RETIRED_GAME_HASHES.includes(routeKey())) window.location.replace("#app/home");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const primaryDestinations: NavKey[] = ["home", "learn", "simulate", "analyze", "guide"];
  // Pages outside the five destinations (Rewards, Wallet, Notifications…) highlight no tab.
  const activePrimary: NavKey | null = primaryDestinations.includes(destination as NavKey) ? (destination as NavKey) : null;
  const newsStory = destination === "home" ? readStory(currentRoute) : undefined;
  const navigate = (next: NavKey) => navigateTo(next);

  // No active demo account: show the account entry screen (Demo / Create New / reopen).
  if (session.kind !== "ready")
    return (
      <>
        <AppSplash />
        <WelcomeScreen />
      </>
    );

  return (
    <>
      <AppSplash />

      <div className="min-h-screen overflow-x-hidden bg-canvas">
        <a
          href="#main-content"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
          className="fixed left-3 top-3 z-[60] -translate-y-24 rounded-xl bg-navy-900 px-4 py-3 text-body-sm font-semibold text-white shadow-e3 transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>

        {/* Tablet & desktop top bar */}
        <header className="sticky top-0 z-30 hidden border-b border-ink/10 bg-paper/90 backdrop-blur md:block">
          <TopNav
            active={primaryDestinations.includes(destination as NavKey) ? (destination as NavKey) : null}
            onChange={navigate}
            onHome={() => navigateTo("home")}
            onRewards={() => navigateTo("rewards")}
            onNotifications={() => navigateTo("notifications")}
            unread={unread}
            points={points}
            rewardsActive={destination === "rewards"}
            account={isDemoRuntime() ? <DemoAccountButton tone="light" /> : <AccountButton tone="light" />}
          />
        </header>

        {/* Phone: one compact navy app bar on every screen */}
        <header className="fixed left-0 right-0 top-0 z-30 bg-navy-950 pt-[env(safe-area-inset-top)] md:hidden">
          <AppTopBar
            points={points}
            unread={unread}
            onHome={() => navigateTo("home")}
            onRewardsClick={() => navigateTo("rewards")}
            onNotificationsClick={() => navigateTo("notifications")}
            account={isDemoRuntime() ? <DemoAccountButton /> : <AccountButton />}
          />
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] outline-none md:pb-0 md:pt-0"
        >
          {/* Keyed by destination (not full hash) so in-page sub-routes keep their state. */}
          <div key={newsStory ? `news-${newsStory.id}` : destination} className="ge-enter">
            <DestinationView destination={destination} route={currentRoute} />
          </div>

          {/* One slim line, not a website footer: the essential independence and not-advice notice. */}
          <Container className="pb-6 pt-2 md:pb-10">
            <p className="border-t border-ink/10 pt-4 text-caption text-ink-muted">
              Independent financial protection education for young Malaysians. Not financial advice,
              and not an official product of, or endorsed by, any insurer. Examples are illustrative.
            </p>
          </Container>
        </main>

        {/* Floating glass nav: 12px from the screen edge, or above the home indicator. */}
        <div className="fixed inset-x-3 bottom-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.375rem))] z-40 md:hidden">
          <BottomNav active={activePrimary} onChange={navigate} />
        </div>
      </div>
    </>
  );
}
