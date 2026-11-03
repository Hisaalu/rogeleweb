import type { Metadata } from 'next'
import { listPaymentsServer } from '@/lib/payments.server'
import type { AdminPayment } from '@/types/admin'
import { PaymentsView } from './payments-view'

export const metadata: Metadata = {
  title: 'Payments',
}

export const revalidate = 60

export default async function AdminPaymentsPage() {
  let payments: AdminPayment[] = []
  let meta = { page: 1, per_page: 50, total: 0, last_page: 1 }

  try {
    const result = await listPaymentsServer({ page: 1, per_page: 50 })
    payments = result.payments
    meta = result.meta
  } catch {
    payments = []
  }

  return <PaymentsView initialPayments={payments} initialMeta={meta} />
}