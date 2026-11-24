import { Section, Sub, DoDont } from '../kit'
import { typeScale } from '@/design-system/tokens'

export function TypographySection() {
  return (
    <Section id="typography" index="03" eyebrow="Typography" title="Inter, set with intent" intro="One family, four weights (400–700). Tight tracking on large sizes keeps headlines premium; generous line-height keeps learning content easy to read.">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-between rounded-3xl bg-navy-900 p-6 text-white md:p-8">
          <p className="text-overline uppercase text-teal-300">Primary typeface</p>
          <p className="mt-6 text-[96px] font-bold leading-none tracking-[-0.04em] md:text-[128px]">Aa</p>
          <div>
            <p className="mt-6 text-heading">Inter</p>
            <p className="mt-1 text-body-sm text-white/70">Open-source · Variable · Tabular figures · Excellent Bahasa Melayu & English legibility</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            [400, 'Regular', 'Body, descriptions'],
            [500, 'Medium', 'Captions, inactive nav'],
            [600, 'Semibold', 'Labels, card titles'],
            [700, 'Bold', 'Display, page titles, figures'],
          ].map(([w, n, u]) => (
            <div key={n} className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[40px] leading-none text-navy-900" style={{ fontWeight: Number(w) }}>
                Ag
              </p>
              <p className="mt-4 text-body-sm font-semibold text-ink">
                {n} · {w}
              </p>
              <p className="text-caption text-ink-muted">{u}</p>
            </div>
          ))}
        </div>
      </div>

      <Sub title="Type scale" description="Mobile-first. Display steps down one level below 768px (display-xl → display, display → title).">
        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          {typeScale.map((t) => (
            <div key={t.token} className="grid gap-2 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[180px_1fr] md:items-center md:gap-6">
              <div>
                <p className="font-mono text-body-sm font-semibold text-navy-900">{t.token}</p>
                <p className="text-caption tabular-nums text-ink-muted">
                  {t.size}/{t.line} · {t.weight} · {t.tracking}
                </p>
                <p className="text-caption text-ink-muted">{t.use}</p>
              </div>
              <p className={`${t.cls} min-w-0 truncate text-ink`}>{t.sample}</p>
            </div>
          ))}
        </div>
      </Sub>

      <Sub title="Numerical data" description="Always use tabular figures for money, points and percentages so columns align and values don't jump while animating.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="text-body-sm text-ink-secondary">Emergency fund</p>
            <p className="mt-1 text-numeric-xl tabular-nums text-ink">
              <span className="mr-1 align-top text-body font-semibold text-ink-muted">RM</span>12,480<span className="text-ink-muted">.00</span>
            </p>
            <p className="text-caption text-success-700">+ RM 300.00 this month</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5">
            <p className="mb-2 text-body-sm text-ink-secondary">Tabular alignment</p>
            {['1,111.10', '28,450.00', '305.75'].map((v) => (
              <p key={v} className="flex justify-between border-b border-line py-1.5 text-body tabular-nums last:border-b-0">
                <span className="text-ink-muted">RM</span>
                <span className="font-semibold text-ink">{v}</span>
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <DoDont kind="do">Format currency as “RM 1,250.00” with a space after RM and en-MY grouping.</DoDont>
            <DoDont kind="dont">Mix proportional and tabular figures in the same table or chart axis.</DoDont>
          </div>
        </div>
      </Sub>

      <Sub title="Editorial pairing" description="How the scale composes on a Learn article.">
        <article className="max-w-2xl rounded-3xl border border-line bg-surface p-6 md:p-8">
          <p className="text-overline uppercase text-teal-700">Protection education · 4 min</p>
          <h4 className="mt-2 text-title text-ink">What actually happens when you are hospitalised?</h4>
          <p className="mt-3 text-body-lg text-ink-secondary">A short, honest walkthrough of the costs young adults often don&apos;t expect — and how protection concepts fit in.</p>
          <h5 className="mt-6 text-subheading text-ink">1. Admission and deposits</h5>
          <p className="mt-2 text-body text-ink-secondary">
            Private hospitals may ask for a deposit before admission. Understanding how medical coverage and guarantee letters work helps you prepare before you ever need it.
          </p>
          <p className="mt-4 text-caption text-ink-muted">Educational content only. Not financial advice.</p>
        </article>
      </Sub>
    </Section>
  )
}
