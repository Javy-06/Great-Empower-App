
import { cn } from '@/lib/cn'

type LogoTone = 'navy' | 'white'
type LogoSize = 'sm' | 'md' | 'lg'

interface LogoMarkProps {
  size?: number
  tone?: LogoTone
  className?: string
}

interface LogoProps {
  tone?: LogoTone
  size?: LogoSize
  className?: string
}

/**
 * GREAT EMPOWER Lion Mark
 * Used when only the lion symbol is required.
 */
export function LogoMark({
  size = 32,
  tone: _tone = 'navy',
  className,
}: LogoMarkProps) {
  return (
    <img
      src="/images/great-empower-lion.png"
      alt="GREAT EMPOWER"
      width={size}
      height={size}
      className={cn(
        'shrink-0 object-contain',
        className
      )}
    />
  )
}

/**
 * GREAT EMPOWER Full Horizontal Logo
 * Includes the lion, wordmark and tagline.
 */
export function Logo({
  tone = 'navy',
  size = 'md',
  className,
}: LogoProps) {
  const width = {
    sm: 160,
    md: 220,
    lg: 300,
  }[size]

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center',
        className
      )}
    >
      <img
        src={tone === 'white'
          ? '/images/great-empower-horizontal-white.png'
          : '/images/great-empower-horizontal.png'}
        alt="GREAT EMPOWER — Empowering You to Protect Your Tomorrow"
        width={width}
        className="block h-auto max-w-full object-contain"
      />
    </span>
  )
}
