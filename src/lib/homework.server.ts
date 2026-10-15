import 'server-only'
import { serverApiRequest } from './server-api'
import type { Homework } from '@/types/homework'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listHomeworkServer(params: {
  page?: number
  per_page?: number
  q?: string
  class_id?: number
  subject_id?: number
} = {}): Promise<Homework[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.q) search.set('q', params.q)
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.subject_id) search.set('subject_id', String(params.subject_id))

  const query = search.toString()
  const path = query ? `/api/v1/homework?${query}` : '/api/v1/homework'
  const res = await serverApiRequest<unknown>(path)
  return unwrap<Homework>(res)
}