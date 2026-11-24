import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Avatar, MobileAppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { NavRail, Sidebar } from "@/components/nav/Sidebar";
import { RewardsShortcut } from "@/components/nav/RewardsShortcut";
import { primaryNav, type NavKey } from "@/components/nav/navItems";
import { IconButton, Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { demoUser } from "@/data/demo-user";
import { demoRewards } from "@/data/demo-rewards";
import { DashboardDestination, HomeDashboard } from "./HomeDashboard";
import { LearnDashboard } from "./LearnDashboard";
import { GuideCentre } from "./GuideCentre";
import { SimulateHub } from "./SimulateHub";
import { AnalyzeView } from "./AnalyzeView";
import { RewardsView } from "./RewardsView";
import { LIFETRACK_HASH } from "./lifetrack/LifeTrackLauncher";

function readDestination(): DashboardDestination {
  const hash = window.location.hash.replace(/^#/, "");
  const key = (hash.startsWith("app/") ? hash.slice(4).split("/")[0] : "home").split(/[?#]/)[0];
  return ["home", "learn", "simulate", "analyze", "guide", "rewards"].includes(key)
    ? (key as DashboardDestination)
    : "home";
}

const routeKey = () => window.location.hash.replace(/^#/, "") || "app/home";

function DestinationView({ destination }: { destination: DashboardDestination }) {
  if (destination === "rewards") return <RewardsView />;
  if (destination === "learn") return <LearnDashboard />;
  if (destination === "simulate") return <SimulateHub />;
  if (destination === "analyze") return <AnalyzeView />;
  if (destination === "guide") return <GuideCentre />;
  return (
    <HomeDashboard profileName="Aisyah" onNavigate={(nextDestination) => navigateTo(nextDestination)} />
  );
}

function navigateTo(destination: DashboardDestination) {
  window.location.hash = `app/${destination}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function ApplicationApp() {
  const [destination, setDestination] = useState<DashboardDestination>(readDestination);
  const [currentRoute, setCurrentRoute] = useState(routeKey);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setDestination(readDestination());
      setCurrentRoute(routeKey());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const activePrimary = destination === "rewards" ? "home" : destination;
  const inGame = currentRoute === LIFETRACK_HASH;
  const label = inGame
    ? "LifeTrack"
    : destination === "rewards"
      ? "Rewards Hub"
      : (primaryNav.find((item) => item.key === destination)?.label ?? "Home");

  const navigate = (next: NavKey) => navigateTo(next);

  return (
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

      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:flex">
        <Sidebar
          active={activePrimary}
          onChange={navigate}
          points={demoRewards.points}
          onRewardsClick={() => navigateTo("rewards")}
          onLogoClick={() => navigateTo("home")}
          onSettingsClick={() => setDemoNotice("Settings are unavailable for this sample profile.")}
        />
      </aside>
      <aside className="fixed inset-y-0 left-0 z-40 hidden md:flex lg:hidden">
        <NavRail
          active={activePrimary}
          onChange={navigate}
          onLogoClick={() => navigateTo("home")}
          onSignOutClick={() =>
            setDemoNotice("This sample profile is not signed in. Sign out is unavailable in the demo.")
          }
        />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-line bg-surface/95 backdrop-blur md:left-20 lg:hidden">
        <MobileAppHeader
          title={label}
          variant={destination === "home" ? "root" : "detail"}
          points={demoRewards.points}
          onRewardsClick={() => navigateTo("rewards")}
          onNotificationsClick={() => setDemoNotice("Notifications are not connected in this demo.")}
          onBack={() => {
            const hash = window.location.hash;
            if (hash.startsWith("#app/learn/")) navigateTo("learn");
            else if (hash.startsWith("#app/guide/article/")) navigateTo("guide");
            else if (hash.startsWith("#app/simulate/")) navigateTo("simulate");
            else navigateTo("home");
          }}
        />
      </header>

      <div className="min-h-screen md:pl-20 lg:pl-[264px]">
        <header className="sticky top-0 z-20 hidden h-[72px] items-center gap-2 border-b border-line bg-surface/90 px-8 backdrop-blur lg:flex">
          <p className="text-body-sm font-semibold text-ink-secondary">{label}</p>
          <div className="ml-auto flex items-center gap-2">
            <RewardsShortcut points={demoRewards.points} onClick={() => navigateTo("rewards")} />
            <IconButton
              icon={Bell}
              label="Notifications"
              badge
              onClick={() => setDemoNotice("Notifications are not connected in this demo.")}
            />
            <div className="ml-1 flex items-center gap-2">
              <Avatar initials={demoUser.initials} />
              <div className="hidden 2xl:block">
                <p className="text-body-sm font-semibold text-ink">{demoUser.fullName}</p>
                <p className="text-caption text-ink-muted">{demoUser.memberLabel}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.hash = "foundation";
              }}
            >
              Design system
            </Button>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="pb-28 pt-[64px] outline-none md:pb-10 md:pt-16 lg:pt-0"
        >
          <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 md:py-10 lg:px-10 lg:py-12">
            {demoNotice && (
              <div className="mb-6">
                <Alert tone="info" title={demoNotice} onDismiss={() => setDemoNotice(null)} />
              </div>
            )}
            {/* Keyed by destination (not full hash) so in-page sub-routes keep their state. */}
            <div key={destination} className="ge-enter">
              <DestinationView destination={destination} />
            </div>
            <footer
              aria-label="Educational and independence notice"
              className="mt-16 border-t border-line pt-6 text-caption leading-relaxed text-ink-muted"
            >
              <p className="max-w-3xl">
                GREAT EMPOWER is an independent financial protection education concept. It is not an
                official Great Eastern insurance product; no partnership, authorisation or endorsement
                is implied. Examples and calculations are illustrative, not financial advice, policy
                terms, insurer quotations or claim decisions. Actual coverage depends on the relevant
                policy wording and terms.
              </p>
            </footer>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <BottomNav active={activePrimary} onChange={navigate} className="shadow-e2" />
      </div>
    </div>
  );
}
