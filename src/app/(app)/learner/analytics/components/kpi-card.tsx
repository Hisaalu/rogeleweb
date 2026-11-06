'use client'

import React from 'react'
import { Card } from '@/components/ui/card'

const TONE_MAP = {
  default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
  success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
  danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg' },
  info: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
} as const

export const KpiCard = React.memo(function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon?: React.ElementType
  label: string
  value: string
  hint?: string
  tone?: keyof typeof TONE_MAP
}) {
  const t = TONE_MAP[tone]
  return (
    <Card className="p-4 shadow-sm sm:p-5">
      {Icon && (
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${t.bg} sm:h-10 sm:w-10`}>
          <Icon size={16} className={`${t.fg} sm:hidden`} />
          <Icon size={18} className={`${t.fg} hidden sm:block`} />
        </div>
      )}
      <p className={`text-xs text-muted-foreground sm:text-sm ${Icon ? 'mt-3 sm:mt-4' : ''}`}>{label}</p>
      <p className="mt-1 text-xl font-bold sm:text-2xl">{value}</p>
      {hint && <p className={`mt-1 text-[11px] sm:text-xs ${t.fg}`}>{hint}</p>}
    </Card>
  )
})