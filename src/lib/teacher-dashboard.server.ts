import 'server-only'
import { serverApiRequest } from './server-api'
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

interface Extracted<T> {
  items: T[]
  total: number
}

function extract<T>(raw: unknown): Extracted<T> {
  if (Array.isArray(raw)) {
    return { items: raw as T[], total: raw.length }
  }
  if (!raw || typeof raw !== 'object') {
    return { items: [], total: 0 }
  }
  const r = raw as Record<string, unknown>
  const items = Array.isArray(r.data)
    ? (r.data as T[])
    : Array.isArray(r.value)
      ? (r.value as T[])
      : []
  const meta = (r.meta ?? {}) as Record<string, unknown>
  const candidate =
    (meta.total as number | undefined) ??
    (meta.total_count as number | undefined) ??
    (meta.count as number | undefined) ??
    (r.total as number | undefined)
  const total =
    typeof candidate === 'number' && Number.isFinite(candidate)
      ? candidate
      : items.length
  return { items, total }
}

const PYTHON_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function fetchPython<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  const search = new URLSearchParams(params).toString()
  const url = `${PYTHON_URL}/analytics/${endpoint}${search ? `?${search}` : ''}`
  try {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function getTeacherDashboardDataServer(): Promise<TeacherDashboardData> {
  const [lessonsRaw, quizzesRaw, learnerCountsRaw, scoresRes] =
    await Promise.all([
      serverApiRequest<unknown>('/api/v1/lessons?per_page=100').catch(
        () => null,
      ),
      serverApiRequest<unknown>('/api/v1/quizzes?per_page=100').catch(
        () => null,
      ),
      serverApiRequest<ClassLearnerCount[]>(
        '/api/v1/admin/learners-by-class',
      ).catch(() => null),
      fetchPython<{ average: number | null }>('score-distribution'),
    ])

  const lessons = extract<Lesson>(lessonsRaw)
  const quizzes = extract<Quiz>(quizzesRaw)

  const totalStudents = Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0

  const averageScore =
    scoresRes && Number.isFinite(scoresRes.average)
      ? (scoresRes.average as number)
      : 0

  return {
    totalLessons: lessons.total,
    totalQuizzes: quizzes.total,
    totalStudents,
    averageScore,
    recentLessons: lessons.items.slice(0, 4),
    recentQuizzes: quizzes.items.slice(0, 4),
  }
}