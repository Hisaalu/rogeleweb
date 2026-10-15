import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { CreditCard } from 'lucide-react'

export const metadata: Metadata = { title: 'Subscription plans' }

export default function AdminPlansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Subscription plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the plans users can subscribe to.
        </p>
      </div>

      <EmptyState
        icon={CreditCard}
        title="Plan management coming soon"
        description="Create, edit, and toggle plans here."
      />
    </div>
  )
}