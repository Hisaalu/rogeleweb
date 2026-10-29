import 'server-only'
import { serverApiRequest } from './server-api'
import type { Lesson, LessonListMeta, LessonMaterial } from '@/types/lesson'
import type { Class, Subject } from '@/types/admin'

function parseList(res: unknown, requestedPage: number, requestedPerPage: number): { lessons: Lesson[]; meta: LessonListMeta } {
  let lessons: Lesson[] = []
  let rawMeta: any = {}

  if (Array.isArray(res)) {
    lessons = res as Lesson[]
  } else if (res && typeof res === 'object') {
    const r = res as { data?: Lesson[]; value?: Lesson[]; meta?: any }
    if (Array.isArray(r.data)) lessons = r.data
    else if (Array.isArray(r.value)) lessons = r.value
    rawMeta = r.meta || {}
  }

  let page = typeof rawMeta.page === 'number' ? rawMeta.page : requestedPage
  let per_page = typeof rawMeta.per_page === 'number' ? rawMeta.per_page : requestedPerPage
  let total = typeof rawMeta.total === 'number' ? rawMeta.total : 0
  let last_page = typeof rawMeta.last_page === 'number' ? rawMeta.last_page : 1

  if (!rawMeta.total && !rawMeta.last_page) {
    if (lessons.length === requestedPerPage) {
      last_page = page + 1
      total = last_page * per_page
    } else {
      last_page = page
      total = (page - 1) * per_page + lessons.length
    }
  }

  return {
    lessons,
    meta: { page, per_page, total, last_page }
  }
}

export async function listLessonsServer(params: {
  q?: string
  subject_id?: number
  class_id?: number
  page?: number
  per_page?: number
}): Promise<{ lessons: Lesson[]; meta: LessonListMeta }> {
  const page = params.page ?? 1
  const per_page = params.per_page ?? 10
  
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('per_page', String(per_page))
  if (params.q) sp.set('q', params.q)
  if (params.subject_id) sp.set('subject_id', String(params.subject_id))
  if (params.class_id) sp.set('class_id', String(params.class_id))

  try {
    const res = await serverApiRequest<unknown>(`/api/v1/lessons?${sp.toString()}`)
    return parseList(res, page, per_page)
  } catch {
    return {
      lessons: [],
      meta: { page, per_page, total: 0, last_page: page },
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
    return parseList(res, 1, 100).lessons
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