import type { Metadata } from 'next'
import { listPaymentsServer } from '@/lib/payments.server'
import type { AdminPayment } from '@/types/admin'
import { PaymentsView } from './payments-view'

export const metadata: Metadata = {
  title: 'Payments',
}

export default async function AdminPaymentsPage() {
  let payments: AdminPayment[] = []
  try {
    payments = await listPaymentsServer({ per_page: 200 })
  } catch {
    payments = []
  }

  return <PaymentsView initialPayments={payments} />
}