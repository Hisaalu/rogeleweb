import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type Tone = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const tones: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}