import { useState } from 'react'
import { CalendarDays, Mail, Users } from 'lucide-react'
import { Section, Sub, Specimen } from '../kit'
import { TextField, SearchField, SelectField, Checkbox, RadioGroup, Switch, Slider, SegmentedControl } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/ui/Progress'

export function FormsSection() {
  const [income, setIncome] = useState('3500')
  const [dependants, setDependants] = useState<'0' | '1' | '2' | '3+'>('0')
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [savingRate, setSavingRate] = useState(15)
  const [submitted, setSubmitted] = useState(false)
  const incomeError = submitted && (!income || Number(income) <= 0) ? 'Enter your monthly income to continue' : undefined

  return (
    <Section id="forms" index="07" eyebrow="Components" title="Forms & inputs" intro="Inputs are 48px tall with a visible label above — never placeholder-only. Errors explain how to fix, and every control is fully keyboard operable.">
      <Sub title="Text field states">
        <Specimen>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Default" placeholder="e.g. Aisyah Hassan" />
            <TextField label="Focus" placeholder="Focused field" forceFocus />
            <TextField label="Filled" defaultValue="aisyah@email.my" leadingIcon={Mail} />
            <TextField label="With hint" placeholder="DD / MM / YYYY" leadingIcon={CalendarDays} hint="Used to tailor lessons to your life stage." />
            <TextField label="Error" defaultValue="12" prefix="RM" error="Amount must be at least RM 100" />
            <TextField label="Disabled" defaultValue="Locked value" disabled />
          </div>
        </Specimen>
      </Sub>

      <div className="grid gap-10 lg:grid-cols-2">
        <Sub title="Selection controls" description="Navy for selection. Hit areas are 48px even when the visual is 20px.">
          <Specimen>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-body-sm font-semibold text-ink">Checkbox</p>
                <Checkbox label="Medical expenses" defaultChecked />
                <Checkbox label="Critical illness" />
                <Checkbox label="Unavailable option" disabled />
              </div>
              <RadioGroup
                name="goal"
                legend="Radio"
                defaultValue="save"
                options={[
                  { value: 'save', label: 'Build savings' },
                  { value: 'protect', label: 'Understand protection' },
                  { value: 'debt', label: 'Manage debt' },
                ]}
              />
            </div>
            <div className="mt-4 border-t border-line pt-2">
              <Switch label="Weekly learning reminders" description="Every Monday, 8:00 pm" defaultOn />
              <Switch label="Points expiry alerts" />
              <Switch label="Partner offers" description="Available when partners are confirmed" disabled />
            </div>
          </Specimen>
        </Sub>
        <Sub title="Search, select & segmented">
          <Specimen className="flex flex-col gap-6">
            <SearchField placeholder="Search articles, lessons, FAQs" />
            <SearchField placeholder="Sunken search (inside cards)" tone="sunken" />
            <SelectField label="Employment status" options={['Full-time employee', 'Student', 'Self-employed / gig', 'Between jobs']} />
            <div>
              <p className="mb-2 text-body-sm font-semibold text-ink">Segmented control</p>
              <SegmentedControl
                label="Period"
                fullWidth
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                  { value: 'year', label: 'Year' },
                ]}
              />
            </div>
          </Specimen>
        </Sub>
      </div>

      <Sub title="Composed form — Protection check-in" description="A working example: validation runs on submit, the slider drives a live value, and the stepper shows position in a multi-step flow.">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
            }}
            className="rounded-3xl border border-line bg-surface p-5 md:p-8"
          >
            <Stepper steps={['About you', 'Money', 'Protection', 'Results']} current={1} />
            <h4 className="mt-8 text-heading text-ink">Your monthly money</h4>
            <p className="mt-1 text-body-sm text-ink-secondary">Rough numbers are fine. This stays on your device in this prototype.</p>
            <div className="mt-6 flex flex-col gap-6">
              <TextField label="Monthly take-home income" prefix="RM" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value.replace(/[^\d]/g, ''))} error={incomeError} hint="After EPF and tax deductions" />
              <div>
                <p className="mb-2 flex items-center gap-2 text-body-sm font-semibold text-ink">
                  <Users size={16} aria-hidden /> People who depend on you
                </p>
                <SegmentedControl
                  label="Dependants"
                  fullWidth
                  value={dependants}
                  onChange={setDependants}
                  options={[
                    { value: '0', label: 'None' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3+', label: '3+' },
                  ]}
                />
              </div>
              <Slider label="Share of income you save" min={0} max={50} value={savingRate} onChange={setSavingRate} format={(v) => `${v}%`} />
              <Checkbox label="I understand this is educational and not financial advice" defaultChecked />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-between">
              <Button variant="ghost">Back</Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
          <div className="flex flex-col gap-4 rounded-3xl bg-navy-900 p-6 text-white">
            <p className="text-overline uppercase text-white/60">Live summary</p>
            <div>
              <p className="text-caption text-white/70">Monthly savings at {savingRate}%</p>
              <p className="text-numeric-xl tabular-nums">RM {Math.round((Number(income) || 0) * (savingRate / 100)).toLocaleString('en-MY')}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="text-caption text-white/60">Dependants</p>
                <p className="text-body font-semibold">{dependants === '0' ? 'None' : dependants}</p>
              </div>
              <div>
                <p className="text-caption text-white/60">Yearly</p>
                <p className="text-body font-semibold tabular-nums">RM {Math.round((Number(income) || 0) * (savingRate / 100) * 12).toLocaleString('en-MY')}</p>
              </div>
            </div>
            <p className="mt-auto text-caption text-white/60">Inputs update this panel instantly — the same pattern used by Simulate calculators.</p>
          </div>
        </div>
      </Sub>
    </Section>
  )
}
