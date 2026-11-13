'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardList,
  DollarSign,
  GraduationCap,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useBranding } from '@/components/brand/brand-provider'
import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'
import type { ClassLearnerCount } from '@/lib/admin.server'
import { LearnersByClassChart } from './components/learners-by-class-chart'

const currencyFormatter = new Intl.NumberFormat('en-UG', {
  style: 'currency',
  currency: 'UGX',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
})
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime()) ? '—' : dateFormatter.format(d)
}

const STAT_TONES = {
  default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
  primary: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
  accent: { bg: 'bg-brand-accent/10', fg: 'text-brand-accent' },
  success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
  info: { bg: 'bg-blue-500/10 dark:bg-blue-400/10', fg: 'text-blue-600 dark:text-blue-400' },
} as const

const HINT_COLORS = {
  default: 'text-muted-foreground',
  success: 'text-success-fg',
  danger: 'text-danger-fg',
} as const

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  hintIcon: HintIcon,
  hintTone = 'default',
  tone = 'default',
  href,
}: {
  icon: React.ElementType
  label: string
  value: string
  hint?: string
  hintIcon?: React.ElementType
  hintTone?: keyof typeof HINT_COLORS
  tone?: keyof typeof STAT_TONES
  href?: string
}) {
  const t = STAT_TONES[tone]

  const content = (
    <Card className="h-full transition-all hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${t.bg}`}>
          <Icon size={16} className={`sm:hidden ${t.fg}`} />
          <Icon size={18} className={`hidden sm:block ${t.fg}`} />
        </div>
        <div className="mt-3 sm:mt-4">
          <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
          {hint && (
            <p className={`mt-1 flex items-center gap-1 text-[11px] sm:text-xs ${HINT_COLORS[hintTone]}`}>
              {HintIcon && <HintIcon size={12} className="shrink-0" />}
              <span className="truncate">{hint}</span>
            </p>
          )}
        </div>
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

function CompactStat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType
  label: string
  value: number
  href?: string
}) {
  const content = (
    <Card className="h-full transition-all hover:shadow-md">
      <CardContent className="flex items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-9 sm:w-9">
          <Icon size={14} className="text-brand-accent sm:hidden" />
          <Icon size={16} className="hidden text-brand-accent sm:block" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{label}</p>
          <p className="text-sm font-semibold tabular-nums sm:text-base">{value}</p>
        </div>
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

export function AdminDashboardView({
  overview,
  signups,
  payments,
  activity,
  learnersByClass,
  siteTitle,
}: {
  overview: AdminOverview | null
  signups: AdminUserSummary[]
  payments: AdminPaymentSummary[]
  activity: AdminActivityItem[]
  learnersByClass: ClassLearnerCount[]
  siteTitle?: string
}) {
  const branding = useBranding()
  const displayTitle = siteTitle || branding.schoolName

  const revenueDelta = useMemo(() => {
    if (!overview || overview.revenue_last_month <= 0) return 0
    return ((overview.revenue_this_month - overview.revenue_last_month) / overview.revenue_last_month) * 100
  }, [overview])

  if (!overview) {
    return (
      <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
        Could not load admin overview. Check that the API is reachable.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A quick summary of {displayTitle}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={String(overview.total_users)}
          hint={`${overview.new_users_last_30_days} new in last 30 days`}
          hintTone={overview.new_users_last_30_days >= 5 ? 'success' : 'danger'}
          tone="accent"
          href="/admin/users"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue this month"
          value={currencyFormatter.format(overview.revenue_this_month)}
          hint={
            revenueDelta >= 0
              ? `+${revenueDelta.toFixed(1)}% vs last month`
              : `${revenueDelta.toFixed(1)}% vs last month`
          }
          hintIcon={revenueDelta > 0 ? TrendingUp : TrendingDown}
          hintTone={revenueDelta > 0 ? 'success' : 'danger'}
          tone="accent"
          href="/admin/payments"
        />
        <StatCard
          icon={UserPlus}
          label="Active subscriptions"
          value={String(overview.active_subscriptions)}
          hint={`${overview.active_trials} trials in progress`}
          hintTone={overview.active_trials >= 5 ? 'success' : 'danger'}
          tone="accent"
          href="/admin/subscriptions"
        />
        <StatCard
          icon={Activity}
          label="Total payments"
          value={String(overview.total_payments)}
          hint={
            overview.payments_by_status.completed
              ? `${overview.payments_by_status.completed} completed`
              : 'No completed payments'
          }
          hintTone={overview.payments_by_status.completed >= 0 ? 'success' : 'danger'}
          tone="accent"
          href="/admin/payments"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Content overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <CompactStat icon={GraduationCap} label="Classes" value={overview.total_classes} href="/admin/classes" />
          <CompactStat icon={BookOpen} label="Subjects" value={overview.total_subjects} href="/admin/subjects" />
          <CompactStat icon={BookOpen} label="Lessons" value={overview.total_lessons} />
          <CompactStat icon={ClipboardList} label="Homework" value={overview.total_homework} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-4">
          <CompactStat icon={HelpCircle} label="Quizzes" value={overview.total_quizzes} />
          <CompactStat icon={Users} label="Admins" value={overview.users_by_role.admin ?? 0} href="/admin/users?role=admin" />
          <CompactStat icon={GraduationCap} label="Teachers" value={overview.users_by_role.teacher ?? 0} href="/admin/users?role=teacher" />
          <CompactStat
            icon={Users}
            label="Learners"
            value={(overview.users_by_role.learner ?? 0) + (overview.users_by_role.external ?? 0)}
            href="/admin/users?role=learner"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent signups</CardTitle>
            <CardDescription>Newest accounts</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:px-5">
            {signups.length === 0 ? (
              <div className="px-4 py-2 sm:px-0">
                <EmptyState
                  icon={UserPlus}
                  title="No signups yet"
                  description="New registrations will appear here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border px-4 sm:px-0">
                {signups.map((u) => {
                  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
                  return (
                    <li
                      key={u.id}
                      className="flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                        <Badge
                          tone={
                            u.role === 'admin' ? 'info' : u.role === 'teacher' ? 'warning' : 'default'
                          }
                        >
                          {u.role}
                        </Badge>
                        <span className="hidden whitespace-nowrap text-xs text-muted-foreground sm:inline">
                          {formatDate(u.created_at)}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>Newest transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:px-5">
            {payments.length === 0 ? (
              <div className="px-4 py-2 sm:px-0">
                <EmptyState
                  icon={DollarSign}
                  title="No payments yet"
                  description="Payment activity will appear here."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border px-4 sm:px-0">
                {payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex min-w-0 items-center justify-between gap-2 py-3 sm:gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {p.user_email ?? `User #${p.user_id}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.payment_method ?? 'unknown'} · {p.transaction_id?.slice(0, 12) ?? 'no txn id'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                      <span className="whitespace-nowrap text-sm font-semibold tabular-nums">
                        {currencyFormatter.format(p.amount ?? 0)}
                      </span>
                      <Badge
                        tone={
                          p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LearnersByClassChart data={learnersByClass} />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </div>
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand-accent hover:text-foreground"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="p-0 sm:px-5">
            {activity.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity yet"
                description="Actions by users will be logged here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {activity.slice(0, 5).map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
                      <Activity size={14} className="text-brand-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-medium">{a.action}</span>
                        {a.description ? ` — ${a.description}` : ''}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.user_email ?? 'system'} · {formatDate(a.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}