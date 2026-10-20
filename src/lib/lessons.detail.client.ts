'use client'

import type { LessonMaterial } from '@/types/lesson'

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

export async function toggleBookmark(
  lessonId: number,
): Promise<{ bookmarked: boolean }> {
  return proxyJson<{ bookmarked: boolean }>(`/lessons/${lessonId}/bookmark`, {
    method: 'POST',
  })
}