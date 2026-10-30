import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'

export interface TeacherDashboardData {
  totalLessons: number
  totalQuizzes: number
  totalStudents: number
  averageScore: number | null // <-- CHANGED to allow null
  recentLessons: Lesson[]
  recentQuizzes: Quiz[]
}

interface ClassLearnerCount {
  class_id: number
  class_name: string
  learner_count: number
}

function getItemsAndTotal<T>(raw: unknown): { items: T[], total: number } {
  if (!raw) return { items: [], total: 0 }
  
  if (Array.isArray(raw)) {
    return { items: raw as T[], total: raw.length }
  }
  
  const r = raw as Record<string, unknown>
  const items = Array.isArray(r.data) ? r.data as T[] 
              : Array.isArray(r.value) ? r.value as T[] 
              : []
              
  const meta = (r.meta ?? {}) as Record<string, unknown>
  const total = typeof meta.total === 'number' ? meta.total 
              : typeof r.total === 'number' ? r.total 
              : items.length

  return { items, total }
}

const ANALYTICS_URL = process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function fetchTeacherOverview(teacherId: number) {
  try {
    const url = `${ANALYTICS_URL}/analytics/teacher-overview?teacher_id=${teacherId}`
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getTeacherDashboardDataServer(teacherId: number): Promise<TeacherDashboardData> {
  const [lessonsRaw, quizzesRaw, learnerCountsRaw, overview] = await Promise.all([
    serverApiRequest<unknown>('/api/v1/lessons?per_page=4&sort=-created_at').catch(() => null),
    serverApiRequest<unknown>('/api/v1/quizzes?per_page=4&sort=-created_at').catch(() => null),
    serverApiRequest<ClassLearnerCount[]>('/api/v1/admin/learners-by-class').catch(() => null),
    fetchTeacherOverview(teacherId),
  ])

  const lessonsData = getItemsAndTotal<Lesson>(lessonsRaw)
  const quizzesData = getItemsAndTotal<Quiz>(quizzesRaw)
  
  const totalStudents = overview?.total_students ?? (Array.isArray(learnerCountsRaw)
    ? learnerCountsRaw.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
    : 0)

  // Fall back to null instead of 0
  const averageScore = overview?.average_score ?? null

  return {
    totalLessons: lessonsData.total,
    totalQuizzes: quizzesData.total,
    totalStudents,
    averageScore,
    recentLessons: lessonsData.items.slice(0, 4),
    recentQuizzes: quizzesData.items.slice(0, 4),
  }
}