'use client'

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
import { formatDate } from '@/lib/utils'
import { useBranding } from '@/components/brand/brand-provider'
import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'
import { LearnersByClassChart } from './components/learners-by-class-chart'
import type { ClassLearnerCount } from '@/lib/admin.server'

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
  const branding = useBranding()

  if (!overview) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        Could not load admin overview. Check that the API is reachable.
      </div>
    )
  }

  const revenueDelta =
    overview.revenue_last_month > 0
      ? ((overview.revenue_this_month - overview.revenue_last_month) /
          overview.revenue_last_month) *
        100
      : 0

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
          value={`$${overview.revenue_this_month.toFixed(2)}`}
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
          <CompactStat
            icon={Users}
            label="Admins"
            value={overview.users_by_role.admin ?? 0}
          />
          <CompactStat
            icon={GraduationCap}
            label="Teachers"
            value={overview.users_by_role.teacher ?? 0}
          />
          <CompactStat
            icon={Users}
            label="Learners"
            value={
              (overview.users_by_role.learner ?? 0) +
              (overview.users_by_role.external ?? 0)
            }
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
                const name =
                  [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
                return (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        tone={
                          u.role === 'admin'
                            ? 'info'
                            : u.role === 'teacher'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {u.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(u.created_at)}
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
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {p.user_email ?? `User #${p.user_id}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.payment_method ?? 'unknown'} ·{' '}
                      {p.transaction_id?.slice(0, 12) ?? 'no txn id'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-semibold">
                      ${(p.amount ?? 0).toFixed(2)}
                    </span>
                    <Badge
                      tone={
                        p.status === 'completed'
                          ? 'success'
                          : p.status === 'failed'
                            ? 'danger'
                            : 'warning'
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

        <section className="rounded-xl border border-border bg-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold">Recent activity</h3>
              <p className="text-xs text-muted-foreground">
                Latest actions across the platform
              </p>
            </div>
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-brand-accent hover:text-foreground"
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
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${branding.colorAccent}20` }}
                    >
                      <Activity size={14} style={{ color: branding.colorAccent }} />
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
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({
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
  tone?: 'default' | 'primary' | 'accent' | 'success' | 'info'
}) {
  const tones = {
    default: { bg: 'bg-muted', fg: 'text-muted-foreground' },
    primary: { bg: 'bg-brand-primary/10', fg: 'text-brand-primary' },
    accent: { bg: 'bg-brand-accent/10', fg: 'text-brand-accent' },
    success: { bg: 'bg-green-100', fg: 'text-green-700' },
    info: { bg: 'bg-blue-100', fg: 'text-blue-700' },
  }
  const t = tones[tone]

  const hintColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    danger: 'text-red-600',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${t.bg}`}>
          <Icon size={18} className={t.fg} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold">{value}</p>
        {hint && (
          <p
            className={`mt-1 flex items-center gap-1 text-xs ${hintColors[hintTone]}`}
          >
            {HintIcon && <HintIcon size={12} />}
            {hint}
          </p>
        )}
      </div>
    </div>
  )
}

function CompactStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Icon size={16} className="text-brand-accent" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="px-5 py-2">{children}</div>
    </section>
  )
}