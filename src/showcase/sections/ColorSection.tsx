import { Section, Sub, Code } from '../kit'
import { brandColors, colorScales, semanticTokens, feedbackTokens, contrastPairs } from '@/design-system/tokens'
import { contrastRatio, luminance, wcagLevel } from '@/lib/contrast'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'

const textOn = (hex: string) => (luminance(hex) > 0.4 ? '#0F172A' : '#FFFFFF')

export function ColorSection() {
  return (
    <Section id="color" index="02" eyebrow="Colour" title="Colour palette & tokens" intro="Navy carries the brand. Teal supports learning and progress. Crimson is a scarce, high-value accent — if everything is red, nothing is important.">
      <Sub title="Brand colours">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {brandColors.map((c, i) => (
            <div key={c.token} className={cn('overflow-hidden rounded-2xl border border-line bg-surface', i === 0 && 'col-span-2 md:col-span-1')}>
              <div className="flex h-28 items-end p-3" style={{ background: c.hex, color: textOn(c.hex) }}>
                <span className="text-caption font-semibold tabular-nums">{c.hex}</span>
              </div>
              <div className="p-3">
                <p className="text-body-sm font-semibold text-ink">{c.name}</p>
                <p className="mt-0.5 font-mono text-caption text-ink-muted">{c.token}</p>
                <p className="mt-2 text-caption text-ink-secondary">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="Usage ratio" description="Approximate share of colour across a typical screen.">
        <div className="flex h-14 overflow-hidden rounded-2xl text-caption font-semibold">
          <div className="flex items-center bg-canvas px-3 text-ink-muted ring-1 ring-inset ring-line" style={{ width: '48%' }}>
            Neutrals 48%
          </div>
          <div className="flex items-center bg-navy-900 px-3 text-white" style={{ width: '36%' }}>
            Navy 36%
          </div>
          <div className="flex items-center bg-teal-600 px-2 text-white" style={{ width: '11%' }}>
            Teal
          </div>
          <div className="flex items-center justify-center bg-crimson-600 text-white" style={{ width: '5%' }} title="Crimson 5%">
            <span className="sr-only">Crimson </span>5%
          </div>
        </div>
      </Sub>

      <Sub title="Tonal scales" description={<>Anchor steps are outlined. Reference as Tailwind utilities, e.g. <Code>bg-navy-50</Code>, <Code>text-teal-700</Code>, <Code>border-crimson-200</Code>.</>}>
        <div className="flex flex-col gap-4">
          {colorScales.map((scale) => (
            <div key={scale.name}>
              <p className="mb-2 text-body-sm font-semibold text-ink">{scale.name}</p>
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10 lg:grid-cols-11">
                {scale.swatches.map((s) => (
                  <div key={s.step} className="min-w-0">
                    <div className={cn('h-12 rounded-lg', s.step === scale.anchor && 'ring-2 ring-offset-2 ring-navy-900', s.hex === '#FFFFFF' || s.step === '50' ? 'ring-1 ring-inset ring-line' : '')} style={{ background: s.hex }} />
                    <p className="mt-1.5 text-caption font-semibold text-ink">{s.step}</p>
                    <p className="truncate font-mono text-[10px] text-ink-muted">{s.hex}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-2 text-body-sm font-semibold text-ink">Gold — Rewards accent only</p>
            <div className="flex gap-1.5">
              {['#FBF6EA', '#F5E8C7', '#E2C071', '#C9A03F', '#8A6516'].map((h, i) => (
                <div key={h} className="w-16">
                  <div className="h-12 rounded-lg ring-1 ring-inset ring-black/5" style={{ background: h }} />
                  <p className="mt-1.5 text-caption font-semibold text-ink">{['50', '100', '300', '500', '700'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sub>

      <Sub title="Semantic tokens" description="Components consume roles, not raw scale steps. Change a role once; every screen follows.">
        <div className="grid gap-4 lg:grid-cols-3">
          {semanticTokens.map((g) => (
            <div key={g.group} className="rounded-2xl border border-line bg-surface">
              <p className="border-b border-line px-4 py-3 text-overline uppercase text-ink-muted">{g.group}</p>
              <ul className="divide-y divide-line">
                {g.items.map((t) => (
                  <li key={t.token} className="flex items-center gap-3 px-4 py-3">
                    <span className="size-8 shrink-0 rounded-lg ring-1 ring-inset ring-black/10" style={{ background: t.hex }} aria-hidden />
                    <div className="min-w-0">
                      <p className="font-mono text-body-sm font-medium text-ink">{t.token}</p>
                      <p className="text-caption text-ink-muted">{t.usage}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="Feedback colours" description="Status always pairs colour with an icon and text — never colour alone.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {feedbackTokens.map((f) => (
            <div key={f.name} className="rounded-2xl border p-4" style={{ background: f.bg, borderColor: f.border }}>
              <p className="text-body font-semibold" style={{ color: f.fg }}>
                {f.name}
              </p>
              <p className="mt-1 text-caption text-ink-secondary">{f.usage}</p>
              <div className="mt-3 flex gap-2 font-mono text-[11px] text-ink-muted">
                <span>{f.fg}</span>
                <span>{f.bg}</span>
              </div>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="Contrast checks" description="Ratios are calculated live from the token values (WCAG 2.1). Body text requires 4.5:1; large text and UI parts 3:1.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {contrastPairs.map((p) => {
            const ratio = contrastRatio(p.fg, p.bg)
            const level = wcagLevel(ratio)
            return (
              <div key={p.label} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex h-20 items-center justify-center text-heading" style={{ background: p.bg, color: p.fg }}>
                  Aa 123
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-caption font-semibold text-ink">{p.label}</p>
                    <p className="text-caption tabular-nums text-ink-muted">{ratio.toFixed(2)} : 1</p>
                  </div>
                  <Badge size="sm" tone={level === 'Fail' ? 'error' : level === 'AA Large' ? 'warning' : 'success'}>
                    {level}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </Sub>
    </Section>
  )
}
