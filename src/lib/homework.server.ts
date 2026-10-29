import 'server-only'
import { serverApiRequest } from './server-api'
import type { Homework, HomeworkAttachment, HomeworkSubmission, HomeworkListMeta } from '@/types/homework'

function parseList<T>(res: unknown, requestedPage = 1, requestedPerPage = 10): { items: T[]; meta: HomeworkListMeta } {
  if (!res) {
    return { items: [], meta: { page: 1, per_page: requestedPerPage, total: 0, last_page: 1 } }
  }

  if (Array.isArray(res)) {
    const total = res.length
    return {
      items: res as T[],
      meta: { page: 1, per_page: total, total, last_page: 1 },
    }
  }
  
  const r = (res ?? {}) as { data?: T[]; value?: T[]; meta?: any }
  const items: T[] = []
  if (Array.isArray(r.data)) items.push(...r.data)
  else if (Array.isArray(r.value)) items.push(...r.value)
  
  const rawMeta = r.meta || {}
  const per_page = typeof rawMeta.per_page === 'number' ? rawMeta.per_page : requestedPerPage
  const total = typeof rawMeta.total === 'number' ? rawMeta.total : 0
  const page = typeof rawMeta.page === 'number' ? rawMeta.page : requestedPage
  
  let last_page = typeof rawMeta.last_page === 'number' ? rawMeta.last_page : 1

  // Fallback inference if meta is missing
  if (!rawMeta.total && !rawMeta.last_page) {
    if (items.length === requestedPerPage) {
      last_page = page + 1
    } else {
      last_page = page
    }
  }

  return { items, meta: { page, per_page, total: total || (last_page * per_page), last_page } }
}

export async function listHomeworksServer(params: {
  q?: string
  class_id?: number
  status?: string
  page?: number
}): Promise<{ homeworks: Homework[]; meta: HomeworkListMeta }> {
  const page = params.page ?? 1
  const per_page = 10
  
  const sp = new URLSearchParams()
  sp.set('page', String(page))
  sp.set('per_page', String(per_page))
  if (params.q) sp.set('q', params.q)
  if (params.class_id) sp.set('class_id', String(params.class_id))
  
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework?${sp.toString()}`)
    const { items, meta } = parseList<Homework>(res, page, per_page)
    return { homeworks: items, meta }
  } catch {
    return {
      homeworks: [],
      meta: { page, per_page, total: 0, last_page: 1 }
    }
  }
}

export async function listLearnerHomeworksServer(params: {
  class_id: number
  status?: string
}): Promise<Homework[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework?class_id=${params.class_id}&per_page=50`)
    const { items } = parseList<Homework>(res)
    
    const submissionsRes = await serverApiRequest<unknown>('/api/v1/homework/my-submissions')
    const { items: submissions } = parseList<HomeworkSubmission>(submissionsRes)

    const merged = items.map(hw => {
      const sub = submissions.find(s => s.homework_id === hw.id)
      return { ...hw, submission: sub || null }
    })

    if (params.status === 'pending') {
      return merged.filter(h => !h.submission || (h.submission.status !== 'graded' && h.submission.status !== 'submitted'))
    }
    if (params.status === 'graded') {
      return merged.filter(h => h.submission?.status === 'graded')
    }

    return merged
  } catch {
    return []
  }
}

export async function getHomeworkServer(id: number): Promise<Homework | null> {
  try {
    const res = await serverApiRequest<any>(`/api/v1/homework/${id}`)
    if (!res) return null
    return res as Homework
  } catch {
    return null
  }
}

export async function listAttachmentsServer(homeworkId: number): Promise<HomeworkAttachment[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework/${homeworkId}/attachments`)
    return parseList<HomeworkAttachment>(res).items
  } catch {
    return []
  }
}

export async function listSubmissionsServer(homeworkId: number): Promise<HomeworkSubmission[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework/${homeworkId}/submissions`)
    return parseList<HomeworkSubmission>(res).items
  } catch {
    return []
  }
}