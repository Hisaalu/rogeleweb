'use client'

import { DollarSign, HelpCircle, TrendingDown, TrendingUp, UserPlus, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AnalyticsData } from '../analytics-view'

export function KpiCards({ data }: { data: AnalyticsData }) {
  const totalUsers = data.atRisk?.summary.total ?? 0
  const activeUsers = data.atRisk?.summary.healthy ?? 0
  const avgScore = data.scores?.average ?? 0
  const revenue = data.revenue?.total ?? 0
  const monthlyAvg = data.revenue?.points.length
    ? revenue / data.revenue.points.length
    : 0

  const atRisk = data.atRisk?.summary.at_risk ?? 0
  const watch = data.atRisk?.summary.watch ?? 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi
        icon={Users}
        label="Total learners"
        value={String(totalUsers)}
        hint={`${activeUsers} healthy`}
        tone="primary"
      />
      <Kpi
        icon={DollarSign}
        label="Total revenue"
        value={`$${revenue.toFixed(2)}`}
        hint={monthlyAvg > 0 ? `$${monthlyAvg.toFixed(2)} avg / period` : 'No revenue yet'}
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
  icon: typeof Users
  label: string
  value: string
  hint?: string
  hintIcon?: typeof Users
  hintTone?: 'default' | 'success' | 'danger'
  tone?: 'default' | 'primary' | 'accent' | 'success' | 'info' | 'danger'
}) {
  const toneMap = {
    default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
    primary: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
    accent: { bg: 'bg-brand-accent/10', fg: 'text-brand-accent' },
    success: { bg: 'bg-green-100', fg: 'text-green-700' },
    info: { bg: 'bg-blue-100', fg: 'text-blue-700' },
    danger: { bg: 'bg-red-100', fg: 'text-red-700' },
  }
  const t = toneMap[tone]
  const hintColor = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    danger: 'text-red-600',
  }[hintTone]

  return (
    <Card>
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