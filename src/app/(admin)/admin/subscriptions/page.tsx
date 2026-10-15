import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { CreditCard } from 'lucide-react'

export const metadata: Metadata = { title: 'Subscriptions' }

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Subscriptions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all user subscriptions.
        </p>
      </div>

      <EmptyState
        icon={CreditCard}
        title="Subscription browser coming soon"
        description="Filter by status, user, or date."
      />
    </div>
  )
}