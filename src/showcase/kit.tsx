import { useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Section({ id, index, eyebrow, title, intro, children }: { id: string; index: string; eyebrow: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36 border-t border-line py-8 first:border-t-0 sm:py-10 md:scroll-mt-24 md:py-16">
      <header className="mb-6 max-w-3xl sm:mb-8 md:mb-10">
        <p className="flex items-center gap-2 text-overline uppercase text-teal-700">
          <span className="tabular-nums text-ink-muted">{index}</span>
          <span className="h-px w-6 bg-line-strong" aria-hidden />
          {eyebrow}
        </p>
        <h2 id={`${id}-title`} className="mt-3 text-title text-ink md:text-display">
          {title}
        </h2>
        {intro && <p className="mt-2 text-body text-ink-secondary sm:mt-3 sm:text-body-lg">{intro}</p>}
      </header>
      <div className="flex flex-col gap-10 md:gap-12">{children}</div>
    </section>
  )
}

export function Sub({ title, description, children, aside }: { title: string; description?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h3 className="text-heading text-ink">{title}</h3>
          {description && <p className="mt-1 text-body-sm text-ink-secondary">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </div>
  )
}

export type SpecimenSurface = 'surface' | 'canvas' | 'navy' | 'sunken'

const surfaceCls: Record<SpecimenSurface, string> = {
  surface: 'bg-surface border-line',
  canvas: 'bg-canvas border-line',
  sunken: 'bg-sunken border-transparent',
  navy: 'bg-navy-900 border-navy-900 text-white',
}

export function Specimen({ label, surface = 'surface', className, children, padded = true }: { label?: string; surface?: SpecimenSurface; className?: string; children: ReactNode; padded?: boolean }) {
  return (
    <div className={cn('relative rounded-3xl border', surfaceCls[surface], padded && 'p-5 md:p-8', className)}>
      {label && (
        <span className={cn('absolute left-5 top-0 -translate-y-1/2 rounded-full border px-2.5 py-0.5 text-caption', surface === 'navy' ? 'border-navy-700 bg-navy-800 text-white/80' : 'border-line bg-surface text-ink-muted')}>
          {label}
        </span>
      )}
      {children}
    </div>
  )
}

/** Lets readers preview the same specimen on each approved surface. */
export function SurfaceSwitch({ children, initial = 'surface', label = 'Preview on' }: { children: (s: SpecimenSurface) => ReactNode; initial?: SpecimenSurface; label?: string }) {
  const [s, setS] = useState<SpecimenSurface>(initial)
  const opts: Array<[SpecimenSurface, string]> = [
    ['surface', 'Surface'],
    ['canvas', 'Canvas'],
    ['navy', 'Navy'],
  ]
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-caption text-ink-muted">{label}</span>
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-surface p-0.5">
          {opts.map(([k, l]) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={s === k}
              onClick={() => setS(k)}
              className={cn('inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-colors', s === k ? 'bg-navy-900 text-white' : 'text-ink-muted hover:text-ink')}
            >
              <span className={cn('size-2.5 rounded-full border', k === 'surface' && 'border-line-strong bg-white', k === 'canvas' && 'border-line-strong bg-canvas', k === 'navy' && 'border-navy-900 bg-navy-900', s === k && 'border-white/40')} aria-hidden />
              {l}
            </button>
          ))}
        </div>
      </div>
      <Specimen surface={s}>{children(s)}</Specimen>
    </div>
  )
}

export function DoDont({ kind, children }: { kind: 'do' | 'dont'; children: ReactNode }) {
  const isDo = kind === 'do'
  return (
    <div className={cn('flex gap-3 rounded-2xl border p-4', isDo ? 'border-success-200 bg-success-50/60' : 'border-error-200 bg-error-50/60')}>
      <span className={cn('mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-white', isDo ? 'bg-success-700' : 'bg-error-700')} aria-hidden>
        {isDo ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      </span>
      <div className="text-body-sm text-ink-secondary">
        <p className={cn('mb-0.5 font-semibold', isDo ? 'text-success-700' : 'text-error-700')}>{isDo ? 'Do' : "Don't"}</p>
        {children}
      </div>
    </div>
  )
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[0.85em] text-navy-800">{children}</code>
}

export function SpecList({ items }: { items: Array<[string, ReactNode]> }) {
  return (
    <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-40 shrink-0 text-body-sm font-semibold text-ink">{k}</dt>
          <dd className="text-body-sm text-ink-secondary">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
