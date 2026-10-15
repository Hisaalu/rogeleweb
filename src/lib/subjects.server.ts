import 'server-only'
import { serverApiRequest } from './server-api'
import type { Class, Subject, TeacherOption } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listSubjectsServer(params: {
  page?: number
  per_page?: number
  q?: string
} = {}): Promise<Subject[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.q) search.set('q', params.q)
  const query = search.toString()
  const path = query ? `/api/v1/subjects?${query}` : '/api/v1/subjects?per_page=100'
  const res = await serverApiRequest<unknown>(path)
  return unwrap<Subject>(res)
}

export async function listClassesServer(): Promise<Class[]> {
  const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
  return unwrap<Class>(res)
}

export async function listTeachersServer(): Promise<TeacherOption[]> {
  const res = await serverApiRequest<unknown>('/api/v1/users?per_page=100&role=teacher')
  return unwrap<TeacherOption>(res)
}