import type {
  Class,
  CreateLessonPayload,
  Lesson,
  LessonMaterial,
  Subject,
  UpdateLessonPayload,
} from '@/types/lesson'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

async function proxy<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  return data as T
}

export async function listLessonsClient(params: {
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
  const path = query ? `/lessons?${query}` : '/lessons'
  const res = await proxy<unknown>(path)
  return unwrap<Lesson>(res)
}

export async function createLessonClient(payload: CreateLessonPayload): Promise<Lesson> {
  return proxy<Lesson>('/lessons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateLessonClient(
  id: number,
  payload: UpdateLessonPayload,
): Promise<Lesson> {
  return proxy<Lesson>(`/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteLessonClient(id: number): Promise<void> {
  await proxy<void>(`/lessons/${id}`, { method: 'DELETE' })
}

export async function setPublishedClient(id: number, published: boolean): Promise<Lesson> {
  return proxy<Lesson>(`/lessons/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({ published }),
  })
}

export async function setApprovedClient(id: number, approved: boolean): Promise<Lesson> {
  return proxy<Lesson>(`/lessons/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ approved }),
  })
}

export async function toggleBookmarkClient(id: number): Promise<{ bookmarked: boolean }> {
  return proxy<{ bookmarked: boolean }>(`/lessons/${id}/bookmark`, { method: 'POST' })
}

export async function listMaterialsClient(lessonId: number): Promise<LessonMaterial[]> {
  const res = await proxy<unknown>(`/lessons/${lessonId}/materials`)
  return unwrap<LessonMaterial>(res)
}

export interface AddMaterialPayload {
  file_name: string
  file_path: string
  file_type: string
  file_size: number
}

export async function addMaterialClient(
  lessonId: number,
  payload: AddMaterialPayload,
): Promise<LessonMaterial> {
  return proxy<LessonMaterial>(`/lessons/${lessonId}/materials`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteMaterialClient(
  lessonId: number,
  materialId: number,
): Promise<void> {
  await proxy<void>(`/lessons/${lessonId}/materials/${materialId}`, {
    method: 'DELETE',
  })
}

export async function listClassesClient(): Promise<Class[]> {
  const res = await proxy<unknown>('/classes?per_page=100')
  return unwrap<Class>(res)
}

export async function listSubjectsClient(): Promise<Subject[]> {
  const res = await proxy<unknown>('/subjects?per_page=100')
  return unwrap<Subject>(res)
}