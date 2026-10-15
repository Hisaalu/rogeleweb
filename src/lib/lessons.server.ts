import 'server-only'
import { serverApiRequest } from './server-api'
import type { Class, Lesson, LessonMaterial, Subject } from '@/types/lesson'

interface ListResponse<T> {
  value: T[]
  Count: number
}

function unwrap<T>(res: T[] | ListResponse<T>): T[] {
  return Array.isArray(res) ? res : res.value ?? []
}

export async function listLessonsServer(params: {
  page?: number
  per_page?: number
  q?: string
  class_id?: number
  subject_id?: number
} = {}): Promise<Lesson[]> {
  const search = new URLSearchParams()
  if (params.page) search.set('page', String(params.page))
  if (params.per_page) search.set('per_page', String(params.per_page))
  if (params.q) search.set('q', params.q)
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.subject_id) search.set('subject_id', String(params.subject_id))

  const query = search.toString()
  const path = query ? `/api/v1/lessons?${query}` : '/api/v1/lessons'
  const res = await serverApiRequest<Lesson[] | ListResponse<Lesson>>(path)
  return unwrap(res)
}

export async function listClassesServer(): Promise<Class[]> {
  const res = await serverApiRequest<Class[] | ListResponse<Class>>('/api/v1/classes?per_page=100')
  return unwrap(res)
}

export async function listSubjectsServer(): Promise<Subject[]> {
  const res = await serverApiRequest<Subject[] | ListResponse<Subject>>('/api/v1/subjects?per_page=100')
  return unwrap(res)
}

export async function listMaterialsServer(lessonId: number): Promise<LessonMaterial[]> {
  const res = await serverApiRequest<LessonMaterial[] | ListResponse<LessonMaterial>>(
    `/api/v1/lessons/${lessonId}/materials`,
  )
  return unwrap(res)
}