import 'server-only'
import { serverApiRequest } from './server-api'
import type { EmailCampaign } from '@/types/email-campaign'

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
  }
  return []
}

export async function listCampaignsServer(params: {
  page?: number
  per_page?: number
} = {}): Promise<EmailCampaign[]> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  const res = await serverApiRequest<unknown>(
    `/api/v1/admin/email-campaigns?${search.toString()}`,
  )
  return unwrap<EmailCampaign>(res)
}