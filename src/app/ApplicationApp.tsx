import { useEffect, useState } from "react";
import { MobileAppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopNav } from "@/components/nav/TopNav";
import { primaryNav, type NavKey } from "@/components/nav/navItems";
import { Alert } from "@/components/ui/Feedback";
import { Container } from "@/components/layout/Editorial";
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
  return <HomeDashboard profileName="Aisyah" onNavigate={(next) => navigateTo(next)} />;
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

      {/* Tablet & desktop: editorial top bar */}
      <header className="sticky top-0 z-30 hidden border-b border-ink/10 bg-paper/90 backdrop-blur md:block">
        <TopNav
          active={destination === "rewards" ? null : (destination as NavKey)}
          onChange={navigate}
          onHome={() => navigateTo("home")}
          onRewards={() => navigateTo("rewards")}
          points={demoRewards.points}
          rewardsActive={destination === "rewards"}
        />
      </header>

      {/* Phone: compact app bar + bottom tabs */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-line bg-surface/95 backdrop-blur md:hidden">
        <MobileAppHeader
          title={label}
          variant={destination === "home" ? "root" : "detail"}
          points={demoRewards.points}
          onRewardsClick={() => navigateTo("rewards")}
          onNotificationsClick={() =>
            setDemoNotice("Notifications are not connected in this demo.")
          }
          onBack={() => {
            const hash = window.location.hash;
            if (hash.startsWith("#app/learn/")) navigateTo("learn");
            else if (hash.startsWith("#app/guide/article/")) navigateTo("guide");
            else if (hash.startsWith("#app/simulate/")) navigateTo("simulate");
            else navigateTo("home");
          }}
        />
      </header>

      <main id="main-content" tabIndex={-1} className="pb-24 pt-16 outline-none md:pb-0 md:pt-0">
        {demoNotice && (
          <Container className="pt-6">
            <Alert tone="info" title={demoNotice} onDismiss={() => setDemoNotice(null)} />
          </Container>
        )}
        {/* Keyed by destination (not full hash) so in-page sub-routes keep their state. */}
        <div key={destination} className="ge-enter">
          <DestinationView destination={destination} />
        </div>
      </main>

      <footer
        aria-label="Educational and independence notice"
        className="bg-navy-950 pb-28 pt-12 text-white md:pb-12"
      >
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="font-brand text-serif-title text-white">GREAT EMPOWER</p>
              <p className="mt-1 text-body-sm text-white/60">
                Empowering you to protect your tomorrow.
              </p>
              <p className="mt-6 text-caption leading-relaxed text-white/60">
                GREAT EMPOWER is an independent financial protection education concept. It is not an
                official Great Eastern insurance product; no partnership, authorisation or
                endorsement is implied. Examples and calculations are illustrative, not financial
                advice, policy terms, insurer quotations or claim decisions. Actual coverage depends
                on the relevant policy wording and terms.
              </p>
            </div>
            <a
              href="#foundation"
              className="inline-flex min-h-11 items-center text-body-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
            >
              Design system
            </a>
          </div>
        </Container>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <BottomNav active={activePrimary} onChange={navigate} className="shadow-e2" />
      </div>
    </div>
  );
}
