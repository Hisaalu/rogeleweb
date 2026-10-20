import 'server-only'
import { serverApiRequest } from './server-api'
import type { Homework, HomeworkAttachment, HomeworkSubmission } from '@/types/homework'

function parseList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  const r = (res ?? {}) as { data?: T[]; value?: T[] }
  if (Array.isArray(r.data)) return r.data
  if (Array.isArray(r.value)) return r.value
  return []
}

export async function listHomeworksServer(params: {
  q?: string
  class_id?: number
  status?: string
  page?: number
}): Promise<Homework[]> {
  const sp = new URLSearchParams()
  sp.set('page', String(params.page ?? 1))
  sp.set('per_page', '50')
  if (params.q) sp.set('q', params.q)
  if (params.class_id) sp.set('class_id', String(params.class_id))
  
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework?${sp.toString()}`)
    let items = parseList<Homework>(res)
    
    const now = new Date().getTime()
    if (params.status === 'active') {
      items = items.filter(h => new Date(h.due_date).getTime() >= now)
    } else if (params.status === 'expired') {
      items = items.filter(h => new Date(h.due_date).getTime() < now)
    }
    
    return items
  } catch {
    return []
  }
}

export async function getHomeworkServer(id: number): Promise<Homework | null> {
  try {
    return await serverApiRequest<Homework>(`/api/v1/homework/${id}`)
  } catch {
    return null
  }
}

export async function listAttachmentsServer(homeworkId: number): Promise<HomeworkAttachment[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework/${homeworkId}/attachments`)
    return parseList<HomeworkAttachment>(res)
  } catch {
    return []
  }
}

export async function listSubmissionsServer(homeworkId: number): Promise<HomeworkSubmission[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework/${homeworkId}/submissions`)
    return parseList<HomeworkSubmission>(res)
  } catch {
    return []
  }
}