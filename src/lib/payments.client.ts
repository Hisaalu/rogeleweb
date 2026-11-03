'use client'

import type { AdminPayment } from '@/types/admin'

export interface PaymentsPage {
  payments: AdminPayment[]
  meta: {
    page: number
    per_page: number
    total: number
    last_page: number
  }
}

function unwrap<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.value)) return obj.value as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
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
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw new Error(
      data?.error?.message ?? `Request failed with ${res.status}`,
    )
  }

  return data as T
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

  const res = await proxyFetch<unknown>(`/payments/all?${search.toString()}`)
  const payments = unwrap<AdminPayment>(res)

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