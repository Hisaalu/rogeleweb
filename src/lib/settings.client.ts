'use client'

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
    throw new Error(data?.error?.message ?? `Request failed with ${res.status}`)
  }
  return data as T
}

export async function changePasswordClient(payload: { current_password: string; new_password: string }): Promise<void> {
  await proxyJson('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}