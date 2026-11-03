'use client'

import type {
  InitiatePaymentResponse,
  Payment,
  PaymentMethod,
} from '@/types/subscription'
import type { AdminPayment } from '@/types/admin'


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
    throw new Error(data?.error?.message ?? `Request failed with ${res.status}`)
  }

  return data as T
}

export async function initiatePaymentClient(payload: {
  plan_id: number
  method: PaymentMethod
  phone_number: string
}): Promise<InitiatePaymentResponse> {
  return proxy<InitiatePaymentResponse>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getPaymentStatusClient(id: number): Promise<Payment> {
  return proxy<Payment>(`/payments/${id}/status`, { method: 'GET' })
}

export async function listMyPaymentsClient(): Promise<Payment[]> {
  const res = await proxy<unknown>('/payments/me', { method: 'GET' })
  if (Array.isArray(res)) return res as Payment[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as Payment[]
    if (Array.isArray(obj.value)) return obj.value as Payment[]
  }
  return []
}

export async function previewPaymentClient(
  plan_id: number,
): Promise<{ amount: number }> {
  return proxy<{ amount: number }>('/payments/preview', {
    method: 'POST',
    body: JSON.stringify({ plan_id }),
  })
}


export interface PaymentsPage {
  payments: AdminPayment[]
  meta: {
    page: number
    per_page: number
    total: number
    last_page: number
  }
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

export async function listPaymentsClient(params: {
  page?: number
  per_page?: number
  user_id?: number
  status?: string
} = {}): Promise<PaymentsPage> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('per_page', String(params.per_page ?? 50))
  if (params.user_id) search.set('user_id', String(params.user_id))
  if (params.status) search.set('status', params.status)

  const res = await proxy<unknown>(`/payments/all?${search.toString()}`)
  const payments = unwrapList<AdminPayment>(res)

  let meta = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 50,
    total: payments.length,
    last_page: 1,
  }
  if (res && typeof res === 'object' && !Array.isArray(res)) {
    const obj = res as Record<string, any>
    if (obj.meta) {
      meta = {
        page: Number(obj.meta.page ?? meta.page),
        per_page: Number(obj.meta.per_page ?? meta.per_page),
        total: Number(obj.meta.total ?? payments.length),
        last_page: Number(obj.meta.last_page ?? 1),
      }
    }
  }

  return { payments, meta }
}