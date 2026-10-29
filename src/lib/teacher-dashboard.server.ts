import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson } from '@/types/lesson'
import type { Quiz, QuizAttempt } from '@/types/quiz'

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

function getItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (!raw || typeof raw !== 'object') return []
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  if (Array.isArray(r.value)) return r.value as T[]
  return []
}

export async function getTeacherDashboardDataServer(): Promise<TeacherDashboardData> {
  const [lessonsRaw, quizzesRaw, learnerCountsRaw] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=1000').catch(() => null),
    serverApiRequest<unknown>('/api/v1/quizzes?per_page=1000').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
  ])

  const totalLessons = extractTotal(lessonsRaw)
  const totalQuizzes = extractTotal(quizzesRaw)
  const quizzes = getItems<Quiz>(quizzesRaw)
  
  const totalStudents = Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0

  const targetQuizzes = quizzes.slice(0, 10)
  
  const attemptPromises = targetQuizzes.map((q) =>
    serverApiRequest<unknown>(`/api/v1/quizzes/${q.id}/attempts`)
      .then((res) => getItems<QuizAttempt>(res))
      .catch(() => [] as QuizAttempt[])
  )
  
  const attemptsArrays = await Promise.all(attemptPromises)
  const allAttempts = attemptsArrays.flat()

  const validAttempts = allAttempts.filter(
    (a) => a.status === 'completed' && a.score != null
  )

  let totalPercentage = 0
  let validCount = 0

  for (const a of validAttempts) {
    let percentage = 0
    
    if (a.total_questions == null || a.total_questions === 0 || Number(a.score) > a.total_questions) {
      percentage = Number(a.score)
    } else {
      percentage = (Number(a.score) / Number(a.total_questions)) * 100
    }

    percentage = Math.max(0, Math.min(percentage, 100))
    
    totalPercentage += percentage
    validCount++
  }

  const averageScore = validCount > 0 ? Math.round(totalPercentage / validCount) : 0

  return {
    totalLessons,
    totalQuizzes,
    totalStudents,
    averageScore,
    recentLessons: getItems<Lesson>(lessonsRaw).slice(0, 4),
    recentQuizzes: quizzes.slice(0, 4),
  }
}

export interface TeacherCounts {
  totalLessons: number
  totalStudents: number
}

export async function getTeacherCountsServer(): Promise<TeacherCounts> {
  const [lessonsRaw, learnerCountsRaw] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=1').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
  ])

  const totalLessons = extractTotal(lessonsRaw)
  const totalStudents = Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0

  return { totalLessons, totalStudents }
}