import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Avatar, MobileAppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { NavRail, Sidebar } from "@/components/nav/Sidebar";
import { RewardsShortcut } from "@/components/nav/RewardsShortcut";
import { primaryNav, type NavKey } from "@/components/nav/navItems";
import { IconButton, Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmergencyFundCalculator, ScenarioCard } from "@/components/cards/SimulateCards";
import { MedicalClaimSimulator } from "./MedicalClaimSimulator";
import { LifeTrackGame } from "./LifeTrackGame";
import { ProtectionGapCard, InsightSummaryCard } from "@/components/cards/AnalyzeCards";
import {
  WalletCard,
  ChallengeCard,
  VoucherCard,
  rewardCategories,
  RewardCategoryCard,
} from "@/components/cards/RewardsCards";
import { DashboardDestination, HomeDashboard } from "./HomeDashboard";
import { HeartPulse, PiggyBank } from "lucide-react";
import { Car, Hospital, Smartphone } from "lucide-react";
import { demoUser } from "@/data/demo-user";
import { demoRewards } from "@/data/demo-rewards";
import { LearnDashboard } from "./LearnDashboard";
import { GuideCentre } from "./GuideCentre";
import { Alert } from "@/components/ui/Feedback";

function readDestination(): DashboardDestination {
  const hash = window.location.hash.replace(/^#/, "");
  const key = (hash.startsWith("app/") ? hash.slice(4).split("/")[0] : "home").split(/[?#]/)[0];
  return ["home", "learn", "simulate", "analyze", "guide", "rewards"].includes(key)
    ? (key as DashboardDestination)
    : "home";
}

function RewardsView() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-overline uppercase text-crimson-700">Rewards Hub</p>
        <h1 className="mt-1 text-title text-ink md:text-display">Your demo rewards wallet</h1>
        <p className="mt-2 max-w-2xl text-body text-ink-secondary">
          Illustrative points and challenges only. Values and vouchers are not commercially
          redeemable.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <WalletCard points={demoRewards.points} />
        <div className="grid gap-3 sm:grid-cols-2">
          {rewardCategories.map((category) => (
            <RewardCategoryCard
              key={category.id}
              {...category}
              count={category.id === "financial" ? 9 : 6}
            />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ChallengeCard
          title="5-day learning streak"
          desc="Complete one lesson a day"
          progress={3}
          total={5}
          points={150}
          daysLeft={2}
        />
        <ChallengeCard
          title="Build your safety net"
          desc="Explore the emergency fund tool"
          progress={1}
          total={3}
          points={80}
          daysLeft={6}
        />
        <ChallengeCard
          title="Know your coverage"
          desc="Finish the protection path"
          progress={4}
          total={5}
          points={200}
          daysLeft={9}
        />
      </div>
      <Card padding="lg">
        <p className="text-overline uppercase text-ink-muted">Sample vouchers</p>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <VoucherCard
            category="Wellness"
            title="Fitness class pass"
            points={800}
            icon={HeartPulse}
            tile="bg-crimson-50 text-crimson-700"
          />
          <VoucherCard
            category="Community"
            title="Weekend experience"
            points={1500}
            icon={PiggyBank}
            tile="bg-gold-50 text-gold-700"
            locked
          />
        </div>
      </Card>
    </div>
  );
}

function DestinationView({ destination }: { destination: DashboardDestination }) {
  if (destination === "rewards") return <RewardsView />;
  if (destination === "learn") return <LearnDashboard />;
  if (destination === "simulate")
    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="text-overline uppercase text-teal-700">Simulate</p>
          <h1 className="mt-1 text-title text-ink md:text-display">Explore practical scenarios</h1>
          <p className="mt-2 max-w-2xl text-body text-ink-secondary">
            Use educational calculators and simulations to understand possible financial trade-offs.
          </p>
        </div>
        <nav aria-label="Simulate sections" className="flex flex-wrap gap-2">
          {[
            "Medical Claim Simulator",
            "Financial Calculators",
            "LifeTrack",
            "Life Scenarios",
            "What-if Simulators",
          ].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                const ids = [
                  "Medical Claim Simulator",
                  "Financial calculators",
                  "lifetrack",
                  "Life scenarios",
                  "What-if simulators",
                ];
                document
                  .querySelector(`[aria-label="${ids[index]}"]`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex h-12 shrink-0 items-center rounded-full border border-line bg-surface px-4 text-body-sm font-semibold text-navy-900"
            >
              {label}
            </button>
          ))}
        </nav>
        <MedicalClaimSimulator />
        <section id="lifetrack" aria-label="LifeTrack">
          <LifeTrackGame />
        </section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
          <section aria-label="Financial calculators">
            <EmergencyFundCalculator />
          </section>
          <section aria-label="What-if simulators">
            <Card padding="lg" className="h-full">
              <p className="text-overline uppercase text-navy-700">What-if simulators</p>
              <h2 className="mt-1 text-heading text-ink">Compare a few possible choices</h2>
              <p className="mt-2 text-body-sm text-ink-secondary">
                Explore the consequences of changing savings, timing and unexpected expenses.
              </p>
            </Card>
          </section>
        </div>
        <section aria-label="Life scenarios">
          <div className="mb-4">
            <p className="text-overline uppercase text-navy-700">Life scenarios</p>
            <h2 className="text-heading text-ink">Real-life moments</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <ScenarioCard
              icon={Hospital}
              title="Sudden hospital stay"
              prompt="Explore how an unexpected admission could affect savings and planning."
              impact="Health · Cash"
            />
            <ScenarioCard
              icon={Car}
              tone="navy"
              title="Your first car"
              prompt="Compare loan lengths against monthly cash flow."
              impact="Cash · Stability"
            />
            <ScenarioCard
              icon={Smartphone}
              tone="teal"
              title="Phone screen cracked"
              prompt="Compare emergency savings with an unexpected repair."
              impact="Emergency fund"
            />
          </div>
        </section>
      </div>
    );
  if (destination === "analyze")
    return (
      <div>
        <div className="mb-6">
          <p className="text-overline uppercase text-navy-700">Analyze</p>
          <h1 className="mt-1 text-title text-ink md:text-display">Protection awareness</h1>
          <p className="mt-2 text-body text-ink-secondary">
            Illustrative sample data for education, not a personal insurance assessment.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ProtectionGapCard
            title="Income protection"
            current={36000}
            reference={90000}
            note="Illustrative demo data only. Your needs depend on circumstances."
          />
          <InsightSummaryCard />
        </div>
      </div>
    );
  if (destination === "guide") return <GuideCentre />;
  return (
    <HomeDashboard
      profileName="Aisyah"
      onNavigate={(nextDestination) => navigateTo(nextDestination)}
    />
  );
}

function navigateTo(destination: DashboardDestination) {
  window.location.hash = `app/${destination}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function ApplicationApp() {
  const [destination, setDestination] = useState<DashboardDestination>(readDestination);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setDestination(readDestination());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const activePrimary = destination === "rewards" ? "home" : destination;
  const label =
    destination === "rewards"
      ? "Rewards Hub"
      : (primaryNav.find((item) => item.key === destination)?.label ?? "Home");

  const navigate = (next: NavKey) => navigateTo(next);

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas">
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
            setDemoNotice(
              "This sample profile is not signed in. Sign out is unavailable in the demo.",
            )
          }
        />
      </aside>

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-line bg-surface/95 backdrop-blur md:left-20 lg:hidden">
        <MobileAppHeader
          title={label}
          variant={destination === "home" ? "root" : "detail"}
          points={demoRewards.points}
          onRewardsClick={() => navigateTo("rewards")}
          onNotificationsClick={() =>
            setDemoNotice("Notifications are not connected in this demo.")
          }
          onBack={() => {
            if (window.location.hash.startsWith("#app/learn/")) navigateTo("learn");
            else if (window.location.hash.startsWith("#app/guide/article/")) navigateTo("guide");
            else navigateTo("home");
          }}
        />
      </header>

      <div className="min-h-screen md:pl-20 lg:pl-[264px]">
        <header className="sticky top-0 z-20 hidden h-[72px] items-center gap-4 border-b border-line bg-surface px-6 lg:flex">
          <div className="hidden xl:block">
            <Logo size="sm" />
          </div>
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
              Foundation
            </Button>
          </div>
        </header>

        <main className="pb-24 pt-[64px] md:pb-8 md:pt-0 lg:pt-0">
          <div className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6 md:py-8 lg:px-8">
            {demoNotice && (
              <div className="mb-5">
                <Alert tone="info" title={demoNotice} onDismiss={() => setDemoNotice(null)} />
              </div>
            )}
            <DestinationView destination={destination} />
            <footer
              aria-label="Educational and independence notice"
              className="mt-10 border-t border-line pt-5 text-caption leading-relaxed text-ink-secondary"
            >
              <p className="max-w-4xl">
                GREAT EMPOWER is an independent financial protection education concept. It is not an
                official Great Eastern insurance product; no partnership, authorisation or
                endorsement is implied. Examples and calculations are illustrative, not financial
                advice, policy terms, insurer quotations or claim decisions. Actual coverage depends
                on the relevant policy wording and terms.
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
