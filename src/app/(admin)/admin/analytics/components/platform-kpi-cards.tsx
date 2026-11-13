'use client'

import React from 'react'
import Link from 'next/link'
import {
  Users,
  GraduationCap,
  UserCog,
  Shield,
  School,
  BookOpen,
  FileText,
  HelpCircle,
  ClipboardList,
  DollarSign,
  CreditCard,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AdminOverview } from '@/types/admin'
import type { AnalyticsData } from '../analytics-view'

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})

type Tone = 'default' | 'primary' | 'accent' | 'success' | 'danger' | 'warning'

const TONES: Record<Tone, { bg: string; fg: string }> = {
  default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
  primary: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
  accent: { bg: 'bg-brand-accent/10', fg: 'text-brand-accent' },
  success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
  danger: { bg: 'bg-danger-bg', fg: 'text-danger-fg' },
  warning: { bg: 'bg-warning-bg', fg: 'text-warning-fg' },
}

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'default',
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  hint?: string
  tone?: Tone
  href?: string
}) {
  const t = TONES[tone]

  const content = (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md ${t.bg}`}>
            <Icon size={16} className={t.fg} aria-hidden />
          </div>
          <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground sm:text-xs">
            {label}
          </p>
        </div>
        <p className="mt-2 truncate text-xl font-bold tabular-nums sm:text-2xl">
          {value}
        </p>
        {hint && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      >
        {content}
      </Link>
    )
  }
  return content
}

export function PlatformKpiCards({
  overview,
  data,
}: {
  overview: AdminOverview | null
  data: AnalyticsData
}) {
  const totalUsers = overview?.total_users ?? 0
  const byRole = overview?.users_by_role ?? {}
  const learners = (byRole.learner ?? 0) + (byRole.external ?? 0)
  const teachers = byRole.teacher ?? 0
  const admins = byRole.admin ?? 0
  const newUsers = overview?.new_users_last_30_days ?? 0

  const classes = overview?.total_classes ?? 0
  const subjects = overview?.total_subjects ?? 0
  const lessons = overview?.total_lessons ?? 0
  const homework = overview?.total_homework ?? 0
  const quizzes = overview?.total_quizzes ?? 0

  const activeSubs = overview?.active_subscriptions ?? 0
  const activeTrials = overview?.active_trials ?? 0
  const revenueRange = data.revenue?.total ?? 0
  const payments = overview?.total_payments ?? 0

  const atRisk = data.atRisk?.summary.at_risk ?? 0
  const watch = data.atRisk?.summary.watch ?? 0

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      <KpiCard
        icon={Users}
        label="Total users"
        value={String(totalUsers)}
        hint={`${newUsers} new in last 30 days`}
        tone="primary"
        href="/admin/users"
      />
      <KpiCard
        icon={GraduationCap}
        label="Learners"
        value={String(learners)}
        hint={`${teachers} teachers · ${admins} admins`}
        tone="accent"
        href="/admin/users?role=learner"
      />
      <KpiCard
        icon={DollarSign}
        label="Revenue (range)"
        value={currencyFormatter.format(revenueRange)}
        hint={`${payments} total payments`}
        tone="success"
        href="/admin/payments"
      />
      <KpiCard
        icon={CreditCard}
        label="Subscriptions"
        value={String(activeSubs)}
        hint={`${activeTrials} active trials`}
        tone="accent"
        href="/admin/subscriptions"
      />

      <KpiCard icon={School} label="Classes" value={String(classes)} tone="default" href="/admin/classes" />
      <KpiCard icon={BookOpen} label="Subjects" value={String(subjects)} tone="default" href="/admin/subjects" />
      <KpiCard icon={FileText} label="Lessons" value={String(lessons)} tone="default" href="/admin/lessons" />
      <KpiCard icon={HelpCircle} label="Quizzes" value={String(quizzes)} tone="default" href="/admin/quizzes" />

      <KpiCard icon={ClipboardList} label="Homework" value={String(homework)} tone="default" href="/admin/homework" />
      <KpiCard icon={UserCog} label="Teachers" value={String(teachers)} tone="default" href="/admin/users?role=teacher" />
      <KpiCard icon={Shield} label="Admins" value={String(admins)} tone="default" href="/admin/users?role=admin" />
      <KpiCard
        icon={AlertTriangle}
        label="Risk flags"
        value={String(atRisk + watch)}
        hint={`${atRisk} at risk · ${watch} to watch`}
        tone={atRisk > 0 ? 'danger' : 'success'}
        href="/admin/analytics?tab=risk"
      />
    </div>
  )
}