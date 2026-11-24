import { useState } from 'react'
import { BookOpen, Calculator, ChartPie, Compass, Route } from 'lucide-react'
import { Section, Sub } from '../kit'
import { MobileAppHeader, Avatar } from '@/components/nav/AppHeader'
import { BottomNav } from '@/components/nav/BottomNav'
import { Sidebar } from '@/components/nav/Sidebar'
import { RewardsShortcut } from '@/components/nav/RewardsShortcut'
import { IconButton } from '@/components/ui/Button'
import { SearchField } from '@/components/ui/Field'
import { WellnessOverviewCard, RewardsEntryCard, QuickAction, ContinueCard, StatCard } from '@/components/cards/HomeCards'
import { LessonCard } from '@/components/cards/LearnCards'
import { type NavKey } from '@/components/nav/navItems'
import { Bell, PiggyBank, ShieldCheck } from 'lucide-react'

export function LayoutsSection() {
  const [m, setM] = useState<NavKey>('home')
  const [d, setD] = useState<NavKey>('home')
  return (
    <Section id="layouts" index="11" eyebrow="Foundations" title="Mobile & desktop layouts" intro="Reference compositions showing how the components assemble into a Home dashboard. These are layout foundations — not final screens.">
      <div className="grid gap-10 xl:grid-cols-[400px_1fr]">
        <Sub title="Mobile · 360–430px" description="Single column, 16px margins, 16px card gap. Rewards appears as a card and in the header.">
          <div className="mx-auto w-full max-w-[390px] overflow-hidden rounded-[36px] border-[6px] border-navy-950 bg-canvas shadow-e3">
            <MobileAppHeader title="Home" />
            <div className="flex h-[70vh] max-h-[640px] min-h-[480px] flex-col gap-4 overflow-y-auto p-4">
              <WellnessOverviewCard />
              <RewardsEntryCard />
              <div>
                <p className="mb-3 text-subheading text-ink">Quick access</p>
                <div className="grid grid-cols-4 gap-2">
                  <QuickAction icon={BookOpen} label="Learn" tone="teal" />
                  <QuickAction icon={Calculator} label="Calc" />
                  <QuickAction icon={Route} label="LifeTrack" tone="teal" />
                  <QuickAction icon={ChartPie} label="Gaps" />
                </div>
              </div>
              <div>
                <p className="mb-3 text-subheading text-ink">Continue learning</p>
                <ContinueCard title="Understanding medical cards" meta="Lesson 3 of 5" progress={60} />
              </div>
            </div>
            <BottomNav active={m} onChange={setM} />
          </div>
        </Sub>

        <Sub title="Desktop · 1280px+" description="Sidebar + top bar. 12-column content area, max 1200px. Home splits into a 8/4 grid.">
          <div className="hidden overflow-hidden rounded-3xl border border-line bg-canvas shadow-e2 md:flex">
            <Sidebar active={d} onChange={setD} className="hidden lg:flex" />
            <div className="min-w-0 flex-1">
              <div className="flex h-18 items-center gap-4 border-b border-line bg-surface px-6">
                <div>
                  <p className="text-caption text-ink-muted">Tuesday, 14 May</p>
                  <p className="text-subheading text-ink">Good morning, Aisyah</p>
                </div>
                <div className="ml-auto hidden max-w-xs flex-1 2xl:block">
                  <SearchField placeholder="Search" tone="sunken" />
                </div>
                <div className="ml-auto flex items-center gap-2 2xl:ml-0">
                  <RewardsShortcut points={2450} />
                  <IconButton icon={Bell} label="Notifications" badge />
                  <Avatar />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-5 p-6">
                <div className="col-span-12 flex flex-col gap-5 lg:col-span-8">
                  <WellnessOverviewCard />
                  <div className="grid grid-cols-3 gap-4">
                    <StatCard icon={PiggyBank} tone="teal" label="Savings streak" value="12" unit="wks" />
                    <StatCard icon={BookOpen} label="Lessons" value="18" unit="/ 40" />
                    <StatCard icon={ShieldCheck} tone="crimson" label="Topics" value="4" unit="of 6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <LessonCard art="shield" tone="teal" category="Protection" title="Medical cards, explained simply" minutes={5} points={50} progress={60} />
                    <LessonCard art="growth" tone="navy" category="Saving" title="Your first emergency fund" minutes={4} points={30} />
                  </div>
                </div>
                <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
                  <RewardsEntryCard />
                  <div className="grid grid-cols-2 gap-2">
                    <QuickAction icon={Calculator} label="Calculators" />
                    <QuickAction icon={Route} label="LifeTrack" tone="teal" />
                    <QuickAction icon={ChartPie} label="Analyze" />
                    <QuickAction icon={Compass} label="Guide" tone="neutral" />
                  </div>
                  <ContinueCard title="Budgeting your first salary" meta="Lesson 1 of 4" progress={25} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-body-sm text-ink-muted md:hidden">Widen your screen to preview the desktop composition.</p>
        </Sub>
      </div>
    </Section>
  )
}
