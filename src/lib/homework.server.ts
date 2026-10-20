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
    const HOURS_24 = 24 * 60 * 60 * 1000

    if (params.status === 'active') {
      items = items.filter(h => new Date(h.due_date).getTime() >= now)
    } else if (params.status === 'expired') {
      items = items.filter(h => new Date(h.due_date).getTime() < now)
    } else {
      items = items.filter(h => {
        const dueDate = new Date(h.due_date).getTime()
        return now - dueDate <= HOURS_24
      })
    }
    
    return items
  } catch {
    return []
  }
}

export async function listLearnerHomeworksServer(params: {
  class_id: number
  status?: string
}): Promise<Homework[]> {
  try {
    const res = await serverApiRequest<unknown>(`/api/v1/homework?class_id=${params.class_id}&per_page=50`)
    const items = parseList<Homework>(res)
    
    const submissionsRes = await serverApiRequest<unknown>('/api/v1/homework/my-submissions')
    const submissions = parseList<HomeworkSubmission>(submissionsRes)

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