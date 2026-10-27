import 'server-only'

interface PublicSettingsResponse {
  settings?: Record<string, string>
  data?: Record<string, string>
}

const CACHE_TTL_MS = 60_000
let cached: Record<string, string> | null = null
let cacheExpiresAt = 0

export async function fetchPublicSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (cached && now < cacheExpiresAt) return cached

  try {
    const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'
    const res = await fetch(`${API_URL}/api/v1/config/public`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return cached ?? {}
    }

    const data: PublicSettingsResponse = await res.json()
    const raw = data.settings ?? data.data ?? {}

    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(raw)) {
      if (key.startsWith('branding.')) continue
      if (value == null) continue
      result[key] = String(value)
    }

    cached = result
    cacheExpiresAt = now + CACHE_TTL_MS
    return result
  } catch (err) {
    console.error('[settings] fetchPublicSettings failed:', err)
    return cached ?? {}
  }
}