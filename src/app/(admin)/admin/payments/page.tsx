import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { DollarSign } from 'lucide-react'

export const metadata: Metadata = { title: 'Payments' }

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All payment activity with filters and totals.
        </p>
      </div>

      <EmptyState
        icon={DollarSign}
        title="Payment browser coming soon"
        description="Filter, export, and inspect every transaction."
      />
    </div>
  )
}