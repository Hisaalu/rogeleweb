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
import { useBranding } from '@/components/brand/brand-provider'
import type { User } from '@/types/api'
import type { TeacherDashboardData } from '@/lib/teacher-dashboard.server'
import { formatDate } from '@/lib/utils'

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
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      {/* Welcome Banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-6 rounded-2xl p-8 text-white shadow-lg"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
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
        <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-medium backdrop-blur-sm">
          <Calendar size={18} />
          <span>{today}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Lessons"
          value={data.totalLessons}
        />
        <StatCard
          icon={HelpCircle}
          label="Total Quizzes"
          value={data.totalQuizzes}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={data.totalStudents}
        />
        <StatCard
          icon={Activity}
          label="Avg. Score"
          value={`${data.averageScore}%`}
        />
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Lessons */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <BookOpen size={18} style={{ color: 'var(--brand-accent)' }} />
              Recent Lessons
            </h3>
            <Link
              href="/teacher/lessons"
              className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-brand-accent"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {data.recentLessons.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No lessons created yet"
                actionHref="/teacher/lessons/create"
                actionLabel="Create Your First Lesson"
              />
            ) : (
              <div className="space-y-2">
                {data.recentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      }}
                    >
                      <BookOpen size={18} style={{ color: 'var(--brand-accent)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {lesson.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
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
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={
                        lesson.is_published
                          ? { backgroundColor: '#F0FDF4', color: '#166534' }
                          : { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                      }
                    >
                      {lesson.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Quizzes */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <HelpCircle size={18} style={{ color: 'var(--brand-accent)' }} />
              Recent Quizzes
            </h3>
            <Link
              href="/teacher/quizzes"
              className="flex items-center gap-1 text-sm font-semibold text-muted-foreground transition hover:text-brand-accent"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {data.recentQuizzes.length === 0 ? (
              <EmptyState
                icon={HelpCircle}
                title="No quizzes created yet"
                actionHref="/teacher/quizzes/create"
                actionLabel="Create Your First Quiz"
              />
            ) : (
              <div className="space-y-2">
                {data.recentQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-4 rounded-xl p-3 transition hover:bg-muted"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor:
                          'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
                      }}
                    >
                      <HelpCircle size={18} style={{ color: 'var(--brand-accent)' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-semibold text-foreground">
                        {quiz.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
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
                    <Link
                      href={`/teacher/quizzes/${quiz.id}/results`}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
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

/* Helper Components */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
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
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand-accent hover:shadow-md"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor:
            'color-mix(in srgb, var(--brand-accent) 10%, transparent)',
        }}
      >
        <Icon size={20} style={{ color: 'var(--brand-accent)' }} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="shrink-0 text-muted-foreground opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
        style={{ color: 'var(--brand-accent)' }}
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
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon size={40} style={{ color: 'var(--brand-accent)' }} className="mb-3 opacity-50" />
      <p className="mb-4 text-sm text-muted-foreground">{title}</p>
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