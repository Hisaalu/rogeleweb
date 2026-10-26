'use client'

import type { Setting } from '@/types/admin'

async function proxyJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

  // If the server returns no content, return undefined safely
  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }

  const text = await res.text()
  
  // If the response is empty, don't try to parse it
  if (!text) {
    return undefined as T
  }

  let data: any = null
  try {
    data = JSON.parse(text)
  } catch {
    // If parsing fails, it means the response was likely plain text (e.g., "OK")
    // In this case, if the request was successful, we just ignore the body.
    if (!res.ok) {
      throw new Error(text || `Request failed with ${res.status}`)
    }
    return undefined as T
  }

  if (!res.ok) {
    throw new Error(data?.error?.message ?? data?.message ?? `Request failed with ${res.status}`)
  }

  return data as T
}

function normalizeSetting(raw: Record<string, unknown>): Setting {
  return {
    id: Number(raw.id),
    setting_key: String(raw.setting_key ?? ''),
    setting_value:
      raw.setting_value == null ? null : String(raw.setting_value),
    created_at:
      raw.created_at == null ? '' : String(raw.created_at),
    updated_at:
      raw.updated_at == null ? null : String(raw.updated_at),
  } as Setting
}

export async function changePasswordClient(payload: {
  current_password: string
  new_password: string
}): Promise<void> {
  await proxyJson('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteAccountClient(): Promise<void> {
  await proxyJson('/auth/account', {
    method: 'DELETE',
  })
}

export async function createSettingClient(payload: {
  setting_key: string
  setting_value: string
}): Promise<Setting> {
  const row = await proxyJson<Record<string, unknown>>('/settings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return normalizeSetting(row)
}

export async function updateSettingClient(id: number, value: string): Promise<Setting> {
  const row = await proxyJson<Record<string, unknown>>(`/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ setting_value: value }),
  })
  return normalizeSetting(row)
}

export async function deleteSettingClient(id: number): Promise<void> {
  await proxyJson<void>(`/settings/${id}`, { method: 'DELETE' })
}