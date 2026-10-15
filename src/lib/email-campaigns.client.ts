import type {
  CreateCampaignPayload,
  EmailCampaign,
  EmailLog,
  PreviewPayload,
  PreviewResponse,
  SendResponse,
} from '@/types/email-campaign'

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

export async function createCampaignClient(
  payload: CreateCampaignPayload,
): Promise<EmailCampaign> {
  return proxyFetch<EmailCampaign>('/admin/email-campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateCampaignClient(
  id: number,
  payload: Partial<CreateCampaignPayload>,
): Promise<EmailCampaign> {
  return proxyFetch<EmailCampaign>(`/admin/email-campaigns/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteCampaignClient(id: number): Promise<void> {
  await proxyFetch<void>(`/admin/email-campaigns/${id}`, { method: 'DELETE' })
}

export async function previewCampaignClient(
  id: number,
  payload: PreviewPayload,
): Promise<PreviewResponse> {
  return proxyFetch<PreviewResponse>(`/admin/email-campaigns/${id}/preview`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function sendCampaignClient(id: number): Promise<SendResponse> {
  return proxyFetch<SendResponse>(`/admin/email-campaigns/${id}/send`, {
    method: 'POST',
  })
}

export async function listCampaignLogsClient(
  id: number,
  params: { page?: number; per_page?: number } = {},
): Promise<EmailLog[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 100))
  const res = await proxyFetch<unknown>(
    `/admin/email-campaigns/${id}/logs?${search.toString()}`,
  )
  return unwrap<EmailLog>(res)
}

export async function getCampaignClient(id: number): Promise<EmailCampaign> {
  return proxyFetch<EmailCampaign>(`/admin/email-campaigns/${id}`)
}