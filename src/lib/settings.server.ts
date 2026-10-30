import 'server-only'
import { unstable_cache } from 'next/cache'

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
    if (key.startsWith('branding.')) continue
    if (value == null) continue
    result[key] = String(value)
  }
  return result
}

export const fetchPublicSettings = unstable_cache(
  fetchPublicSettingsRaw,
  ['public-settings'],
  { revalidate: 60, tags: ['public-settings'] },
)