import 'server-only'
import { serverApiRequest } from './server-api'

export interface PlanSummary {
  id: number
  name: string
  description?: string | null
  price: number
  currency: string
  duration_days?: number | null
  features?: string[] | null
}

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

export async function listPlansServer(): Promise<PlanSummary[]> {
  try {
    const res = await serverApiRequest<unknown>(
      '/api/v1/subscription-plans?per_page=20',
    )
    return unwrapList<Record<string, unknown>>(res).map((r) => ({
      id: Number(r.id),
      name: String(r.name ?? r.title ?? 'Plan'),
      description: (r.description as string | null | undefined) ?? null,
      price: Number(r.price ?? r.amount ?? 0),
      currency: String(r.currency ?? 'RWF'),
      duration_days: r.duration_days != null ? Number(r.duration_days) : null,
      features: Array.isArray(r.features) ? (r.features as string[]) : null,
    }))
  } catch {
    return []
  }
}