import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type TileTone = 'navy' | 'teal' | 'crimson' | 'gold' | 'neutral' | 'navy-solid' | 'glass'

const toneCls: Record<TileTone, string> = {
  navy: 'bg-navy-50 text-navy-900',
  teal: 'bg-teal-50 text-teal-700',
  crimson: 'bg-crimson-50 text-crimson-700',
  gold: 'bg-gold-50 text-gold-700',
  neutral: 'bg-sunken text-ink-secondary',
  'navy-solid': 'bg-navy-900 text-white',
  glass: 'bg-white/10 text-white',
}

const sizeCls = { sm: 'size-8 rounded-lg', md: 'size-10 rounded-xl', lg: 'size-12 rounded-xl', xl: 'size-14 rounded-2xl' }
const iconPx = { sm: 16, md: 20, lg: 24, xl: 28 }

export function IconTile({ icon: Icon, tone = 'navy', size = 'md', className }: { icon: LucideIcon; tone?: TileTone; size?: keyof typeof sizeCls; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center', sizeCls[size], toneCls[tone], className)} aria-hidden>
      <Icon size={iconPx[size]} strokeWidth={1.75} />
    </span>
  )
}
