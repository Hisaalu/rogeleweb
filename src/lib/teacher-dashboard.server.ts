import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'
import type { AdminOverview } from '@/types/admin'

export interface TeacherDashboardData {
  totalLessons: number
  totalQuizzes: number
  totalStudents: number
  averageScore: number
  recentLessons: Lesson[]
  recentQuizzes: Quiz[]
}

function parseList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  const r = (res ?? {}) as { data?: T[]; value?: T[] }
  if (Array.isArray(r.data)) return r.data
  if (Array.isArray(r.value)) return r.value
  return []
}

const PYTHON_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function fetchPython(endpoint: string, params: Record<string, string> = {}) {
  const search = new URLSearchParams(params).toString()
  const url = `${PYTHON_URL}/analytics/${endpoint}${search ? `?${search}` : ''}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function getTeacherDashboardDataServer(
  teacherId: number,
): Promise<TeacherDashboardData> {
  const [lessonsRes, quizzesRes, statsRes, scoresData] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?limit=5&per_page=5').catch(() => []),
    serverApiRequest<unknown>('/api/v1/quizzes?limit=5&per_page=5').catch(() => []),
    serverApiRequest<AdminOverview>('/api/v1/admin/stats').catch(() => null),
    fetchPython('score-distribution').catch(() => null),
  ])

  const lessons = parseList<Lesson>(lessonsRes)
  const quizzes = parseList<Quiz>(quizzesRes)
  
  let totalStudents = 0
  if (statsRes) {
    const learners = statsRes.users_by_role?.learner ?? 0
    const externals = statsRes.users_by_role?.external ?? 0
    totalStudents = learners + externals
  }

  const averageScore = scoresData?.average ?? 0

  return {
    totalLessons: lessons.length,
    totalQuizzes: quizzes.length,
    totalStudents,
    averageScore,
    recentLessons: lessons.slice(0, 4),
    recentQuizzes: quizzes.slice(0, 4),
  }
}