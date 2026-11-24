import { useState } from 'react'
import { BookmarkX, CheckCircle2, Clock3, Flame, Lock, PartyPopper, RefreshCw, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react'
import { Section, Sub, Specimen, SpecList } from '../kit'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Alert, Toast, Skeleton, Spinner, EmptyState } from '@/components/ui/Feedback'
import { ProgressBar, ProgressRing, SegmentedProgress, Stepper } from '@/components/ui/Progress'
import { AchievementBadge } from '@/components/cards/RewardsCards'
import { BarChart, Donut } from '@/components/cards/AnalyzeCards'

export function StatusSection() {
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  return (
    <Section id="status" index="10" eyebrow="Components" title="Status, progress & feedback" intro="Feedback should be calm, specific and actionable. Progress uses teal by default; crimson is reserved for challenges and streaks; gold only for tiers and rewards.">
      <Sub title="Badges">
        <Specimen className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="navy">Navy</Badge>
            <Badge tone="teal">Teal</Badge>
            <Badge tone="crimson">Crimson</Badge>
            <Badge tone="gold">Gold</Badge>
            <Badge tone="success" dot>
              Completed
            </Badge>
            <Badge tone="warning" dot>
              Partial gap
            </Badge>
            <Badge tone="error" dot>
              Failed
            </Badge>
            <Badge tone="info" dot>
              Tip
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="navy" variant="solid">
              New
            </Badge>
            <Badge tone="teal" variant="solid" icon={Clock3}>
              5 min
            </Badge>
            <Badge tone="crimson" variant="solid" icon={Flame}>
              3-day streak
            </Badge>
            <Badge tone="gold" variant="solid" icon={Star}>
              +50 pts
            </Badge>
            <Badge tone="success" variant="solid" icon={CheckCircle2}>
              Passed
            </Badge>
            <Badge tone="neutral" variant="outline" icon={Lock}>
              Locked
            </Badge>
            <Badge tone="teal" variant="outline">
              Beginner
            </Badge>
            <Badge tone="navy" size="sm">
              Small
            </Badge>
          </div>
        </Specimen>
      </Sub>

      <Sub title="Progress indicators">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card padding="lg" className="flex flex-col gap-5">
            <p className="text-overline uppercase text-ink-muted">Linear</p>
            <ProgressBar value={64} label="Protection basics path" valueLabel="64%" />
            <ProgressBar value={3} max={5} tone="crimson" label="Weekly challenge" valueLabel="3 / 5" size="sm" />
            <ProgressBar value={1950} max={2500} tone="gold" label="Bronze → Silver" valueLabel="1,950 / 2,500" size="lg" />
            <ProgressBar value={40} tone="navy" label="Check-in completion" valueLabel="2 of 5" />
          </Card>
          <Card padding="lg" className="flex flex-col gap-5">
            <p className="text-overline uppercase text-ink-muted">Ring & segmented</p>
            <div className="flex items-center gap-4">
              <ProgressRing value={68} size={96} label="68" caption="score" />
              <ProgressRing value={45} size={64} stroke={6} tone="navy" />
              <ProgressRing value={90} size={48} stroke={5} tone="gold" />
            </div>
            <div>
              <p className="mb-2 text-body-sm text-ink-secondary">Quiz · question 3 of 6</p>
              <SegmentedProgress total={6} current={3} />
            </div>
          </Card>
          <Card padding="lg" className="flex flex-col gap-5">
            <p className="text-overline uppercase text-ink-muted">Stepper & achievements</p>
            <Stepper steps={['Start', 'Learn', 'Quiz', 'Done']} current={2} />
            <div className="flex justify-between">
              <AchievementBadge label="First lesson" earned icon={Sparkles} />
              <AchievementBadge label="Safety net" earned icon={ShieldCheck} />
              <AchievementBadge label="Top learner" icon={Trophy} />
            </div>
          </Card>
        </div>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Alerts">
          <div className="flex flex-col gap-3">
            <Alert tone="success" title="Lesson completed — +50 points">
              You&apos;ve finished “Medical cards, explained simply”.
            </Alert>
            <Alert tone="warning" title="120 points expire in 7 days" action={<Button size="sm" variant="secondary">View rewards</Button>}>
              Use them on any available reward before 30 June.
            </Alert>
            <Alert tone="error" title="We couldn't save your check-in">
              Check your connection and try again. Your answers are kept on this device.
            </Alert>
            {!dismissed && (
              <Alert tone="info" title="Educational content only" onDismiss={() => setDismissed(true)}>
                GREAT EMPOWER explains concepts. It does not sell or recommend specific products.
              </Alert>
            )}
          </div>
        </Sub>
        <Sub title="Toasts" description="Bottom-centre on mobile, bottom-right on desktop. Auto-dismiss after 4s unless it has an action.">
          <Specimen surface="sunken" className="flex flex-col items-center gap-3">
            <Toast message="Saved to your reading list" actionLabel="Undo" />
            <Toast tone="info" message="New lesson available in Learn" />
            <Toast tone="error" message="Redemption failed. Please try again." actionLabel="Retry" />
          </Specimen>
        </Sub>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <Sub
          title="Loading"
          aside={
            <Button size="sm" variant="ghost" leadingIcon={RefreshCw} onClick={() => setLoading((v) => !v)}>
              {loading ? 'Show loaded' : 'Show loading'}
            </Button>
          }
        >
          <Card padding="md" className="min-h-60">
            {loading ? (
              <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading lesson">
                <Skeleton className="aspect-[2/1] w-full rounded-xl" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-4/5" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex aspect-[2/1] items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <ShieldCheck size={40} strokeWidth={1.5} aria-hidden />
                </div>
                <p className="text-overline uppercase text-teal-700">Protection education</p>
                <p className="text-subheading text-ink">Medical cards, explained</p>
                <p className="text-caption text-ink-muted">5 min · +50 pts</p>
              </div>
            )}
          </Card>
          <div className="mt-3 flex items-center gap-3 text-body-sm text-ink-muted">
            <Spinner /> Spinner for actions under 1s; skeletons for content.
          </div>
        </Sub>
        <Sub title="Empty state">
          <Card padding="none" className="min-h-60">
            <EmptyState icon={BookmarkX} title="No saved lessons yet" description="Tap the bookmark on any lesson to build your own reading list." action={<Button size="sm" variant="secondary">Browse Learn</Button>} />
          </Card>
        </Sub>
        <Sub title="Success moment">
          <Card padding="none" className="min-h-60 bg-[radial-gradient(120%_80%_at_50%_0%,var(--color-teal-50),#fff_70%)]">
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-teal-600 text-white ring-8 ring-teal-100" aria-hidden>
                <PartyPopper size={28} strokeWidth={1.75} />
              </span>
              <p className="mt-5 text-subheading text-ink">Quiz passed — 5 / 6</p>
              <p className="mt-1 text-body-sm text-ink-secondary">You earned 60 points and unlocked the next lesson.</p>
              <div className="mt-4">
                <Badge tone="gold" variant="solid" icon={Star}>
                  +60 pts
                </Badge>
              </div>
            </div>
          </Card>
        </Sub>
      </div>

      <Sub title="Data visualisation" description="Charts lead with navy, compare with navy-200, and use teal for savings/positive and crimson only for the single figure that needs attention. Always label values directly and pair charts with a one-line plain-language takeaway.">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
          <Card padding="lg">
            <p className="text-overline uppercase text-ink-muted">Bar · learning minutes</p>
            <div className="mt-4">
              <BarChart
                highlight={5}
                data={[
                  { label: 'Mon', value: 12 },
                  { label: 'Tue', value: 8 },
                  { label: 'Wed', value: 15 },
                  { label: 'Thu', value: 6 },
                  { label: 'Fri', value: 10 },
                  { label: 'Sat', value: 22 },
                  { label: 'Sun', value: 9 },
                ]}
              />
            </div>
            <p className="mt-3 border-t border-line pt-3 text-body-sm text-ink-secondary">Saturday is your strongest learning day.</p>
          </Card>
          <Card padding="lg">
            <p className="mb-4 text-overline uppercase text-ink-muted">Donut · sample budget mix</p>
            <Donut
              size={132}
              centerLabel="RM 3.2k"
              centerCaption="monthly"
              segments={[
                { label: 'Needs', value: 52, color: '#0F294A' },
                { label: 'Wants', value: 26, color: '#9CB2D2' },
                { label: 'Savings', value: 14, color: '#297E85' },
                { label: 'Protection', value: 8, color: '#C8102E' },
              ]}
            />
          </Card>
          <div className="flex flex-col gap-3">
            <p className="text-overline uppercase text-ink-muted">Chart palette (in order)</p>
            {[
              ['#0F294A', 'Series 1 · navy-900'],
              ['#297E85', 'Series 2 · teal-600'],
              ['#9CB2D2', 'Series 3 · navy-300'],
              ['#7DC2C6', 'Series 4 · teal-300'],
              ['#CBD5E1', 'Baseline · slate-300'],
              ['#C8102E', 'Attention · crimson-600'],
            ].map(([c, l]) => (
              <div key={c} className="flex items-center gap-3">
                <span className="h-6 w-10 rounded-md" style={{ background: c }} />
                <span className="text-body-sm text-ink-secondary">{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <SpecList
            items={[
              ['Axes & grid', 'Caption size, muted ink. Horizontal gridlines only, 1px line colour. No 3D, no gradients.'],
              ['Numbers', 'Tabular figures, en-MY formatting, units always visible (RM, %, pts).'],
              ['Accessibility', 'Every chart has an aria-label summary; never rely on colour alone — use labels, patterns or direct annotations.'],
            ]}
          />
        </div>
      </Sub>
    </Section>
  )
}
