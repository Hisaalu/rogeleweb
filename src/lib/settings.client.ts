import type { Setting } from '@/types/admin'

async function proxyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')

  let data: unknown = null
  if (text) {
    if (isJson) {
      try {
        data = JSON.parse(text)
      } catch {
        data = null
      }
    } else {
      data = { error: { message: text } }
    }
  }

  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } })?.error?.message ??
      `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export async function createSettingClient(payload: {
  setting_key: string
  setting_value: string
}): Promise<Setting> {
  return proxyFetch<Setting>('/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateSettingClient(
  id: number,
  setting_value: string,
): Promise<Setting> {
  return proxyFetch<Setting>(`/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ setting_value }),
  })
}

export async function deleteSettingClient(id: number): Promise<void> {
  await proxyFetch<void>(`/settings/${id}`, { method: 'DELETE' })
}