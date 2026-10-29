'use client'

import Link from 'next/link'
import {
  BookOpen,
  HelpCircle,
  Users,
  Activity,
  ArrowRight,
  PlusCircle,
  BarChart,
  Calendar,
  Eye,
  Clock,
  FileText,
} from 'lucide-react'
import type { User } from '@/types/api'
import type { TeacherDashboardData } from '@/lib/teacher-dashboard.server'
import { formatDate } from '@/lib/utils'

const iconAccent = { color: 'var(--brand-accent)' } as const
const iconSoftBg = {
  backgroundColor: 'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
} as const
const pillPublished = { backgroundColor: '#F0FDF4', color: '#166534' } as const
const pillDraft = {
  backgroundColor: 'hsl(var(--muted))',
  color: 'hsl(var(--muted-foreground))',
} as const

export function TeacherDashboardView({
  profile,
  data,
}: {
  profile: User | null
  data: TeacherDashboardData
}) {
  const firstName = profile?.first_name ?? 'Teacher'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10 sm:space-y-8">
      <div
        className="flex flex-col gap-4 rounded-2xl p-5 text-white shadow-lg sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:p-8"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <div className="min-w-0">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
            Welcome back, Tr.{' '}
            <span className="inline-block rounded-full bg-white/20 px-3 py-1">
              {firstName}
            </span>
            !
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Here&apos;s what&apos;s happening with your classes today
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-full bg-white/20 px-4 py-2.5 text-sm font-medium backdrop-blur-sm sm:self-auto sm:px-5 sm:py-3">
          <Calendar size={16} className="shrink-0 sm:hidden" />
          <Calendar size={18} className="hidden shrink-0 sm:block" />
          <span className="whitespace-nowrap">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Lessons" value={data.totalLessons} />
        <StatCard icon={HelpCircle} label="Total Quizzes" value={data.totalQuizzes} />
        <StatCard icon={Users} label="Total Students" value={data.totalStudents} />
        <StatCard icon={Activity} label="Avg. Score" value={`${Number.isFinite(data.averageScore) ? Math.round(data.averageScore) : 0}%`}/>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <ActionCard
            href="/teacher/lessons/create"
            icon={PlusCircle}
            title="Create New Lesson"
            description="Add new learning materials for your students"
          />
          <ActionCard
            href="/teacher/quizzes/create"
            icon={PlusCircle}
            title="Create New Quiz"
            description="Design a new quiz for your class"
          />
          <ActionCard
            href="/teacher/students"
            icon={Users}
            title="View Students"
            description="See all your students and their progress"
          />
          <ActionCard
            href="/teacher/analytics"
            icon={BarChart}
            title="Analytics"
            description="View detailed performance insights"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4">
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
              <BookOpen size={18} style={iconAccent} className="shrink-0" />
              <span className="truncate">Recent Lessons</span>
            </h3>
            <Link
              href="/teacher/lessons"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-brand-accent sm:text-sm"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            {data.recentLessons.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No lessons created yet"
                actionHref="/teacher/lessons/create"
                actionLabel="Create Your First Lesson"
              />
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.recentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-muted sm:gap-4 sm:p-3"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                      style={iconSoftBg}
                    >
                      <BookOpen size={18} style={iconAccent} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {lesson.title}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(lesson.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {lesson.views ?? 0} views
                        </span>
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs"
                      style={lesson.is_published ? pillPublished : pillDraft}
                    >
                      {lesson.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6 sm:py-4">
            <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
              <HelpCircle size={18} style={iconAccent} className="shrink-0" />
              <span className="truncate">Recent Quizzes</span>
            </h3>
            <Link
              href="/teacher/quizzes"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-brand-accent sm:text-sm"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-3 sm:p-4">
            {data.recentQuizzes.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No quizzes created yet"
                actionHref="/teacher/quizzes/create"
                actionLabel="Create Your First Quiz"
              />
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {data.recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex flex-col gap-2 rounded-xl p-2.5 transition hover:bg-muted sm:flex-row sm:items-center sm:gap-4 sm:p-3"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
                        style={iconSoftBg}
                      >
                        <HelpCircle size={18} style={iconAccent} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {quiz.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:gap-4">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(quiz.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            {quiz.attempt_count ?? 0} attempts
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/teacher/quizzes/${quiz.id}/results`}
                      className="shrink-0 self-end rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 sm:self-auto"
                      style={{ backgroundColor: 'var(--brand-accent)' }}
                    >
                      View Results
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: number | string
}) {
  const display =
    typeof value === 'number'
      ? value.toLocaleString('en-US')
      : value
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:shadow-lg sm:gap-5 sm:p-6">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-14 sm:w-14"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        <Icon size={20} className="sm:hidden" />
        <Icon size={24} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground sm:text-sm">{label}</p>
        <p className="truncate text-xl font-bold text-foreground sm:text-2xl">
          {display}
        </p>
      </div>
    </div>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: typeof BookOpen
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-brand-accent hover:shadow-md sm:gap-4 sm:p-5"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
        style={iconSoftBg}
      >
        <Icon size={18} style={iconAccent} className="sm:hidden" />
        <Icon size={20} style={iconAccent} className="hidden sm:block" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="hidden shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 sm:block"
        style={iconAccent}
      />
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  actionHref,
  actionLabel,
}: {
  icon: typeof BookOpen
  title: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center sm:py-10">
      <Icon
        size={40}
        style={iconAccent}
        className="mb-3 opacity-50"
      />
      <p className="mb-4 px-2 text-sm text-muted-foreground">{title}</p>
      <Link
        href={actionHref}
        className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        {actionLabel}
      </Link>
    </div>
  )
}