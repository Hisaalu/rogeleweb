import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Users' }

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every account on the platform.
        </p>
      </div>

      <EmptyState
        icon={Users}
        title="User management coming soon"
        description="This page will let you search, filter, and edit users."
      />
    </div>
  )
}