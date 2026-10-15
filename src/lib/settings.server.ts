import 'server-only'
import { serverApiRequest } from './server-api'
import type { Setting } from '@/types/admin'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listSettingsServer(): Promise<Setting[]> {
  const res = await serverApiRequest<unknown>('/api/v1/settings?per_page=200')
  return unwrap<Setting>(res)
}