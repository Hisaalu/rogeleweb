import 'server-only'
import { unstable_cache } from 'next/cache'
import { serverApiRequest } from './server-api'
import type { Setting } from '@/types/admin'

interface PublicSettingsResponse {
  settings?: Record<string, string>
  data?: Record<string, string>
}

async function fetchPublicSettingsRaw(): Promise<Record<string, string>> {
  const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'
  const res = await fetch(`${API_URL}/api/v1/config/public`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`settings fetch failed: ${res.status}`)
  }
  const data: PublicSettingsResponse = await res.json()
  const raw = data.settings ?? data.data ?? {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (value == null) continue
    if (key.startsWith('branding.') && key !== 'branding.school_name') continue
    result[key] = String(value)
  }
  return result
}

export const fetchPublicSettings = unstable_cache(
  fetchPublicSettingsRaw,
  ['public-settings'],
  { revalidate: 60, tags: ['public-settings'] },
)

export async function listSettingsServer(): Promise<Setting[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/settings?per_page=100')
    if (!res) return []
    if (Array.isArray(res)) return res as Setting[]
    const r = (res ?? {}) as { data?: Setting[]; value?: Setting[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch (err) {
    console.error('[settings] failed to fetch admin settings:', err)
    return []
  }
}