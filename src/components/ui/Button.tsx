import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'support'
  | 'danger'
  | 'inverse'
  | 'inverse-outline'
export type ButtonSize = 'sm' | 'md' | 'lg'
/** Documentation-only: renders a static visual state. */
export type ForcedState = 'hover' | 'pressed' | 'focus'

type VariantStyle = { common: string; idle: string; hover: string; pressed: string; interactive: string; disabled: string }

const variants: Record<ButtonVariant, VariantStyle> = {
  primary: {
    common: 'text-white',
    idle: 'bg-navy-900',
    hover: 'bg-navy-800',
    pressed: 'bg-navy-950',
    interactive: 'hover:bg-navy-800 active:bg-navy-950',
    disabled: 'disabled:bg-sunken disabled:text-ink-disabled',
  },
  accent: {
    common: 'text-white',
    idle: 'bg-crimson-600',
    hover: 'bg-crimson-700',
    pressed: 'bg-crimson-800',
    interactive: 'hover:bg-crimson-700 active:bg-crimson-800',
    disabled: 'disabled:bg-sunken disabled:text-ink-disabled',
  },
  support: {
    common: 'text-white',
    idle: 'bg-teal-600',
    hover: 'bg-teal-700',
    pressed: 'bg-teal-800',
    interactive: 'hover:bg-teal-700 active:bg-teal-800',
    disabled: 'disabled:bg-sunken disabled:text-ink-disabled',
  },
  secondary: {
    common: 'text-navy-900 border border-line-strong',
    idle: 'bg-surface',
    hover: 'bg-navy-50 border-navy-300',
    pressed: 'bg-navy-100 border-navy-300',
    interactive: 'hover:bg-navy-50 hover:border-navy-300 active:bg-navy-100',
    disabled: 'disabled:bg-surface disabled:border-line disabled:text-ink-disabled',
  },
  ghost: {
    common: 'text-navy-800',
    idle: 'bg-transparent',
    hover: 'bg-navy-50',
    pressed: 'bg-navy-100',
    interactive: 'hover:bg-navy-50 active:bg-navy-100',
    disabled: 'disabled:bg-transparent disabled:text-ink-disabled',
  },
  danger: {
    common: 'text-crimson-700 border border-crimson-200',
    idle: 'bg-surface',
    hover: 'bg-crimson-50',
    pressed: 'bg-crimson-100',
    interactive: 'hover:bg-crimson-50 active:bg-crimson-100',
    disabled: 'disabled:bg-surface disabled:border-line disabled:text-ink-disabled',
  },
  inverse: {
    common: 'text-navy-900',
    idle: 'bg-white',
    hover: 'bg-navy-50',
    pressed: 'bg-navy-100',
    interactive: 'hover:bg-navy-50 active:bg-navy-100',
    disabled: 'disabled:bg-white/15 disabled:text-white/50',
  },
  'inverse-outline': {
    common: 'text-white border border-white/35',
    idle: 'bg-transparent',
    hover: 'bg-white/10',
    pressed: 'bg-white/15',
    interactive: 'hover:bg-white/10 active:bg-white/15',
    disabled: 'disabled:border-white/15 disabled:text-white/40',
  },
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-12 px-4 gap-1.5 text-body-sm font-semibold',
  md: 'h-12 px-5 gap-2 text-label',
  lg: 'h-14 px-6 gap-2 text-body font-semibold',
}

const iconSizes: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 }

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, forced?: ForcedState, fullWidth?: boolean) {
  const v = variants[variant]
  const isDark = variant === 'inverse' || variant === 'inverse-outline'
  return cn(
    'relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl transition-colors duration-200 ease-out disabled:cursor-not-allowed',
    sizes[size],
    v.common,
    forced === 'hover' ? v.hover : forced === 'pressed' ? v.pressed : cn(v.idle, v.interactive),
    forced === 'focus' && (isDark ? 'outline-2 outline-offset-2 outline-teal-300' : 'outline-2 outline-offset-2 outline-teal-600'),
    isDark && 'focus-visible:outline-teal-300',
    v.disabled,
    fullWidth && 'w-full',
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leadingIcon?: LucideIcon
  trailingIcon?: LucideIcon
  loading?: boolean
  fullWidth?: boolean
  forceState?: ForcedState
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  leadingIcon: Leading,
  trailingIcon: Trailing,
  loading = false,
  fullWidth,
  forceState,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = iconSizes[size]
  return (
    <button
      type={type}
      className={cn(buttonClasses(variant, size, forceState, fullWidth), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} strokeWidth={2} className="animate-spin" aria-hidden />
      ) : (
        Leading && <Leading size={iconSize} strokeWidth={2} aria-hidden />
      )}
      {children}
      {!loading && Trailing && <Trailing size={iconSize} strokeWidth={2} aria-hidden />}
    </button>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  label: string
  variant?: Extract<ButtonVariant, 'primary' | 'secondary' | 'ghost' | 'inverse-outline' | 'accent'>
  size?: 'sm' | 'md'
  badge?: boolean
}

export function IconButton({ icon: Icon, label, variant = 'ghost', size = 'md', badge, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(buttonClasses(variant, 'md'), 'shrink-0', size === 'md' ? 'size-12 !px-0' : 'size-10 !px-0', className)}
      {...rest}
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden />
      {badge && <span className="absolute right-3 top-3 size-2 rounded-full bg-crimson-600 ring-2 ring-white" aria-hidden />}
    </button>
  )
}
