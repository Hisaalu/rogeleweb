import type { Class, CreateClassPayload, UpdateClassPayload } from '@/types/admin'

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

export async function createClassClient(payload: CreateClassPayload): Promise<Class> {
  return proxy<Class>('/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateClassClient(
  id: number,
  payload: UpdateClassPayload,
): Promise<Class> {
  return proxy<Class>(`/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteClassClient(id: number): Promise<void> {
  await proxy<void>(`/classes/${id}`, { method: 'DELETE' })
}