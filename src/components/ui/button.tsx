'use client'

import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--brand-primary)] text-white shadow-sm hover:opacity-90 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
  secondary: 
    'bg-[var(--brand-accent)] text-white shadow-sm hover:opacity-90',
  outline: 
    'border border-border bg-background hover:bg-muted text-foreground',
  ghost: 
    'hover:bg-muted text-foreground',
  danger: 
    'bg-[var(--danger-border)] text-white shadow-sm hover:opacity-90',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-6 text-base',
  icon: 'h-9 w-9',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60', 
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'