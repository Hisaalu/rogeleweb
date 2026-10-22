import type {
  CreatePlanPayload,
  SubscriptionPlan,
  UpdatePlanPayload,
} from '@/types/admin'

async function proxy<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(data?.error?.message ?? 'Request failed')
  }

  return data as T
}

function sanitizePayload(
  payload: CreatePlanPayload | UpdatePlanPayload,
): CreatePlanPayload | UpdatePlanPayload {
  const clean = { ...payload }

  if (clean.price !== undefined) {
    clean.price = Math.round(Number(clean.price))
  }

  if (clean.duration_days !== undefined) {
    clean.duration_days = Math.round(Number(clean.duration_days))
  }

  return clean
}

export async function createPlanClient(
  payload: CreatePlanPayload,
): Promise<SubscriptionPlan> {
  return proxy<SubscriptionPlan>('/subscription-plans', {
    method: 'POST',
    body: JSON.stringify(sanitizePayload(payload)),
  })
}

export async function updatePlanClient(
  id: number,
  payload: UpdatePlanPayload,
): Promise<SubscriptionPlan> {
  return proxy<SubscriptionPlan>(`/subscription-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(sanitizePayload(payload)),
  })
}

export async function deletePlanClient(id: number): Promise<void> {
  await proxy<void>(`/subscription-plans/${id}`, { method: 'DELETE' })
}