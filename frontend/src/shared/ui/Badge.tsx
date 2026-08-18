import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'red' | 'blue' | 'slate' | 'default'
export type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  children: ReactNode
  className?: string
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  red: 'text-red-500 bg-red-50',
  blue: 'text-blue-500 bg-blue-50',
  slate: 'text-slate-500 bg-slate-100',
  default: 'text-slate-600 bg-slate-100',
}

const SIZE_STYLES: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center font-bold tabular-nums rounded-full transition-colors ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
