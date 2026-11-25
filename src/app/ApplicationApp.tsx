import { useEffect, useRef, useState } from "react";
import { AppTopBar } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopNav } from "@/components/nav/TopNav";
import { type NavKey } from "@/components/nav/navItems";
import { Container } from "@/components/layout/Editorial";
import { useRewards } from "@/rewards/store";
import { useNotifications } from "@/data/notifications";
import { DashboardDestination, HomeDashboard } from "./HomeDashboard";
import { LearnDashboard } from "./LearnDashboard";
import { GuideCentre } from "./GuideCentre";
import { SimulateHub } from "./SimulateHub";
import { AnalyzeView } from "./AnalyzeView";
import { RewardsView } from "./RewardsView";
import { NotificationsView } from "./NotificationsView";
import { AboutView } from "./AboutView";
import { AppSplash } from "./AppSplash";
import { GameShell } from "./game/GameShell";
import { exitGame, GAME_HASH, gameReturnScroll, LEGACY_GAME_HASH } from "./game/gameRoute";
import { NewsArticle } from "./news/NewsArticle";
import { findStory, NEWS_HASH_PREFIX } from "@/data/news";
import { goBack } from "@/lib/nav";
import { initAccounts, useSession } from "@/account/session";
import { AccountButton, WelcomeScreen } from "./account/AccountScreens";

// Migrate pre-account data once and reopen the last active account (if any).
initAccounts();

const destinations: DashboardDestination[] = [
  "home",
  "learn",
  "simulate",
  "analyze",
  "guide",
  "rewards",
  "notifications",
  "about",
];

function readDestination(): DashboardDestination {
  const hash = window.location.hash.replace(/^#/, "");
  const key = (hash.startsWith("app/") ? hash.slice(4).split("/")[0] : "home").split(/[?#]/)[0];
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
  if (destination === "rewards") return <RewardsView route={route} />;
  if (destination === "learn") return <LearnDashboard />;
  if (destination === "simulate") return <SimulateHub />;
  if (destination === "analyze") return <AnalyzeView />;
  if (destination === "guide") return <GuideCentre />;
  if (destination === "notifications") return <NotificationsView />;
  if (destination === "about") return <AboutView />;
  return <HomeDashboard onNavigate={(next) => navigateTo(next)} />;
}

export function navigateTo(destination: DashboardDestination) {
  window.location.hash = `app/${destination}`;
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
      // Old links to the retired in-page game land in the new game shell instead.
      if (route === LEGACY_GAME_HASH) {
        window.location.replace(`#${GAME_HASH}`);
        return;
      }
      // While in the game, the app underneath keeps its current destination (and state).
      if (route !== GAME_HASH) setDestination(readDestination());
      setCurrentRoute(route);
    };
    if (routeKey() === LEGACY_GAME_HASH) window.location.replace(`#${GAME_HASH}`);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const primaryDestinations: NavKey[] = ["home", "learn", "simulate", "analyze", "guide"];
  const activePrimary: NavKey = primaryDestinations.includes(destination as NavKey)
    ? (destination as NavKey)
    : "home";
  const inGame = currentRoute === GAME_HASH || currentRoute === LEGACY_GAME_HASH;
  const wasInGame = useRef(inGame);
  useEffect(() => {
    // Returning from the game: put the player back where they were on the page.
    if (wasInGame.current && !inGame) {
      const y = gameReturnScroll();
      requestAnimationFrame(() => window.scrollTo({ top: y }));
    }
    wasInGame.current = inGame;
  }, [inGame]);
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

      {/* The game is an app-in-app: its own full-screen shell, outside the standard layout. */}
      {inGame && <GameShell onExit={exitGame} />}

      <div hidden={inGame} inert={inGame} className="min-h-screen overflow-x-hidden bg-canvas">
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
            account={<AccountButton tone="light" />}
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
            account={<AccountButton />}
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

          {/* One slim line, not a website footer. Full notice lives in About & legal. */}
          <Container className="pb-6 pt-2 md:pb-10">
            <p className="border-t border-ink/10 pt-4 text-caption text-ink-muted">
              Independent financial protection education. Not financial advice or an official
              insurer product.{" "}
              <a
                href="#app/about"
                className="font-semibold text-navy-900 underline-offset-2 hover:underline"
              >
                About &amp; legal
              </a>
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
