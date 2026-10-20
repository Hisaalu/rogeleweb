'use client'

import type {
  CreateLessonPayload,
  Lesson,
  LessonMaterial,
  UpdateLessonPayload,
} from '@/types/lesson'

async function proxyJson<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    const msg =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed with status ${res.status}`
    throw new Error(msg)
  }
  return data as T
}

export async function createLesson(payload: CreateLessonPayload): Promise<Lesson> {
  return proxyJson<Lesson>('/lessons', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateLesson(
  id: number,
  payload: UpdateLessonPayload,
): Promise<Lesson> {
  return proxyJson<Lesson>(`/lessons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteLesson(id: number): Promise<void> {
  await proxyJson<void>(`/lessons/${id}`, { method: 'DELETE' })
}

export async function publishLesson(id: number, published: boolean): Promise<Lesson> {
  return proxyJson<Lesson>(`/lessons/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify({ published }),
  })
}

export async function listMaterials(lessonId: number): Promise<LessonMaterial[]> {
  try {
    const res = await proxyJson<unknown>(`/lessons/${lessonId}/materials`)
    if (Array.isArray(res)) return res as LessonMaterial[]
    const r = (res ?? {}) as { data?: LessonMaterial[]; value?: LessonMaterial[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}

interface PresignResponse {
  upload_url: string
  file_key: string
  public_url: string
}

async function presignUpload(file: File): Promise<PresignResponse> {
  return proxyJson<PresignResponse>('/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      content_type: file.type || 'application/octet-stream',
      size: file.size,
    }),
  })
}

async function putToR2(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`)
  }
}

export async function addMaterialFromFile(
  lessonId: number,
  file: File,
): Promise<LessonMaterial> {
  const presign = await presignUpload(file)
  await putToR2(presign.upload_url, file)
  return proxyJson<LessonMaterial>(`/lessons/${lessonId}/materials`, {
    method: 'POST',
    body: JSON.stringify({
      file_name: file.name,
      file_path: presign.public_url,
      file_type: file.type,
      file_size: file.size,
    }),
  })
}

export async function deleteMaterial(
  lessonId: number,
  materialId: number,
): Promise<void> {
  await proxyJson<void>(`/lessons/${lessonId}/materials/${materialId}`, {
    method: 'DELETE',
  })
}