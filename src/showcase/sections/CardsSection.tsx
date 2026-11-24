import { BookOpen, Car, HeartPulse, Hospital, Landmark, LifeBuoy, PiggyBank, Plane, ShieldCheck, Smartphone, Umbrella, Wallet } from 'lucide-react'
import { Section, Sub, Specimen, DoDont } from '../kit'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard, WellnessOverviewCard, RewardsEntryCard, ContinueCard } from '@/components/cards/HomeCards'
import { LessonCard } from '@/components/cards/LearnCards'
import { ScenarioCard, LifeTrackEntryCard } from '@/components/cards/SimulateCards'
import { ProtectionGapCard } from '@/components/cards/AnalyzeCards'
import { ArticleRow } from '@/components/cards/GuideCards'
import { VoucherCard, ChallengeCard, WalletCard } from '@/components/cards/RewardsCards'

export function CardsSection() {
  return (
    <Section id="cards" index="06" eyebrow="Components" title="Card library" intro="Cards are the primary unit of the interface. A shared anatomy — border, 16px radius, consistent padding — lets each module express personality inside the card without breaking the system.">
      <Sub title="Base surfaces">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ['default', 'Default', 'White surface, 1px border. The workhorse.'],
              ['elevated', 'Elevated', 'Adds e1 shadow for raised groups.'],
              ['muted', 'Muted', 'Sunken fill for nested content.'],
              ['navy', 'Navy', 'Hero & highlight moments only.'],
              ['outline-dashed', 'Placeholder', 'Empty slots and “add” targets.'],
            ] as const
          ).map(([v, n, d]) => (
            <Card key={v} variant={v} className="min-h-36">
              <p className={v === 'navy' ? 'text-overline uppercase text-white/60' : 'text-overline uppercase text-ink-muted'}>{v}</p>
              <p className={v === 'navy' ? 'mt-2 text-subheading text-white' : 'mt-2 text-subheading text-ink'}>{n}</p>
              <p className={v === 'navy' ? 'mt-1 text-body-sm text-white/70' : 'mt-1 text-body-sm text-ink-secondary'}>{d}</p>
            </Card>
          ))}
        </div>
      </Sub>

      <Sub title="Anatomy">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Card padding="lg" className="outline-2 outline-dashed outline-offset-4 outline-teal-300">
            <CardHeader eyebrow="Eyebrow · overline" title="Card title · subheading" action={<Button size="sm" variant="ghost">Action</Button>} />
            <p className="mt-2 text-body-sm text-ink-secondary">Supporting text in body-sm, secondary ink. Keep to two or three lines.</p>
            <div className="mt-4 rounded-xl bg-sunken p-4 text-caption text-ink-muted">Content slot — chart, list, media or form</div>
            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-4">
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Button size="sm">Primary</Button>
            </div>
          </Card>
          <ol className="flex flex-col gap-3 text-body-sm text-ink-secondary">
            {[
              ['Container', 'surface · 1px line · rounded-2xl · p-5 (p-4 mobile)'],
              ['Header', 'Optional overline eyebrow, subheading title, one trailing action'],
              ['Body', 'Supporting text max 3 lines; one primary content slot'],
              ['Footer', 'Optional, separated by a 1px divider; actions right-aligned'],
              ['Interaction', 'Whole-card tap targets get hover e2 + border-strong; never nest buttons inside clickable cards without stopPropagation'],
            ].map(([k, v], i) => (
              <li key={k} className="flex gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-caption font-semibold text-white">{i + 1}</span>
                <span>
                  <span className="font-semibold text-ink">{k}.</span> {v}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Sub>

      <Sub title="Home — dashboard cards">
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <WellnessOverviewCard />
          <div className="flex flex-col gap-4">
            <RewardsEntryCard />
            <ContinueCard title="Understanding medical cards" meta="Lesson 3 of 5 · Protection basics" progress={60} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={PiggyBank} tone="teal" label="Savings streak" value="12" unit="weeks" delta="+2" />
          <StatCard icon={BookOpen} tone="navy" label="Lessons completed" value="18" unit="/ 40" delta="+3" />
          <StatCard icon={ShieldCheck} tone="crimson" label="Protection topics" value="4" unit="of 6" caption="2 to explore" />
          <StatCard icon={Wallet} tone="gold" label="Points this month" value="640" unit="pts" delta="-80" deltaDirection="down" />
        </div>
      </Sub>

      <Sub title="Learn — editorial lesson cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LessonCard photo category="Financial wellness" title="Money talks with friends: splitting costs fairly" minutes={6} points={40} level="Popular" />
          <LessonCard art="shield" tone="teal" category="Protection education" title="Medical cards, explained simply" minutes={5} points={50} progress={60} />
          <LessonCard art="growth" tone="navy" category="Saving & growth" title="Your first emergency fund" minutes={4} points={30} progress={100} />
          <LessonCard art="umbrella" tone="crimson" category="Real-life risk" title="What if you can't work for 3 months?" minutes={7} points={60} level="Intermediate" />
        </div>
      </Sub>

      <Sub title="Simulate — scenarios & LifeTrack entry">
        <div className="grid gap-4 sm:grid-cols-3">
          <ScenarioCard icon={Hospital} title="Sudden hospital stay" prompt="A 4-day admission for dengue. How do your savings and coverage hold up?" impact="Health · Cash" />
          <ScenarioCard icon={Car} tone="navy" title="Your first car" prompt="Compare a 5-year and 9-year loan on a RM 60k car against your monthly budget." impact="Cash · Stability" />
          <ScenarioCard icon={Smartphone} tone="teal" title="Phone screen cracked" prompt="An unexpected RM 900 repair. Emergency fund or BNPL — what changes?" impact="Emergency fund" />
        </div>
        <div className="mt-4">
          <LifeTrackEntryCard />
        </div>
      </Sub>

      <Sub title="Analyze & Guide">
        <div className="grid gap-4 lg:grid-cols-2">
          <ProtectionGapCard title="Income protection" current={36000} reference={90000} note="Illustrative only. A common reference is several years of income; your needs depend on dependants, debts and goals." />
          <Card padding="sm">
            <p className="px-3 pt-2 text-overline uppercase text-ink-muted">Guide · Recommended reading</p>
            <div className="mt-1 flex flex-col">
              <ArticleRow icon={Umbrella} category="Protection" title="Term vs. whole life — the concepts, not the products" minutes={6} />
              <ArticleRow icon={HeartPulse} category="Health" title="How deductibles and co-payment work" minutes={4} />
              <ArticleRow icon={Landmark} category="Money basics" title="Reading your first EPF statement" minutes={5} />
            </div>
          </Card>
        </div>
      </Sub>

      <Sub title="Rewards — wallet, vouchers & challenges" description="Voucher values and partners are placeholders. Never display a confirmed value or brand until a partnership exists.">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <WalletCard />
          <div className="flex flex-col gap-3">
            <VoucherCard category="Wellness" title="Fitness class pass" points={800} icon={HeartPulse} tile="bg-crimson-50 text-crimson-700" />
            <VoucherCard category="Community & Lifestyle" title="Weekend experience voucher" points={1500} icon={Plane} tile="bg-gold-50 text-gold-700" locked />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ChallengeCard title="5-day learning streak" desc="Complete one lesson a day" progress={3} total={5} points={150} daysLeft={2} />
          <ChallengeCard title="Build your safety net" desc="Use the emergency fund calculator 3 times" progress={1} total={3} points={80} daysLeft={6} />
          <ChallengeCard title="Know your coverage" desc="Finish the Protection basics path" progress={4} total={5} points={200} daysLeft={9} />
        </div>
      </Sub>

      <Sub title="Cards in a navy context" description="When cards sit on a navy hero, they stay white — never tint the card itself.">
        <Specimen surface="navy">
          <p className="text-overline uppercase text-white/60">Simulate · featured</p>
          <p className="mt-1 text-heading text-white">Pick a scenario to explore</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <ScenarioCard icon={LifeBuoy} tone="teal" title="Retrenchment notice" prompt="Two months of income disappear. Which resources protect you?" impact="Emergency fund" />
            <ScenarioCard icon={Plane} tone="navy" title="Study abroad year" prompt="Balance tuition, living costs and protection while overseas." impact="Cash · Health" />
            <ScenarioCard icon={HeartPulse} title="Parent falls ill" prompt="You become a part-time carer. What changes for your plans?" impact="Stability" />
          </div>
        </Specimen>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DoDont kind="do">Keep one visual hook per card — a figure, an illustration, or a photo. Not all three.</DoDont>
          <DoDont kind="dont">Stack shadows, gradients and coloured borders on the same card.</DoDont>
        </div>
      </Sub>
    </Section>
  )
}
