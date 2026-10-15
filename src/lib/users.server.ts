import 'server-only'
import { serverApiRequest } from './server-api'
import type {
  AdminUser,
  Class,
  HomeworkSubmission,
  QuizAttempt,
  UserListMeta,
} from '@/types/admin'

interface RawListResponse {
  data?: unknown[]
  value?: unknown[]
  meta?: UserListMeta
}

function parseUsers(res: unknown): {
  users: AdminUser[]
  meta: UserListMeta
} {
  const r = (res ?? {}) as RawListResponse
  const users: AdminUser[] = []
  if (Array.isArray(r.data)) users.push(...(r.data as AdminUser[]))
  else if (Array.isArray(r.value)) users.push(...(r.value as AdminUser[]))

  const meta: UserListMeta = r.meta ?? {
    page: 1,
    per_page: users.length,
    total: users.length,
    last_page: 1,
  }

  return { users, meta }
}

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listUsersServer(params: {
  page?: number
  per_page?: number
  q?: string
  role?: string
  class_id?: number
  is_active?: boolean
  is_suspended?: boolean
} = {}): Promise<{ users: AdminUser[]; meta: UserListMeta }> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 20))
  if (params.q) search.set('q', params.q)
  if (params.role) search.set('role', params.role)
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.is_active !== undefined) search.set('is_active', String(params.is_active))
  if (params.is_suspended !== undefined)
    search.set('is_suspended', String(params.is_suspended))

  const res = await serverApiRequest<unknown>(`/api/v1/users?${search.toString()}`)
  return parseUsers(res)
}

export async function getUserServer(id: number): Promise<AdminUser> {
  return serverApiRequest<AdminUser>(`/api/v1/users/${id}`)
}

export async function listClassesForFilterServer(): Promise<Class[]> {
  const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
  return unwrapList<Class>(res)
}

export async function listUserAttemptsServer(userId: number): Promise<QuizAttempt[]> {
  const res = await serverApiRequest<unknown>(`/api/v1/admin/users/${userId}/attempts`)
  return unwrapList<QuizAttempt>(res)
}

export async function listUserSubmissionsServer(
  userId: number,
): Promise<HomeworkSubmission[]> {
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/users/${userId}/submissions`,
  )
  return unwrapList<HomeworkSubmission>(res)
}