import { ArrowRight, Bell, Bookmark, Download, Gift, Heart, MoreHorizontal, Plus, Share2, Trash2, X } from 'lucide-react'
import { Section, Sub, SurfaceSwitch, DoDont, Specimen } from '../kit'
import { Button, IconButton, type ButtonVariant } from '@/components/ui/Button'

const rows: Array<{ variant: ButtonVariant; name: string; use: string; dark?: boolean }> = [
  { variant: 'primary', name: 'Primary', use: 'The main action on a screen' },
  { variant: 'accent', name: 'Accent', use: 'Key conversion · max one per view' },
  { variant: 'support', name: 'Support', use: 'Learning & simulation actions' },
  { variant: 'secondary', name: 'Secondary', use: 'Alternative actions' },
  { variant: 'ghost', name: 'Tertiary', use: 'Low-emphasis, inline' },
  { variant: 'danger', name: 'Destructive', use: 'Remove, reset, leave' },
]

const darkRows: Array<{ variant: ButtonVariant; name: string }> = [
  { variant: 'inverse', name: 'Inverse' },
  { variant: 'inverse-outline', name: 'Inverse outline' },
  { variant: 'accent', name: 'Accent' },
]

export function ButtonsSection() {
  return (
    <Section id="buttons" index="05" eyebrow="Components" title="Buttons" intro="A clear hierarchy: navy primary for most actions, crimson only for the moment that matters most, teal for learning and simulation. Every button is at least 48px tall on touch devices.">
      <Sub title="Variants & states" description="Hover, pressed and focus are shown statically for reference. All states are live on the Default column.">
        <div className="overflow-x-auto rounded-3xl border border-line bg-surface">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-line text-caption uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-semibold">
                  Variant
                </th>
                {['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading'].map((s) => (
                  <th key={s} scope="col" className="px-3 py-3 font-semibold">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.variant}>
                  <th scope="row" className="w-52 px-5 py-4 align-middle font-normal">
                    <p className="text-body-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-caption text-ink-muted">{r.use}</p>
                  </th>
                  <td className="px-3 py-4">
                    <Button variant={r.variant}>Continue</Button>
                  </td>
                  <td className="px-3 py-4">
                    <Button variant={r.variant} forceState="hover" tabIndex={-1}>
                      Continue
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Button variant={r.variant} forceState="pressed" tabIndex={-1}>
                      Continue
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Button variant={r.variant} forceState="focus" tabIndex={-1}>
                      Continue
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Button variant={r.variant} disabled>
                      Continue
                    </Button>
                  </td>
                  <td className="px-3 py-4">
                    <Button variant={r.variant} loading>
                      Saving
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sub>

      <Sub title="On dark surfaces" description="On navy, use inverse variants. Crimson remains available for the single key action.">
        <Specimen surface="navy">
          <div className="grid gap-6 sm:grid-cols-3">
            {darkRows.map((r) => (
              <div key={r.variant} className="flex flex-col items-start gap-3">
                <p className="text-caption text-white/70">{r.name}</p>
                <Button variant={r.variant}>Continue</Button>
                <Button variant={r.variant} forceState="hover" tabIndex={-1}>
                  Hover
                </Button>
                <Button variant={r.variant} forceState="focus" tabIndex={-1}>
                  Focus
                </Button>
              </div>
            ))}
          </div>
        </Specimen>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Sizes" description="Small (40px) is for dense desktop toolbars only.">
          <Specimen>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col items-start gap-2">
                <Button size="sm" leadingIcon={Plus}>
                  Small
                </Button>
                <span className="text-caption text-ink-muted">sm · 40</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button size="md" leadingIcon={Plus}>
                  Medium
                </Button>
                <span className="text-caption text-ink-muted">md · 48 (default)</span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <Button size="lg" leadingIcon={Plus}>
                  Large
                </Button>
                <span className="text-caption text-ink-muted">lg · 56</span>
              </div>
            </div>
            <div className="mt-6 max-w-sm">
              <Button size="lg" fullWidth trailingIcon={ArrowRight}>
                Full-width on mobile
              </Button>
            </div>
          </Specimen>
        </Sub>
        <Sub title="Icon buttons" description="Always have an accessible label. 48px default, 40px compact.">
          <Specimen>
            <div className="flex flex-wrap items-center gap-2">
              <IconButton icon={Bell} label="Notifications" badge />
              <IconButton icon={Bookmark} label="Save" variant="secondary" />
              <IconButton icon={Share2} label="Share" variant="secondary" />
              <IconButton icon={Plus} label="Add" variant="primary" />
              <IconButton icon={Heart} label="Like" variant="accent" />
              <IconButton icon={MoreHorizontal} label="More options" size="sm" />
              <IconButton icon={X} label="Close" size="sm" variant="secondary" />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" leadingIcon={Download}>
                Leading icon
              </Button>
              <Button variant="ghost" trailingIcon={ArrowRight}>
                Trailing icon
              </Button>
            </div>
          </Specimen>
        </Sub>
      </div>

      <Sub title="Hierarchy in context" description="Switch the surface to see how groups adapt.">
        <SurfaceSwitch>
          {(s) =>
            s === 'navy' ? (
              <div className="flex max-w-xl flex-col gap-4">
                <p className="text-heading text-white">Ready to claim your reward?</p>
                <p className="text-body-sm text-white/70">Redeeming uses 800 points from your wallet. This can&apos;t be undone.</p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="accent" leadingIcon={Gift}>
                    Redeem now
                  </Button>
                  <Button variant="inverse-outline">Maybe later</Button>
                </div>
              </div>
            ) : (
              <div className="flex max-w-xl flex-col gap-4">
                <p className="text-heading text-ink">Leave this lesson?</p>
                <p className="text-body-sm text-ink-secondary">Your progress is saved. You can resume “Understanding medical cards” any time.</p>
                <div className="flex flex-wrap gap-3">
                  <Button>Keep learning</Button>
                  <Button variant="secondary">Save & exit</Button>
                  <Button variant="danger" leadingIcon={Trash2}>
                    Reset progress
                  </Button>
                </div>
              </div>
            )
          }
        </SurfaceSwitch>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DoDont kind="do">Use one primary (or one accent) per view. Pair it with a secondary or tertiary action.</DoDont>
          <DoDont kind="dont">Place two crimson buttons side by side, or use crimson for routine navigation.</DoDont>
        </div>
      </Sub>
    </Section>
  )
}
