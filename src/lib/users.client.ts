import type {
  AdminUser,
  HomeworkSubmission,
  QuizAttempt,
  UpdateUserPayload,
  UserListMeta,
} from '@/types/admin'

interface RawListResponse {
  data?: AdminUser[]
  value?: AdminUser[]
  meta?: UserListMeta
}

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

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listUsersClient(params: {
  page?: number
  per_page?: number
  q?: string
  role?: string
  class_id?: number
  is_active?: boolean
  is_suspended?: boolean
}): Promise<{ users: AdminUser[]; meta: UserListMeta }> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 20))
  if (params.q) search.set('q', params.q)
  if (params.role) search.set('role', params.role)
  if (params.class_id) search.set('class_id', String(params.class_id))
  if (params.is_active !== undefined) search.set('is_active', String(params.is_active))
  if (params.is_suspended !== undefined)
    search.set('is_suspended', String(params.is_suspended))

  const res = await proxyFetch<RawListResponse>(`/users?${search.toString()}`)
  const users = res.data ?? res.value ?? []
  const meta: UserListMeta = res.meta ?? {
    page: 1,
    per_page: users.length,
    total: users.length,
    last_page: 1,
  }
  return { users, meta }
}

export async function getUserClient(id: number): Promise<AdminUser> {
  return proxyFetch<AdminUser>(`/users/${id}`)
}

export async function updateUserClient(
  id: number,
  payload: UpdateUserPayload,
): Promise<AdminUser> {
  return proxyFetch<AdminUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function listUserAttemptsClient(userId: number): Promise<QuizAttempt[]> {
  const res = await proxyFetch<unknown>(`/admin/users/${userId}/attempts`)
  return unwrapList<QuizAttempt>(res)
}

export async function listUserSubmissionsClient(
  userId: number,
): Promise<HomeworkSubmission[]> {
  const res = await proxyFetch<unknown>(`/admin/users/${userId}/submissions`)
  return unwrapList<HomeworkSubmission>(res)
}

export async function forcePasswordResetClient(
  userId: number,
): Promise<{ message: string }> {
  return proxyFetch<{ message: string }>(`/admin/users/${userId}/force-reset`, {
    method: 'POST',
  })
}

export interface SubscriptionSummary {
  id: number
  plan_type: string
  status: string
  amount?: number
  start_date: string
  end_date: string
  payment_method?: string
  transaction_id?: string
}

export async function getUserSubscriptionClient(
  userId: number,
): Promise<SubscriptionSummary | null> {
  try {
    const res = await proxyFetch<unknown>(
      `/subscriptions/all?user_id=${userId}&per_page=1`,
    )
    const list = unwrapList<SubscriptionSummary>(res)
    return list[0] ?? null
  } catch {
    return null
  }
}

export interface PaymentRow {
  id: number
  amount?: number
  status: string
  payment_method?: string
  transaction_id?: string
  plan_type?: string
  created_at: string
  payment_date?: string
}

export async function getUserPaymentsClient(userId: number): Promise<PaymentRow[]> {
  try {
    const res = await proxyFetch<unknown>(
      `/payments/all?user_id=${userId}&per_page=10`,
    )
    return unwrapList<PaymentRow>(res)
  } catch {
    return []
  }
}

export async function setUserPasswordClient(
  userId: number,
  password: string,
): Promise<{ message: string }> {
  return proxyFetch<{ message: string }>(`/admin/users/${userId}/set-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export interface CreateUserPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  class_id?: number
}

export async function createUserClient(payload: CreateUserPayload): Promise<AdminUser> {
  // Step 1: create the base user via the public register endpoint
  const created = await proxyFetch<{ user: AdminUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return created.user
}