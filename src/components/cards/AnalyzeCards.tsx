import { useState } from 'react'
import { Info } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

/** Protection gap pattern: current vs. reference, with a plain-language explanation. Figures are illustrative. */
export function ProtectionGapCard({ title, current, reference, unit = 'RM', note }: { title: string; current: number; reference: number; unit?: string; note: string }) {
  const pct = Math.round((current / reference) * 100)
  const gap = reference - current
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-overline uppercase text-ink-muted">Protection gap</p>
          <h3 className="mt-0.5 text-subheading text-ink">{title}</h3>
        </div>
        <Badge tone={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'error'} dot>
          {pct >= 80 ? 'On track' : pct >= 50 ? 'Partial' : 'Large gap'}
        </Badge>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-numeric tabular-nums text-ink">
            {unit} {gap.toLocaleString('en-MY')}
          </p>
          <p className="text-caption text-ink-muted">estimated gap</p>
        </div>
        <div className="relative mt-3 h-3 rounded-full bg-sunken">
          <div className="h-full rounded-full bg-navy-900" style={{ width: `${pct}%` }} />
          <div className="absolute inset-y-[-4px] right-0 w-0.5 rounded bg-crimson-600" aria-hidden />
        </div>
        <div className="mt-2 flex justify-between text-caption tabular-nums">
          <span className="text-ink-secondary">
            <span className="mr-1 inline-block size-2 rounded-full bg-navy-900" />
            Current {unit} {current.toLocaleString('en-MY')}
          </span>
          <span className="text-ink-secondary">
            <span className="mr-1 inline-block size-2 rounded-full bg-crimson-600" />
            Reference {unit} {reference.toLocaleString('en-MY')}
          </span>
        </div>
      </div>
      <div className="flex gap-2 rounded-xl bg-info-50 p-3 text-body-sm text-ink-secondary">
        <Info size={18} className="mt-0.5 shrink-0 text-info-600" aria-hidden />
        <p>{note}</p>
      </div>
    </Card>
  )
}

export function BarChart({ data, highlight }: { data: Array<{ label: string; value: number }>; highlight?: number }) {
  const max = Math.max(...data.map((d) => d.value))
  return (
    <div className="flex h-40 items-end gap-3" role="img" aria-label={`Bar chart: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
      {data.map((d, i) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-caption font-semibold tabular-nums text-ink-secondary">{d.value}</span>
          <div className={i === highlight ? 'w-full rounded-t-lg bg-navy-900' : 'w-full rounded-t-lg bg-navy-200'} style={{ height: `${(d.value / max) * 75}%` }} />
          <span className="text-caption text-ink-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Donut({ segments, size = 140, centerLabel, centerCaption }: { segments: Array<{ label: string; value: number; color: string }>; size?: number; centerLabel: string; centerCaption: string }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = size / 2 - 12
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative" style={{ width: size, height: size }} role="img" aria-label={segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(', ')}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((s) => {
            const len = (s.value / total) * c
            const el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={18} strokeDasharray={`${Math.max(0, len - 3)} ${c}`} strokeDashoffset={-acc} />
            acc += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-numeric tabular-nums text-ink">{centerLabel}</span>
          <span className="text-caption text-ink-muted">{centerCaption}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-body-sm">
            <span className="size-3 rounded-sm" style={{ background: s.color }} aria-hidden />
            <span className="text-ink-secondary">{s.label}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums text-ink">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function InsightSummaryCard() {
  const [showDetails, setShowDetails] = useState(false)
  return (
    <Card padding="md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-overline uppercase text-ink-muted">Monthly spending mix</p>
          <h3 className="mt-0.5 text-subheading text-ink">Where your money goes</h3>
        </div>
        <Button size="sm" variant="ghost" aria-expanded={showDetails} onClick={() => setShowDetails((value) => !value)}>
          {showDetails ? 'Hide details' : 'Details'}
        </Button>
      </div>
      <div className="mt-4">
        <Donut
          centerLabel="RM 3.2k"
          centerCaption="per month"
          segments={[
            { label: 'Needs', value: 52, color: '#0F294A' },
            { label: 'Wants', value: 26, color: '#9CB2D2' },
            { label: 'Savings', value: 14, color: '#297E85' },
            { label: 'Protection', value: 8, color: '#C8102E' },
          ]}
        />
      </div>
      <p className="mt-4 border-t border-line pt-3 text-body-sm text-ink-secondary">
        Sample data. A common guideline is 50/30/20 — your savings share is <span className="font-semibold text-ink">6 points below</span> that reference.
      </p>
      {showDetails && (
        <p className="ge-reveal mt-3 rounded-xl bg-info-50 p-3 text-body-sm text-ink-secondary" role="status">
          This chart uses illustrative sample figures. The categories and percentages are not based on a user account or financial assessment.
        </p>
      )}
    </Card>
  )
}
