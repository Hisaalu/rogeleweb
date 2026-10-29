import 'server-only'
import { serverApiRequest } from './server-api'
import type { AdminUser, Class } from '@/types/admin'

export interface StudentListMeta {
  page: number
  per_page: number
  total: number
  last_page: number
}

export async function listStudentsServer(params: {
  q?: string
  class_id?: number
  page?: number
}): Promise<{ students: AdminUser[]; meta: StudentListMeta }> {
  const page = params.page ?? 1
  const per_page = 10

  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('per_page', String(per_page))
  if (params.q) sp.set('q', params.q)
  if (params.class_id) sp.set('class_id', String(params.class_id))

  const [studentsRes, learnerCounts] = await Promise.all([
    serverApiRequest<unknown>(`/api/v1/admin/students?${sp.toString()}`).catch(() => null),
    serverApiRequest<unknown>('/api/v1/admin/learners-by-class').catch(() => null)
  ])

  let students: AdminUser[] = []
  let meta: StudentListMeta = { page, per_page, total: 0, last_page: 1 }

  if (studentsRes) {
    let rawMeta: any = {}
    if (Array.isArray(studentsRes)) {
      students = studentsRes as AdminUser[]
    } else if (typeof studentsRes === 'object') {
      const r = studentsRes as { data?: AdminUser[]; value?: AdminUser[]; meta?: any }
      if (Array.isArray(r.data)) students = r.data
      else if (Array.isArray(r.value)) students = r.value
      rawMeta = r.meta || {}
    }

    let total = typeof rawMeta.total === 'number' ? rawMeta.total : 0
    let last_page = typeof rawMeta.last_page === 'number' ? rawMeta.last_page : 1

    if (!rawMeta.total && Array.isArray(learnerCounts)) {
      total = learnerCounts.reduce((sum, c: any) => sum + (c.learner_count ?? 0), 0)
      last_page = Math.max(1, Math.ceil(total / per_page))
    }

    meta = {
      page: typeof rawMeta.page === 'number' ? rawMeta.page : page,
      per_page: typeof rawMeta.per_page === 'number' ? rawMeta.per_page : per_page,
      total,
      last_page,
    }
  }

  return { students, meta }
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