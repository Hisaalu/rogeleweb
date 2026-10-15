import 'server-only'
import { serverApiRequest } from './server-api'
import type { Quiz } from '@/types/quiz'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listQuizzesServer(params: {
  page?: number
  per_page?: number
  class_id?: number
  subject_id?: number
} = {}): Promise<Quiz[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.subject_id) search.set('subject_id', String(params.subject_id))

  const query = search.toString()
  const path = query ? `/api/v1/quizzes?${query}` : '/api/v1/quizzes'
  const res = await serverApiRequest<unknown>(path)
  return unwrap<Quiz>(res)
}