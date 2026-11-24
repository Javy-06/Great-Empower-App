import { useState } from 'react'
import { Bell, BookOpen, HeartPulse, PiggyBank, ShieldCheck } from 'lucide-react'
import { Section, Sub, Specimen, DoDont, SpecList } from '../kit'
import { BottomNav } from '@/components/nav/BottomNav'
import { MobileAppHeader, Avatar } from '@/components/nav/AppHeader'
import { Sidebar, NavRail } from '@/components/nav/Sidebar'
import { Tabs, Breadcrumb } from '@/components/nav/Tabs'
import { RewardsShortcut } from '@/components/nav/RewardsShortcut'
import { primaryNav, type NavKey } from '@/components/nav/navItems'
import { Chip } from '@/components/ui/Badge'
import { SearchField } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/Button'

export function NavigationSection() {
  const [tab, setTab] = useState<NavKey>('home')
  const [desk, setDesk] = useState<NavKey>('learn')
  const [rail, setRail] = useState<NavKey>('simulate')
  const [sub, setSub] = useState('lessons')
  const [chip, setChip] = useState('All')
  const current = primaryNav.find((n) => n.key === tab)!

  return (
    <Section id="navigation" index="08" eyebrow="Components" title="Navigation system" intro="Five primary destinations — Home, Learn, Simulate, Analyze, Guide. Rewards is a hub reached from Home and a persistent header shortcut, never a sixth tab. LifeTrack lives inside Simulate.">
      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <Sub title="Mobile: app bar + bottom nav" description="Tap the tabs — they are live.">
          <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[32px] border-[6px] border-navy-950 bg-canvas shadow-e3">
            <MobileAppHeader title={current.label} />
            <div className="flex h-72 flex-col items-center justify-center gap-2 px-6 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-900">
                <current.icon size={24} strokeWidth={1.75} aria-hidden />
              </span>
              <p className="text-subheading text-ink">{current.label}</p>
              <p className="text-body-sm text-ink-muted">{current.description}</p>
            </div>
            <BottomNav active={tab} onChange={setTab} />
          </div>
        </Sub>
        <div className="flex flex-col gap-8">
          <Sub title="App bar variants">
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-2xl border border-line">
                <MobileAppHeader title="Home" />
              </div>
              <div className="overflow-hidden rounded-2xl border border-line">
                <MobileAppHeader title="Medical cards, explained" variant="detail" />
              </div>
              <div className="overflow-hidden rounded-2xl">
                <MobileAppHeader title="Rewards Hub" variant="detail" onDark points={2450} />
              </div>
            </div>
          </Sub>
          <Sub title="Rewards shortcut" description="Always visible in the header, top-right. Shows live points; opens the Rewards Hub.">
            <div className="flex flex-wrap items-center gap-4">
              <RewardsShortcut points={2450} />
              <RewardsShortcut points={2450} compact />
              <div className="rounded-2xl bg-navy-900 p-2">
                <RewardsShortcut points={2450} onDark />
              </div>
            </div>
          </Sub>
          <SpecList
            items={[
              ['Bottom bar', '64px + safe area. 5 equal tabs. Active: navy pill behind icon + semibold label. Inactive: muted.'],
              ['App bar', '64px. Logo mark on tab roots; back button on pushed screens. Title is subheading.'],
              ['Order', 'Home · Learn · Simulate · Analyze · Guide — fixed across breakpoints.'],
            ]}
          />
        </div>
      </div>

      <Sub title="Desktop: sidebar + top bar" description="Sidebar is 264px with a crimson active indicator and a persistent Rewards Hub card. Tablet collapses to an 80px rail.">
        <div className="hidden overflow-hidden rounded-3xl border border-line bg-canvas shadow-e2 md:flex">
          <Sidebar active={desk} onChange={setDesk} className="hidden lg:flex" />
          <div className="lg:hidden">
            <NavRail active={desk} onChange={setDesk} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex h-18 items-center gap-4 border-b border-line bg-surface px-6">
              <div className="max-w-md flex-1">
                <SearchField placeholder="Search GREAT EMPOWER" tone="sunken" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <RewardsShortcut points={2450} />
                <IconButton icon={Bell} label="Notifications" badge />
                <Avatar />
              </div>
            </div>
            <div className="p-6">
              <Breadcrumb items={['Learn', 'Protection basics', 'Medical cards']} />
              <h4 className="mt-3 text-title text-ink">{primaryNav.find((n) => n.key === desk)!.label}</h4>
              <div className="mt-4">
                <Tabs
                  active={sub}
                  onChange={setSub}
                  tabs={[
                    { key: 'lessons', label: 'Lessons', count: 24 },
                    { key: 'paths', label: 'Paths', count: 6 },
                    { key: 'quizzes', label: 'Quizzes' },
                    { key: 'saved', label: 'Saved' },
                  ]}
                />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-2xl border border-dashed border-line-strong bg-surface" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 text-body-sm text-ink-muted md:hidden">Widen your screen to preview the desktop navigation shell.</p>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Tabs & filter chips" description="Underline tabs switch views within a destination. Chips filter content.">
          <Specimen className="flex flex-col gap-6">
            <Tabs
              active={sub}
              onChange={setSub}
              tabs={[
                { key: 'lessons', label: 'Lessons', count: 24 },
                { key: 'paths', label: 'Paths', count: 6 },
                { key: 'quizzes', label: 'Quizzes' },
              ]}
            />
            <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1">
              {[
                ['All', undefined],
                ['Saving', PiggyBank],
                ['Protection', ShieldCheck],
                ['Health', HeartPulse],
                ['Basics', BookOpen],
              ].map(([l, I]) => (
                <Chip key={l as string} selected={chip === l} onClick={() => setChip(l as string)} icon={I as typeof PiggyBank | undefined}>
                  {l as string}
                </Chip>
              ))}
            </div>
          </Specimen>
        </Sub>
        <Sub title="On navy">
          <Specimen surface="navy" className="flex flex-col gap-6">
            <Tabs
              onDark
              active={sub}
              onChange={setSub}
              tabs={[
                { key: 'lessons', label: 'Available' },
                { key: 'paths', label: 'Redeemed', count: 3 },
                { key: 'quizzes', label: 'Expired' },
              ]}
            />
            <div className="flex flex-wrap gap-2">
              {['All', 'Wellness', 'Financial', 'Protection', 'Community'].map((l) => (
                <Chip key={l} tone="dark" selected={chip === l} onClick={() => setChip(l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </Specimen>
        </Sub>
      </div>

      <Sub title="Tablet rail">
        <div className="flex h-[480px] w-fit overflow-hidden rounded-3xl border border-line bg-canvas">
          <NavRail active={rail} onChange={setRail} />
          <div className="hidden w-64 p-6 sm:block">
            <p className="text-caption text-ink-muted">80px rail · icon + short label</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DoDont kind="do">Keep Rewards reachable in one tap from any screen via the header shortcut.</DoDont>
          <DoDont kind="dont">Add Rewards or LifeTrack to the bottom bar, or exceed five primary tabs.</DoDont>
        </div>
      </Sub>
    </Section>
  )
}
