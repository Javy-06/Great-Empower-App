import { Section, Sub, SpecList, Code } from '../kit'
import { spacingScale, radii, elevations, breakpoints } from '@/design-system/tokens'
import { cn } from '@/lib/cn'

function GridDiagram({ cols, margin, gutter, label, width }: { cols: number; margin: number; gutter: number; label: string; width: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={cn('mx-auto w-full rounded-2xl border border-line bg-surface', width)}>
        <div className="flex h-36 rounded-2xl" style={{ padding: `12px ${margin / 2}px`, gap: gutter / 2 }}>
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="flex-1 rounded-md bg-crimson-500/10 ring-1 ring-inset ring-crimson-500/20" />
          ))}
        </div>
      </div>
      <p className="text-center text-caption text-ink-muted">
        <span className="font-semibold text-ink">{label}</span> · {cols} cols · {margin}px margin · {gutter}px gutter
      </p>
    </div>
  )
}

export function SpacingSection() {
  return (
    <Section id="spacing" index="04" eyebrow="Spacing & layout" title="A 4-point rhythm" intro="All spacing is a multiple of 4px, mapped 1:1 to Tailwind's spacing scale. Radius and elevation are deliberately limited so cards feel consistent across every module.">
      <Sub title="Spacing scale">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          {spacingScale.map((s) => (
            <div key={s.token} className="grid grid-cols-[56px_56px_1fr] items-center gap-3 border-b border-line px-5 py-2.5 last:border-b-0 md:grid-cols-[72px_72px_200px_1fr]">
              <span className="font-mono text-body-sm font-semibold text-navy-900">{s.token}</span>
              <span className="text-caption tabular-nums text-ink-muted">{s.px}px</span>
              <span className="h-4 rounded bg-teal-600/80" style={{ width: s.px }} />
              <span className="col-span-3 text-caption text-ink-secondary md:col-span-1">{s.use}</span>
            </div>
          ))}
        </div>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Corner radius">
          <div className="grid grid-cols-5 gap-3">
            {radii.map((r) => (
              <div key={r.token} className="flex flex-col items-center gap-2 text-center">
                <div className="size-16 border-2 border-navy-900 bg-navy-50" style={{ borderRadius: Math.min(r.px, 32) }} />
                <p className="font-mono text-[11px] font-semibold text-ink">{r.token.replace('rounded-', '')}</p>
                <p className="text-[11px] leading-tight text-ink-muted">{r.use}</p>
              </div>
            ))}
          </div>
        </Sub>
        <Sub title="Elevation" description="Borders first. Shadows are navy-tinted and reserved for things that float.">
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-canvas p-4 sm:grid-cols-4">
            {elevations.map((e) => (
              <div key={e.token} className={cn('flex h-28 flex-col justify-end rounded-2xl bg-surface p-3', e.token === 'shadow-none' ? 'border border-line' : e.token)}>
                <p className="font-mono text-caption font-semibold text-ink">{e.token.replace('shadow-', '')}</p>
                <p className="text-[11px] leading-tight text-ink-muted">{e.use}</p>
              </div>
            ))}
          </div>
        </Sub>
      </div>

      <Sub title="Responsive grid" description="Content is constrained to 1200px on desktop. Cards snap to the grid; text measures stay at 60–75 characters.">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr_2.2fr] lg:items-end">
          <GridDiagram cols={4} margin={16} gutter={16} label="Mobile" width="max-w-[200px]" />
          <GridDiagram cols={8} margin={24} gutter={24} label="Tablet" width="max-w-[320px]" />
          <GridDiagram cols={12} margin={32} gutter={24} label="Desktop" width="" />
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-body-sm">
            <thead className="bg-sunken text-caption uppercase tracking-wide text-ink-muted">
              <tr>
                {['Breakpoint', 'Width (px)', 'Columns', 'Margin', 'Gutter', 'Navigation'].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {breakpoints.map((b) => (
                <tr key={b.name}>
                  <td className="px-4 py-3 font-semibold text-ink">{b.name}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{b.range}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{b.cols}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{b.margin}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-secondary">{b.gutter}</td>
                  <td className="px-4 py-3 text-ink-secondary">{b.nav}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="Layout rules">
        <SpecList
          items={[
            ['Touch targets', <>Minimum 48 × 48px for every interactive element. Small visuals (e.g. a 20px checkbox) get padded hit areas via <Code>min-h-12</Code>.</>],
            ['Card padding', '16px on mobile, 20px default, 24px on desktop feature cards.'],
            ['Stacking', '12px between label and control, 16px between cards, 32–40px between sections on mobile, 48–64px on desktop.'],
            ['Motion', '150ms for colour/state, 200–300ms for position, ease-out. Respect prefers-reduced-motion. No decorative looping animation.'],
          ]}
        />
      </Sub>
    </Section>
  )
}
