import { useState } from 'react'
import { ArrowRight, Banknote, CircleCheck, Dice5, Flag, HeartPulse, LifeBuoy, RotateCcw, ShieldCheck, Sparkles, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import {
  applyLifeTrackEffect,
  initialLifeTrackResources,
  lifeTrackSpaces,
  moveLifeTrackPlayer,
  rollLifeTrackDie,
  type LifeTrackChoice,
  type LifeTrackEffect,
  type LifeTrackEvent,
  type LifeTrackResourceId,
  type LifeTrackResources,
} from '@/game/lifetrack'

const resources: Array<{ id: LifeTrackResourceId; label: string; icon: typeof Banknote; colour: string }> = [
  { id: 'cash', label: 'Cash', icon: Banknote, colour: 'bg-navy-900' },
  { id: 'health', label: 'Health', icon: HeartPulse, colour: 'bg-crimson-600' },
  { id: 'emergencyFund', label: 'Emergency Fund', icon: LifeBuoy, colour: 'bg-teal-600' },
  { id: 'protection', label: 'Protection', icon: ShieldCheck, colour: 'bg-navy-500' },
  { id: 'stability', label: 'Financial Stability', icon: Scale, colour: 'bg-gold-500' },
]

const initialState = () => ({
  view: 'lobby' as 'lobby' | 'playing' | 'result',
  position: 0,
  turn: 0,
  dice: null as number | null,
  currentEvent: null as LifeTrackEvent | null,
  chosen: null as LifeTrackChoice | null,
  resources: { ...initialLifeTrackResources },
  history: [] as Array<{ event: string; choice: string }>,
})

function ResourcePanel({ values, compact = false }: { values: LifeTrackResources; compact?: boolean }) {
  return (
    <div className={cn('grid gap-3', compact ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-1')}>
      {resources.map(({ id, label, icon: Icon, colour }) => (
        <div key={id} className="rounded-xl border border-line bg-surface p-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-800"><Icon size={16} aria-hidden /></span>
            <span className="min-w-0 flex-1 text-caption font-medium text-ink-secondary">{label}</span>
            <span className="text-body-sm font-semibold tabular-nums text-ink">{values[id]}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="meter" aria-label={label} aria-valuenow={values[id]} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn('h-full rounded-full transition-[width]', colour)} style={{ width: `${values[id]}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function effectLabel(effect: LifeTrackEffect): string[] {
  return resources.flatMap(({ id, label }) => {
    const amount = effect[id]
    return amount ? [`${label} ${amount > 0 ? '+' : ''}${amount}`] : []
  })
}

function JourneyResult({ state, onRestart }: { state: ReturnType<typeof initialState>; onRestart: () => void }) {
  const average = Math.round(Object.values(state.resources).reduce((total, value) => total + value, 0) / resources.length)
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge tone="teal" variant="solid" icon={Flag}>Journey complete</Badge>
          <h2 className="mt-3 text-title text-ink md:text-display">Your twenties, one decision at a time.</h2>
          <p className="mt-2 max-w-2xl text-body text-ink-secondary">You reached the end of this illustrative journey. There is no insurance-based win condition; your choices shaped five separate resources.</p>
        </div>
        <Button variant="support" leadingIcon={RotateCcw} onClick={onRestart}>Play again</Button>
      </div>
      <Card padding="lg" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-overline uppercase text-ink-muted">Journey reflection</p><h2 className="mt-1 text-heading text-ink">Balanced resources, not a pass or fail</h2></div>
          <Badge tone={average >= 60 ? 'teal' : 'neutral'}>{average} average · illustrative</Badge>
        </div>
        <ResourcePanel values={state.resources} compact />
        <p className="text-body-sm text-ink-secondary">Resource levels are game indicators, not money amounts, medical advice, a personal assessment or a promise of insurance benefits.</p>
      </Card>
      <Card padding="lg">
        <h2 className="text-subheading text-ink">Your decisions</h2>
        {state.history.length ? (
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {state.history.map((entry, index) => <li key={`${entry.event}-${index}`} className="rounded-xl bg-sunken p-3"><span className="text-caption font-semibold text-ink-muted">Space {index + 1}</span><p className="text-body-sm font-semibold text-ink">{entry.event}</p><p className="text-caption text-ink-secondary">{entry.choice}</p></li>)}
          </ol>
        ) : <p className="mt-2 text-body-sm text-ink-secondary">No decisions recorded.</p>}
      </Card>
      <Button variant="secondary" leadingIcon={RotateCcw} onClick={onRestart}>Restart journey</Button>
    </div>
  )
}

export function LifeTrackGame() {
  const [state, setState] = useState(initialState)

  const startJourney = () => setState({ ...initialState(), view: 'playing' })
  const rollDice = () => {
    const dice = rollLifeTrackDie()
    const position = moveLifeTrackPlayer(state.position, dice)
    setState((current) => ({ ...current, position, dice, turn: current.turn + 1, currentEvent: lifeTrackSpaces[position].event ?? null, chosen: null }))
  }
  const choose = (choice: LifeTrackChoice) => {
    if (!state.currentEvent || state.chosen) return
    setState((current) => ({
      ...current,
      resources: applyLifeTrackEffect(current.resources, choice.effect),
      chosen: choice,
      history: [...current.history, { event: current.currentEvent!.title, choice: choice.label }],
    }))
  }
  const continueJourney = () => {
    if (state.position === lifeTrackSpaces.length - 1) setState((current) => ({ ...current, view: 'result', currentEvent: null }))
    else setState((current) => ({ ...current, currentEvent: null, chosen: null, dice: null }))
  }

  if (state.view === 'result') return <JourneyResult state={state} onRestart={startJourney} />

  if (state.view === 'lobby') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-overline uppercase text-teal-700">LifeTrack · Solo demo</p>
          <h2 className="mt-1 text-title text-ink md:text-display">Play your twenties, one decision at a time.</h2>
          <p className="mt-2 max-w-3xl text-body text-ink-secondary">A financial life simulation for Malaysian young adults. Move through 20 spaces covering work, health, family, housing and long-term plans.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card variant="navy" padding="lg" className="flex flex-col gap-5 self-start">
            <div className="flex items-center gap-3"><span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-teal-200"><Dice5 size={26} /></span><div><Badge tone="teal" variant="solid">Sample journey</Badge><h3 className="mt-1 text-subheading text-white">Aisyah Hassan · demo player</h3></div></div>
            <p className="text-body-sm text-white/80">Roll, land on a life event, make a choice and see how it changes your resources. Your decisions stay in this browser session.</p>
            <Button variant="inverse" leadingIcon={ArrowRight} onClick={startJourney}>Start journey</Button>
          </Card>
          <Card padding="lg" className="flex flex-col gap-4">
            <div><p className="text-overline uppercase text-ink-muted">The five resources</p><h3 className="mt-1 text-subheading text-ink">A broader view of resilience</h3></div>
            <ResourcePanel values={state.resources} />
          </Card>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card padding="md"><h3 className="text-body-sm font-semibold text-ink">No purchase decisions</h3><p className="mt-1 text-caption text-ink-secondary">There are no insurance purchase prompts or points for buying cover.</p></Card>
          <Card padding="md"><h3 className="text-body-sm font-semibold text-ink">Cover has limits</h3><p className="mt-1 text-caption text-ink-secondary">Medical costs, income support and critical illness benefits are different things with different terms.</p></Card>
          <Card padding="md"><h3 className="text-body-sm font-semibold text-ink">A sample experience</h3><p className="mt-1 text-caption text-ink-secondary">Resource levels are illustrative game values, not personal financial or health information.</p></Card>
        </div>
      </div>
    )
  }

  const currentSpace = lifeTrackSpaces[state.position]
  const canRoll = !state.currentEvent

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-overline uppercase text-teal-700">LifeTrack · Solo demo · Aisyah Hassan</p><h2 className="mt-1 text-title text-ink md:text-display">Play your twenties, one decision at a time.</h2><p className="mt-1 text-body-sm text-ink-secondary">Turn {state.turn} · Space {state.position + 1} of {lifeTrackSpaces.length} · {currentSpace.label}</p></div>
        <Button variant="ghost" leadingIcon={RotateCcw} onClick={startJourney}>Restart</Button>
      </div>

      <Card padding="md" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-subheading text-ink">Your resources</h3><p className="text-caption text-ink-muted">Illustrative game levels · 0–100</p></div><Badge tone="neutral">No purchase-based scoring</Badge></div>
        <ResourcePanel values={state.resources} compact />
      </Card>

      <Card padding="md" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-overline uppercase text-ink-muted">20-space life journey</p><h3 className="text-subheading text-ink">The board</h3></div><div className="flex items-center gap-2"><Badge tone="teal" variant="solid" icon={CircleCheck}>You are on space {state.position + 1}</Badge>{state.dice !== null && <Badge tone="neutral" icon={Dice5}>Last roll: {state.dice}</Badge>}</div></div>
        <ol aria-label="LifeTrack 20-space board" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {lifeTrackSpaces.map((space) => {
            const isCurrent = space.index === state.position
            const isPast = space.index < state.position
            return (
              <li key={space.index} aria-current={isCurrent ? 'step' : undefined} className={cn('relative flex min-h-20 flex-col justify-between rounded-xl border p-2.5', isCurrent ? 'border-crimson-500 bg-crimson-50 ring-2 ring-crimson-200' : isPast ? 'border-teal-200 bg-teal-50/70' : 'border-line bg-surface')}>
                <div className="flex items-center justify-between"><span className="text-caption font-semibold tabular-nums text-ink-muted">{String(space.index + 1).padStart(2, '0')}</span>{isCurrent && <span className="rounded-full bg-crimson-600 px-2 py-0.5 text-[10px] font-semibold text-white">YOU</span>}{isPast && !isCurrent && <CircleCheck size={15} className="text-teal-700" aria-label="Visited" />}</div>
                <span className="mt-2 text-caption font-semibold leading-tight text-ink">{space.label}</span>
              </li>
            )
          })}
        </ol>
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sunken p-3">
          {canRoll ? (
            <>
              <Button variant="support" leadingIcon={Dice5} onClick={rollDice}>Roll dice</Button>
              <p className="text-caption text-ink-secondary">A roll moves your token forward and reveals the next event.</p>
            </>
          ) : state.chosen ? (
            <Button variant="support" leadingIcon={state.position === lifeTrackSpaces.length - 1 ? Flag : ArrowRight} onClick={continueJourney}>{state.position === lifeTrackSpaces.length - 1 ? 'View journey results' : 'Next turn'}</Button>
          ) : <p className="text-caption font-medium text-ink-secondary">Choose a response to continue your turn.</p>}
        </div>
      </Card>

      {state.currentEvent && (
        <EventPanel event={state.currentEvent} chosen={state.chosen} onChoose={choose} />
      )}
      <p className="text-caption text-ink-muted">Education demo only. Resource values are not RM, a health assessment, a coverage guarantee or financial advice. Great EMPOWER is an independent concept; no Great Eastern partnership or endorsement is implied.</p>
    </div>
  )
}

function EventPanel({ event, chosen, onChoose }: { event: LifeTrackEvent; chosen: LifeTrackChoice | null; onChoose: (choice: LifeTrackChoice) => void }) {
  return (
    <Card padding="none" className="overflow-hidden border-teal-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4"><div><p className="text-overline uppercase text-crimson-700">Space event · {event.category}</p><h3 className="mt-1 text-heading text-ink">{event.title}</h3></div><Badge tone="teal" variant="solid" icon={Sparkles}>Decision moment</Badge></div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr] lg:p-5">
        <div className="flex flex-col gap-4">
          <section><h4 className="text-body-sm font-semibold text-ink">Scenario</h4><p className="mt-1 text-body-sm text-ink-secondary">{event.scenario}</p></section>
          <section><h4 className="text-body-sm font-semibold text-ink">Decision</h4><div className="mt-2 flex flex-col gap-2">{event.choices.map((choice) => <button key={choice.id} type="button" disabled={!!chosen} onClick={() => onChoose(choice)} className={cn('rounded-xl border p-3 text-left transition-colors', chosen?.id === choice.id ? 'border-teal-500 bg-teal-50' : 'border-line bg-surface hover:border-navy-300 hover:bg-navy-50', chosen && chosen.id !== choice.id && 'opacity-60')}><span className="text-body-sm font-semibold text-ink">{choice.label}</span><span className="mt-1 block text-caption text-ink-secondary">{choice.consequence}</span></button>)}</div></section>
        </div>
        <div className="flex flex-col gap-3">
          {chosen ? (
            <>
              <section className="rounded-xl bg-teal-50 p-3"><h4 className="text-body-sm font-semibold text-teal-900">Financial consequence</h4><p className="mt-1 text-body-sm text-teal-900">{chosen.consequence}</p><div className="mt-2 flex flex-wrap gap-1.5">{effectLabel(chosen.effect).map((effect) => <Badge key={effect} tone="teal">{effect}</Badge>)}</div></section>
              <section className="rounded-xl bg-navy-50 p-3"><h4 className="text-body-sm font-semibold text-navy-900">Protection explanation</h4><p className="mt-1 text-body-sm text-navy-800">{event.protectionExplanation}</p></section>
              <section className="rounded-xl border border-line p-3"><h4 className="text-body-sm font-semibold text-ink">Reflection</h4><p className="mt-1 text-body-sm text-ink-secondary">{event.reflection}</p></section>
            </>
          ) : (
            <div className="flex min-h-32 flex-col justify-center rounded-xl bg-navy-50 p-4"><p className="text-overline uppercase text-navy-700">Before you decide</p><p className="mt-1 text-body-sm text-navy-900">Consider the short-term consequence and the resource you may need later.</p></div>
          )}
        </div>
      </div>
    </Card>
  )
}
