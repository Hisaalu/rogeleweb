'use client'

import { DollarSign, HelpCircle, TrendingDown, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AnalyticsData } from '../analytics-view'

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

export function KpiCards({ data }: { data: AnalyticsData }) {
  const totalUsers = data.atRisk?.summary.total ?? 0
  const activeUsers = data.atRisk?.summary.healthy ?? 0
  const avgScore = data.scores?.average ?? 0
  const revenue = data.revenue?.total ?? 0
  const monthlyAvg = data.revenue?.points.length ? revenue / data.revenue.points.length : 0

  const atRisk = data.atRisk?.summary.at_risk ?? 0
  const watch = data.atRisk?.summary.watch ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={Users} label="Total learners" value={String(totalUsers)} hint={`${activeUsers} healthy`} tone="primary" />
      <Kpi
        icon={DollarSign}
        label="Total revenue"
        value={currencyFormatter.format(revenue)}
        hint={monthlyAvg > 0 ? `${currencyFormatter.format(monthlyAvg)} avg / period` : 'No revenue yet'}
        tone="accent"
        hintIcon={revenue > 0 ? TrendingUp : TrendingDown}
        hintTone={revenue > 0 ? 'success' : 'danger'}
      />
      <Kpi
        icon={HelpCircle}
        label="Average score"
        value={`${avgScore.toFixed(1)}%`}
        hint={`${data.scores?.passing_pct.toFixed(0) ?? 0}% passing rate`}
        tone="info"
      />
      <Kpi
        icon={UserPlus}
        label="Risk flags"
        value={String(atRisk + watch)}
        hint={`${atRisk} at risk · ${watch} to watch`}
        tone={atRisk > 0 ? 'danger' : 'success'}
      />
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  hintIcon: HintIcon,
  hintTone = 'default',
  tone = 'default',
}: {
  icon: any
  label: string
  value: string
  hint?: string
  hintIcon?: any
  hintTone?: 'default' | 'success' | 'danger'
  tone?: 'default' | 'primary' | 'accent' | 'success' | 'info' | 'danger'
}) {
  const toneMap = {
    default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
    primary: { bg: 'bg-[var(--brand-primary)]/10', fg: 'text-[var(--brand-primary)]' },
    accent: { bg: 'bg-[var(--brand-accent)]/10', fg: 'text-[var(--brand-accent)]' },
    success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
    info: { bg: 'bg-blue-500/10 dark:bg-blue-400/10', fg: 'text-blue-600 dark:text-blue-400' },
    danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg' },
  }
  const t = toneMap[tone]
  const hintColor = {
    default: 'text-muted-foreground',
    success: 'text-success-fg',
    danger: 'text-danger-fg',
  }[hintTone]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.bg}`}>
          <Icon size={18} className={t.fg} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {hint && (
          <p className={`mt-1 flex items-center gap-1 text-xs ${hintColor}`}>
            {HintIcon && <HintIcon size={12} />}
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )
}