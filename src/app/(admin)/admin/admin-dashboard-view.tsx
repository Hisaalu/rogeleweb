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
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
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

const StatCard = React.memo(function StatCard({
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
  tone?: 'default' | 'primary' | 'accent' | 'success' | 'info'
}) {
  const tones = {
    default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
    primary: { bg: 'bg-[var(--brand-primary)]/10', fg: 'text-[var(--brand-primary)]' },
    accent: { bg: 'bg-[var(--brand-accent)]/10', fg: 'text-[var(--brand-accent)]' },
    success: { bg: 'bg-success-bg', fg: 'text-success-fg' },
    info: { bg: 'bg-blue-500/10 dark:bg-blue-400/10', fg: 'text-blue-600 dark:text-blue-400' },
  }
  const t = tones[tone]

  const hintColors = {
    default: 'text-muted-foreground',
    success: 'text-success-fg',
    danger: 'text-danger-fg',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.bg}`}>
          <Icon size={18} className={t.fg} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {hint && (
          <p className={`mt-1 flex items-center gap-1 text-xs ${hintColors[hintTone]}`}>
            {HintIcon && <HintIcon size={12} />}
            {hint}
          </p>
        )}
      </div>
    </div>
  )
})

const CompactStat = React.memo(function CompactStat({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon size={16} className="text-[var(--brand-accent)]" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  )
})

const Panel = React.memo(function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="px-5 py-2">{children}</div>
    </section>
  )
})

export function AdminDashboardView({
  overview,
  signups,
  payments,
  activity,
  learnersByClass,
}: {
  overview: AdminOverview | null
  signups: AdminUserSummary[]
  payments: AdminPaymentSummary[]
  activity: AdminActivityItem[]
  learnersByClass: ClassLearnerCount[]
}) {
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
        <h1 className="text-2xl font-bold sm:text-3xl">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform statistics and recent activity
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total users"
          value={String(overview.total_users)}
          hint={`${overview.new_users_last_30_days} new in last 30 days`}
          tone="primary"
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
          hintIcon={revenueDelta >= 0 ? TrendingUp : TrendingDown}
          hintTone={revenueDelta >= 0 ? 'success' : 'danger'}
          tone="accent"
        />
        <StatCard
          icon={UserPlus}
          label="Active subscriptions"
          value={String(overview.active_subscriptions)}
          hint={`${overview.active_trials} trials in progress`}
          tone="success"
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
          tone="info"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Content overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CompactStat icon={GraduationCap} label="Classes" value={overview.total_classes} />
          <CompactStat icon={BookOpen} label="Subjects" value={overview.total_subjects} />
          <CompactStat icon={BookOpen} label="Lessons" value={overview.total_lessons} />
          <CompactStat icon={ClipboardList} label="Homework" value={overview.total_homework} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CompactStat icon={HelpCircle} label="Quizzes" value={overview.total_quizzes} />
          <CompactStat icon={Users} label="Admins" value={overview.users_by_role.admin ?? 0} />
          <CompactStat icon={GraduationCap} label="Teachers" value={overview.users_by_role.teacher ?? 0} />
          <CompactStat
            icon={Users}
            label="Learners"
            value={(overview.users_by_role.learner ?? 0) + (overview.users_by_role.external ?? 0)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent signups" subtitle="Newest accounts">
          {signups.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No signups yet"
              description="New registrations will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {signups.map((u) => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
                return (
                  <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        tone={
                          u.role === 'admin' ? 'info' : u.role === 'teacher' ? 'warning' : 'default'
                        }
                      >
                        {u.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(u.created_at))}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Recent payments" subtitle="Newest transactions">
          {payments.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No payments yet"
              description="Payment activity will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.user_email ?? `User #${p.user_id}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.payment_method ?? 'unknown'} · {p.transaction_id?.slice(0, 12) ?? 'no txn id'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold">
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
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LearnersByClassChart data={learnersByClass} />

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <p className="text-xs text-muted-foreground">Latest actions across the platform</p>
            </div>
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-[var(--brand-accent)] hover:text-foreground"
            >
              View all
              <ArrowRight size={12} />
            </Link>
          </header>

          <div className="px-5 py-2">
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent)]/10">
                      <Activity size={14} className="text-[var(--brand-accent)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-medium">{a.action}</span>
                        {a.description ? ` — ${a.description}` : ''}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.user_email ?? 'system'} · {dateFormatter.format(new Date(a.created_at))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}