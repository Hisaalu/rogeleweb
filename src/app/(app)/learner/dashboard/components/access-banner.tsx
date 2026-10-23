'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, AlertCircle, Crown } from 'lucide-react'

type Variant = 'active' | 'trial' | 'expired'

const CONFIG = {
  active: {
    bg: 'var(--success-bg)',
    border: 'var(--success-border)',
    fg: 'var(--success-fg)',
    accent: 'var(--success-accent)',
    icon: CheckCircle2,
    iconColor: 'var(--success-border)',
    buttonBg: 'var(--success-border)', 
  },
  trial: {
    bg: 'var(--warning-bg)',
    border: 'var(--warning-border)',
    fg: 'var(--warning-fg)',
    accent: 'var(--warning-accent)',
    icon: Clock,
    iconColor: 'var(--warning-border)',
    buttonBg: 'var(--brand-accent)', 
  },
  expired: {
    bg: 'var(--danger-bg)',
    border: 'var(--danger-border)',
    fg: 'var(--danger-fg)',
    accent: 'var(--danger-accent)',
    icon: AlertCircle,
    iconColor: 'var(--danger-border)',
    buttonBg: 'var(--success-border)', 
  },
} as const

export function AccessBanner({
  variant,
  title,
  description,
  endDate,
  actionLabel,
  actionHref,
  showCrown,
  isPro,
}: {
  variant: Variant
  title: string
  description: string
  endDate?: string | null
  actionLabel: string
  actionHref: string
  showCrown?: boolean
  isPro?: boolean
}) {
  const c = CONFIG[variant]
  const Icon = c.icon

  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-xl border-l-4 p-5"
      style={{ backgroundColor: c.bg, borderLeftColor: c.border }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: c.iconColor }}
      >
        <Icon size={22} className="text-white" />
      </div>

      <div className="min-w-[200px] flex-1">
        <p className="font-semibold" style={{ color: c.fg }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: c.accent }}>
          {description}
        </p>
        {endDate && (
          <p className="mt-0.5 text-xs" style={{ color: c.accent }}>
            Valid until:{' '}
            {new Date(endDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      <Link
        href={actionHref}
        className="flex shrink-0 items-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--success-border)' }}
      >
        {showCrown && <Crown size={14} className="shrink-0" />}
        {actionLabel}
      </Link>
    </div>
  )
}