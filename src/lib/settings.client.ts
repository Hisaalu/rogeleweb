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
  if (res.status === 204) return undefined as T
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Request failed with ${res.status}`)
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