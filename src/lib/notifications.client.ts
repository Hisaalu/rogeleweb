import type {
  Notification,
  SendBroadcastPayload,
  SendBroadcastResponse,
} from '@/types/notification'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
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

export async function listNotificationsClient(params: {
  page?: number
  per_page?: number
} = {}): Promise<Notification[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  const res = await proxyFetch<unknown>(`/notifications/me?${search.toString()}`)
  return unwrap<Notification>(res)
}

export async function getUnreadCountClient(): Promise<number> {
  const res = await proxyFetch<{ count: number }>(
    '/notifications/me/unread-count',
  )
  return res?.count ?? 0
}

export async function markNotificationReadClient(id: number): Promise<void> {
  await proxyFetch<void>(`/notifications/${id}/read`, { method: 'POST' })
}

export async function markAllNotificationsReadClient(): Promise<number> {
  const res = await proxyFetch<{ marked: number }>('/notifications/read-all', {
    method: 'POST',
  })
  return res?.marked ?? 0
}

export async function sendBroadcastClient(
  payload: SendBroadcastPayload,
): Promise<SendBroadcastResponse> {
  return proxyFetch<SendBroadcastResponse>('/admin/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listBroadcastsClient(params: {
  page?: number
  per_page?: number
} = {}): Promise<Notification[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  const res = await proxyFetch<unknown>(
    `/admin/notifications?${search.toString()}`,
  )
  return unwrap<Notification>(res)
}