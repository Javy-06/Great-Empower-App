import { useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { IconTile } from '@/components/ui/IconTile'
import { Slider } from '@/components/ui/Field'

const rm = (v: number) => `RM ${v.toLocaleString('en-MY')}`

/** Interactive calculator pattern: inputs on top, consequence summary below. Figures are illustrative only. */
export function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(2200)
  const [months, setMonths] = useState(6)
  const [saved, setSaved] = useState(5000)
  const target = expenses * months
  const pct = Math.min(100, Math.round((saved / target) * 100))
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line p-4">
        <IconTile icon={LifeBuoy} tone="teal" />
        <div>
          <h3 className="text-subheading text-ink">Emergency fund calculator</h3>
          <p className="text-caption text-ink-muted">Educational estimate · not financial advice</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <Slider label="Monthly expenses" min={800} max={6000} step={100} value={expenses} onChange={setExpenses} format={rm} />
        <Slider label="Months of cover" min={3} max={12} value={months} onChange={setMonths} format={(v) => `${v} mo`} />
        <Slider label="Already saved" min={0} max={30000} step={500} value={saved} onChange={setSaved} format={rm} />
      </div>
      <div className="bg-navy-900 p-4 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption text-white/70">Suggested target</p>
            <p className="text-numeric tabular-nums">{rm(target)}</p>
          </div>
          <Badge tone={pct >= 100 ? 'success' : pct >= 50 ? 'teal' : 'warning'} variant="solid">
            {pct}% there
          </Badge>
        </div>
        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-teal-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-caption text-white/70">
          {pct >= 100 ? 'You have reached your target.' : `${rm(Math.max(0, target - saved))} to go — about ${Math.ceil(Math.max(0, target - saved) / 300)} months at RM 300/mo.`}
        </p>
      </div>
    </Card>
  )
}
