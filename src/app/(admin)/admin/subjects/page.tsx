import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = { title: 'Subjects' }

export default function AdminSubjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Subjects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage subjects and assign them to teachers.
        </p>
      </div>

      <EmptyState
        icon={BookOpen}
        title="Subject management coming soon"
        description="Create, edit, and delete subjects here."
      />
    </div>
  )
}