import 'server-only'
import { serverApiRequest } from './server-api'
import { getTeacherOverviewClient } from './analytics.client'
import type { Lesson } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'

export interface TeacherDashboardData {
  totalLessons: number
  totalQuizzes: number
  totalStudents: number
  averageScore: number
  recentLessons: Lesson[]
  recentQuizzes: Quiz[]
}

interface ClassLearnerCount {
  class_id: number
  class_name: string
  learner_count: number
}

function extractTotal(raw: unknown): number {
  if (Array.isArray(raw)) return raw.length
  if (!raw || typeof raw !== 'object') return 0
  const r = raw as Record<string, unknown>
  const meta = (r.meta ?? {}) as Record<string, unknown>
  const candidate = (meta.total as number) ?? (r.total as number)
  if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
  if (Array.isArray(r.data)) return r.data.length
  if (Array.isArray(r.value)) return r.value.length
  return 0
}

function getItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (!raw || typeof raw !== 'object') return []
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  if (Array.isArray(r.value)) return r.value as T[]
  return []
}

export async function getTeacherDashboardDataServer(teacherId: number): Promise<TeacherDashboardData> {
  const [lessonsRaw, quizzesRaw, learnerCountsRaw, overview] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=1000').catch(() => null),
    serverApiRequest<unknown>('/api/v1/quizzes?per_page=1000').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
    getTeacherOverviewClient(teacherId).catch(() => null),
  ])

  const totalLessons = extractTotal(lessonsRaw)
  const totalQuizzes = extractTotal(quizzesRaw)
  const quizzes = getItems<Quiz>(quizzesRaw)
  
  const totalStudents = overview?.total_students ?? (Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0)

  const averageScore = overview?.average_score ?? 0

  return {
    totalLessons,
    totalQuizzes,
    totalStudents,
    averageScore,
    recentLessons: getItems<Lesson>(lessonsRaw).slice(0, 4),
    recentQuizzes: quizzes.slice(0, 4),
  }
}

export async function getTeacherCountsServer(): Promise<{ totalLessons: number; totalStudents: number }> {
  const [lessonsRaw, learnerCountsRaw] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=1000').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
  ])

  const totalLessons = extractTotal(lessonsRaw)
  const totalStudents = Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0

  return { totalLessons, totalStudents }
}