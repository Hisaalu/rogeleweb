import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson } from '@/types/lesson'
import type { Quiz } from '@/types/quiz'

export interface TeacherDashboardData {
  totalLessons: number
  totalQuizzes: number
  totalStudents: number
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

export async function getTeacherDashboardDataServer(
  teacherId: number,
): Promise<TeacherDashboardData> {
  const [lessonsRes, quizzesRes, studentsRes] = await Promise.all([
    // Get the 5 most recent lessons
    serverApiRequest<unknown>('/api/v1/lessons?limit=5&per_page=5').catch(() => []),
    // Get the 5 most recent quizzes
    serverApiRequest<unknown>('/api/v1/quizzes?limit=5&per_page=5').catch(() => []),
    // Get total students (learners)
    serverApiRequest<unknown>('/api/v1/users?role=learner&per_page=1').catch(() => []),
  ])

  const lessons = parseList<Lesson>(lessonsRes)
  const quizzes = parseList<Quiz>(quizzesRes)
  const studentsMeta = (studentsRes as { meta?: { total?: number } })?.meta
  const totalStudents = studentsMeta?.total ?? parseList(studentsRes).length

  return {
    totalLessons: lessons.length,
    totalQuizzes: quizzes.length,
    totalStudents,
    recentLessons: lessons.slice(0, 4),
    recentQuizzes: quizzes.slice(0, 4),
  }
}