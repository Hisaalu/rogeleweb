import 'server-only'
import { serverApiRequest } from './server-api'
import type { User } from '@/types/api'
import type { Class } from '@/types/admin'

export async function getProfileServer(): Promise<User | null> {
  try {
    return await serverApiRequest<User>('/api/v1/auth/me')
  } catch {
    return null
  }
}

export async function getClassesServer(): Promise<Class[]> {
  try {
    const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
    if (Array.isArray(res)) return res as Class[]
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(r.data)) return r.data
    if (Array.isArray(r.value)) return r.value
    return []
  } catch {
    return []
  }
}