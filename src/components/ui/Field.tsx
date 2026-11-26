import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { AlertCircle, Check, ChevronDown, Search, X, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="flex items-baseline justify-between text-body-sm font-semibold text-ink">
          {label}
          {optional && <span className="text-caption font-normal text-ink-muted">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-msg`} className="flex items-center gap-1.5 text-body-sm text-error-700">
          <AlertCircle size={16} strokeWidth={2} aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-msg`} className="text-body-sm text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

const controlBox = (error?: string, disabled?: boolean, forceFocus?: boolean) =>
  cn(
    'flex h-12 w-full items-center gap-2 rounded-xl border bg-surface px-4 transition-[border-color,box-shadow] duration-200',
    error
      ? 'border-error-600 focus-within:ring-4 focus-within:ring-error-600/12'
      : 'border-line-strong hover:border-navy-300 focus-within:border-navy-800 focus-within:ring-4 focus-within:ring-navy-900/10',
    forceFocus && !error && 'border-navy-800 ring-4 ring-navy-900/10',
    disabled && 'cursor-not-allowed border-line bg-sunken hover:border-line',
  )

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
  leadingIcon?: LucideIcon
  prefix?: string
  suffix?: ReactNode
  forceFocus?: boolean
}

export function TextField({ label, hint, error, optional, leadingIcon: Icon, prefix, suffix, forceFocus, disabled, className, id: idProp, ...rest }: TextFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className={cn(controlBox(error, disabled, forceFocus), className)}>
        {Icon && <Icon size={20} strokeWidth={1.75} className="shrink-0 text-ink-muted" aria-hidden />}
        {prefix && <span className="shrink-0 text-body font-semibold text-ink-muted">{prefix}</span>}
        <input
          id={id}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted disabled:cursor-not-allowed disabled:text-ink-disabled"
          {...rest}
        />
        {suffix}
      </div>
    </FieldShell>
  )
}

export function SearchField({ placeholder = 'Search', tone = 'light', className, value, onChange }: { placeholder?: string; tone?: 'light' | 'sunken'; className?: string; value?: string; onChange?: (value: string) => void }) {
  const [internalValue, setInternalValue] = useState('')
  const q = value ?? internalValue
  const updateValue = (nextValue: string) => {
    setInternalValue(nextValue)
    onChange?.(nextValue)
  }
  const id = useId()
  return (
    <div
      className={cn(
        'flex h-12 w-full items-center gap-2 rounded-xl border px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-navy-800 focus-within:ring-4 focus-within:ring-navy-900/10',
        tone === 'light' ? 'border-line-strong bg-surface' : 'border-transparent bg-sunken',
        className,
      )}
    >
      <Search size={20} strokeWidth={1.75} className="shrink-0 text-ink-muted" aria-hidden />
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => updateValue(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button type="button" onClick={() => updateValue('')} aria-label="Clear search" className="-mr-2 inline-flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-sunken">
          <X size={18} strokeWidth={2} aria-hidden />
        </button>
      )}
    </div>
  )
}

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  options: string[]
}

export function SelectField({ label, hint, error, options, disabled, id: idProp, ...rest }: SelectFieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className={cn(controlBox(error, disabled), 'relative px-0')}>
        <select
          id={id}
          disabled={disabled}
          className="h-full w-full appearance-none bg-transparent pl-4 pr-11 text-body text-ink outline-none disabled:cursor-not-allowed disabled:text-ink-disabled"
          {...rest}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={20} strokeWidth={1.75} className="pointer-events-none absolute right-4 text-ink-muted" aria-hidden />
      </div>
    </FieldShell>
  )
}

export function Checkbox({ label, description, defaultChecked, disabled }: { label: string; description?: string; defaultChecked?: boolean; disabled?: boolean }) {
  const id = useId()
  return (
    <label htmlFor={id} className={cn('flex min-h-12 items-start gap-3 py-3', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <span className="relative mt-0.5 inline-flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          className="peer size-5 appearance-none rounded-md border-2 border-line-strong bg-surface transition-colors checked:border-navy-900 checked:bg-navy-900 hover:border-navy-400 disabled:border-line disabled:bg-sunken disabled:checked:bg-ink-disabled disabled:checked:border-ink-disabled"
        />
        <Check size={14} strokeWidth={3} className="pointer-events-none absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className={cn('text-body', disabled ? 'text-ink-disabled' : 'text-ink')}>{label}</span>
        {description && <span className="text-body-sm text-ink-muted">{description}</span>}
      </span>
    </label>
  )
}

export function RadioGroup({ legend, options, defaultValue, name }: { legend: string; options: Array<{ value: string; label: string; description?: string }>; defaultValue?: string; name: string }) {
  return (
    <fieldset>
      <legend className="mb-1 text-body-sm font-semibold text-ink">{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className="flex min-h-12 cursor-pointer items-start gap-3 py-3">
          <span className="relative mt-0.5 inline-flex size-5 shrink-0">
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={o.value === defaultValue}
              className="peer size-5 appearance-none rounded-full border-2 border-line-strong bg-surface transition-colors checked:border-navy-900 hover:border-navy-400"
            />
            <span className="pointer-events-none absolute inset-0 m-auto size-2.5 scale-0 rounded-full bg-navy-900 transition-transform peer-checked:scale-100" aria-hidden />
          </span>
          <span className="flex flex-col">
            <span className="text-body text-ink">{o.label}</span>
            {o.description && <span className="text-body-sm text-ink-muted">{o.description}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  )
}

export function Switch({ label, description, defaultOn = false, disabled }: { label: string; description?: string; defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  const id = useId()
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 py-2">
      <label htmlFor={id} className={cn('flex flex-col', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <span className={cn('text-body', disabled ? 'text-ink-disabled' : 'text-ink')}>{label}</span>
        {description && <span className="text-body-sm text-ink-muted">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={() => setOn((v) => !v)}
        className="group relative inline-flex h-12 w-14 shrink-0 items-center justify-center disabled:cursor-not-allowed"
      >
        <span className={cn('h-7 w-12 rounded-full transition-colors duration-200', on ? 'bg-navy-900' : 'bg-line-strong', disabled && 'opacity-50')} />
        <span
          className={cn(
            'absolute left-2 top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-e1 transition-transform duration-200',
            on && 'translate-x-5',
            disabled && 'opacity-80',
          )}
        />
      </button>
    </div>
  )
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = (v: number) => String(v),
  disabled,
}: {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  disabled?: boolean
}) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-body-sm font-semibold text-ink">
          {label}
        </label>
        <output htmlFor={id} className="text-subheading tabular-nums text-navy-900">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ge-range"
        style={{ ['--fill' as string]: `${fill}%` }}
      />
      <div className="-mt-2 flex justify-between text-caption tabular-nums text-ink-muted">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  fullWidth,
}: {
  label: string
  options: Array<{ value: T; label: string; icon?: LucideIcon }>
  value: T
  onChange: (v: T) => void
  fullWidth?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex h-12 max-w-full overflow-x-auto rounded-xl bg-sunken p-1', fullWidth && 'flex w-full')}>
      {options.map((o) => {
        const active = o.value === value
        const Icon = o.icon
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 text-body-sm font-semibold transition-colors duration-200',
              active ? 'bg-surface text-navy-900 shadow-e1' : 'text-ink-muted hover:text-ink',
            )}
          >
            {Icon && <Icon size={16} strokeWidth={1.75} aria-hidden />}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
