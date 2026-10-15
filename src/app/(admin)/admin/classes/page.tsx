import type { Metadata } from 'next'
import { EmptyState } from '@/components/ui/empty-state'
import { GraduationCap } from 'lucide-react'

export const metadata: Metadata = { title: 'Classes' }

export default function AdminClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Classes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the classes used across lessons, homework, and quizzes.
        </p>
      </div>

      <EmptyState
        icon={GraduationCap}
        title="Class management coming soon"
        description="Create, edit, and delete classes here."
      />
    </div>
  )
}