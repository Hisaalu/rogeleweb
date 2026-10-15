import type {
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload,
} from '@/types/admin'

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

export async function createSubjectClient(
  payload: CreateSubjectPayload,
): Promise<Subject> {
  return proxy<Subject>('/subjects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSubjectClient(
  id: number,
  payload: UpdateSubjectPayload,
): Promise<Subject> {
  return proxy<Subject>(`/subjects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteSubjectClient(id: number): Promise<void> {
  await proxy<void>(`/subjects/${id}`, { method: 'DELETE' })
}