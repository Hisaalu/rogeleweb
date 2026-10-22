'use client'

import type { InitiatePaymentResponse, Payment, PaymentMethod } from '@/types/subscription'

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