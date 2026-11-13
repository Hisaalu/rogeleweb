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

const TONES = {
  default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
  primary: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
  accent: { bg: 'bg-brand-accent/10', fg: 'text-brand-accent' },
  success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
  info: { bg: 'bg-blue-500/10 dark:bg-blue-400/10', fg: 'text-blue-600 dark:text-blue-400' },
  danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg' },
} as const

const HINT_COLORS = {
  default: 'text-muted-foreground',
  success: 'text-success-fg',
  danger: 'text-danger-fg',
} as const

export function KpiCards({ data }: { data: AnalyticsData }) {
  const totalUsers = data.atRisk?.summary.total ?? 0
  const activeUsers = data.atRisk?.summary.healthy ?? 0
  const avgScore = data.scores?.average ?? 0
  const revenue = data.revenue?.total ?? 0
  const monthlyAvg = data.revenue?.points.length ? revenue / data.revenue.points.length : 0

  const atRisk = data.atRisk?.summary.at_risk ?? 0
  const watch = data.atRisk?.summary.watch ?? 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Kpi
        icon={Users}
        label="Total learners"
        value={String(totalUsers)}
        hint={`${activeUsers} healthy`}
        hintTone={activeUsers > 0 ? 'success' : 'danger'}
      />
      <Kpi
        icon={DollarSign}
        label="Total revenue"
        value={currencyFormatter.format(revenue)}
        hint={
          monthlyAvg > 0
            ? `${currencyFormatter.format(monthlyAvg)} avg / period`
            : 'No revenue yet'
        }
        hintIcon={revenue > 0 ? TrendingUp : TrendingDown}
        hintTone={revenue > 0 ? 'success' : 'danger'}
      />
      <Kpi
        icon={HelpCircle}
        label="Average score"
        value={`${avgScore.toFixed(1)}%`}
        hint={`${data.scores?.passing_pct.toFixed(0) ?? 0}% passing rate`}
        hintTone={avgScore > 50 ? 'success' : 'danger'}
      />
      <Kpi
        icon={UserPlus}
        label="Risk flags"
        value={String(atRisk + watch)}
        hint={`${atRisk} at risk · ${watch} to watch`}
        hintTone={atRisk === 0 ? 'success' : 'danger'}
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
  icon: React.ElementType
  label: string
  value: string
  hint?: string
  hintIcon?: React.ElementType
  hintTone?: keyof typeof HINT_COLORS
  tone?: keyof typeof TONES
}) {
  const t = TONES[tone]
  const hintColor = HINT_COLORS[hintTone]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${t.bg}`}
        >
          <Icon size={16} className={`sm:hidden ${t.fg}`} />
          <Icon size={18} className={`hidden sm:block ${t.fg}`} />
        </div>
        <p className="mt-3 truncate text-xs text-muted-foreground sm:mt-4 sm:text-sm">
          {label}
        </p>
        <p className="mt-1 truncate text-xl font-bold tabular-nums sm:text-2xl">
          {value}
        </p>
        {hint && (
          <p
            className={`mt-1 flex items-center gap-1 text-[11px] sm:text-xs ${hintColor}`}
          >
            {HintIcon && <HintIcon size={12} className="shrink-0" />}
            <span className="truncate">{hint}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}