import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson, LessonListMeta, LessonMaterial } from '@/types/lesson'
import type { Class, Subject } from '@/types/admin'

interface ListResponse {
  data?: Lesson[]
  value?: Lesson[]
  meta?: LessonListMeta
}

function parseList(res: unknown): { items: Lesson[]; meta: LessonListMeta } {
  if (Array.isArray(res)) {
    return {
      items: res as Lesson[],
      meta: { page: 1, per_page: res.length, total: res.length, last_page: 1 },
    }
  }
  const r = (res ?? {}) as ListResponse
  const items: Lesson[] = []
  if (Array.isArray(r.data)) items.push(...r.data)
  else if (Array.isArray(r.value)) items.push(...r.value)
  const meta: LessonListMeta = r.meta ?? {
    page: 1,
    per_page: items.length,
    total: items.length,
    last_page: 1,
  }
  return { items, meta }
}

export async function listLessonsServer(params: {
  q?: string
  subject_id?: number
  class_id?: number
  page?: number
  per_page?: number
}): Promise<{ lessons: Lesson[]; meta: LessonListMeta }> {
  const sp = new URLSearchParams()
  sp.set('page', String(params.page ?? 1))
  sp.set('per_page', String(params.per_page ?? 24))
  if (params.q) sp.set('q', params.q)
  if (params.subject_id) sp.set('subject_id', String(params.subject_id))
  if (params.class_id) sp.set('class_id', String(params.class_id))

  try {
    const res = await serverApiRequest<unknown>(
      `/api/v1/lessons?${sp.toString()}`,
    )
    return {
      lessons: parseList(res).items,
      meta: parseList(res).meta,
    }
  } catch {
    return {
      lessons: [],
      meta: { page: 1, per_page: 24, total: 0, last_page: 1 },
    }
  }
}

export async function getLessonServer(id: number): Promise<Lesson | null> {
  try {
    return await serverApiRequest<Lesson>(`/api/v1/lessons/${id}`)
  } catch {
    return null
  }
}

export async function listBookmarksServer(): Promise<Lesson[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/lessons/bookmarks')
    return parseList(res).items
  } catch {
    return []
  }
}

export async function listMaterialsServer(
  lessonId: number,
): Promise<LessonMaterial[]> {
  try {
    const res = await serverApiRequest<unknown>(
      `/api/v1/lessons/${lessonId}/materials`,
    )
    if (Array.isArray(res)) return res as LessonMaterial[]
    const r = (res ?? {}) as {
      data?: LessonMaterial[]
      value?: LessonMaterial[]
    }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}

export async function listSubjectsServer(): Promise<Subject[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/subjects?per_page=100')
    if (Array.isArray(res)) return res as Subject[]
    const r = (res ?? {}) as { data?: Subject[]; value?: Subject[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}

export async function listClassesServer(): Promise<Class[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
    if (Array.isArray(res)) return res as Class[]
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}