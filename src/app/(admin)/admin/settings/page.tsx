import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { Settings } from 'lucide-react'

export const metadata: Metadata = { title: 'Settings' }

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Branding, colors, contact details, and other platform settings.
        </p>
      </div>

      <EmptyState
        icon={Settings}
        title="Settings form coming soon"
        description="Customize the platform's appearance and contact information."
      />
    </div>
  )
}