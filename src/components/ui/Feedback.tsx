import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type AlertTone = 'success' | 'warning' | 'error' | 'info'

const alertCfg: Record<AlertTone, { icon: LucideIcon; box: string; icon_cls: string }> = {
  success: { icon: CheckCircle2, box: 'bg-success-50 border-success-200', icon_cls: 'text-success-700' },
  warning: { icon: AlertTriangle, box: 'bg-warning-50 border-warning-200', icon_cls: 'text-warning-700' },
  error: { icon: XCircle, box: 'bg-error-50 border-error-200', icon_cls: 'text-error-700' },
  info: { icon: Info, box: 'bg-info-50 border-info-200', icon_cls: 'text-info-600' },
}

export function Alert({ tone = 'info', title, children, action, onDismiss }: { tone?: AlertTone; title: string; children?: ReactNode; action?: ReactNode; onDismiss?: () => void }) {
  const { icon: Icon, box, icon_cls } = alertCfg[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-2xl border p-4', box)}>
      <Icon size={20} strokeWidth={2} className={cn('mt-0.5 shrink-0', icon_cls)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-semibold text-ink">{title}</p>
        {children && <div className="mt-0.5 text-body-sm text-ink-secondary">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-black/5">
          <X size={18} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  )
}

export function Toast({ tone = 'success', message, actionLabel }: { tone?: AlertTone; message: string; actionLabel?: string }) {
  const { icon: Icon } = alertCfg[tone]
  const iconColor = { success: 'text-success-200', warning: 'text-warning-200', error: 'text-crimson-300', info: 'text-navy-200' }[tone]
  return (
    <div role="status" className="flex min-h-14 w-full max-w-sm items-center gap-3 rounded-2xl bg-navy-950 py-2 pl-4 pr-2 text-white shadow-e3">
      <Icon size={20} strokeWidth={2} className={cn('shrink-0', iconColor)} aria-hidden />
      <p className="flex-1 text-body-sm font-medium">{message}</p>
      {actionLabel && (
        <button type="button" className="h-10 rounded-lg px-3 text-body-sm font-semibold text-teal-300 hover:bg-white/10">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-line/70', className)} aria-hidden />
}

export function Spinner({ size = 24, label = 'Loading' }: { size?: number; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-ink-muted">
      <Loader2 size={size} strokeWidth={2} className="animate-spin text-teal-600" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="relative mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-navy-50 text-navy-900" aria-hidden>
        <Icon size={28} strokeWidth={1.5} />
        <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-teal-600" />
      </span>
      <h4 className="text-subheading text-ink">{title}</h4>
      <p className="mt-1.5 max-w-xs text-body-sm text-ink-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
