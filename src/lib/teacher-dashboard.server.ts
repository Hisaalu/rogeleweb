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

export interface TeacherCounts {
  totalLessons: number
  totalStudents: number
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
  const candidate = 
    (meta.total as number) ?? 
    (meta.total_count as number) ?? 
    (meta.count as number) ?? 
    (r.total as number)
    
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate
  }

  if (Array.isArray(r.data)) return r.data.length
  if (Array.isArray(r.value)) return r.value.length
  
  return 0
}

export async function getTeacherCountsServer(): Promise<TeacherCounts> {
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

export async function getTeacherDashboardDataServer(): Promise<TeacherDashboardData> {
  const [lessonsRaw, quizzesRaw, learnerCountsRaw, scoresRes] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=1000').catch(() => null),
    serverApiRequest<unknown>('/api/v1/quizzes?per_page=1000').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
    fetch(process.env.ANALYTICS_API_URL ?? 'http://localhost:9000/analytics/score-distribution', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null) as Promise<{ average: number | null } | null>,
  ])

  const totalLessons = extractTotal(lessonsRaw)
  const totalQuizzes = extractTotal(quizzesRaw)
  
  const totalStudents = Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0

  const averageScore = scoresRes && Number.isFinite(scoresRes.average) ? (scoresRes.average as number) : 0

  const getItems = <T>(raw: unknown): T[] => {
    if (Array.isArray(raw)) return raw as T[]
    if (!raw || typeof raw !== 'object') return []
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data)) return r.data as T[]
    if (Array.isArray(r.value)) return r.value as T[]
    return []
  }

  return {
    totalLessons,
    totalQuizzes,
    totalStudents,
    averageScore,
    recentLessons: getItems<Lesson>(lessonsRaw).slice(0, 4),
    recentQuizzes: getItems<Quiz>(quizzesRaw).slice(0, 4),
  }
}