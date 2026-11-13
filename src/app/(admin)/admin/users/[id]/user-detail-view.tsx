'use client'

import { useState } from 'react'
import { useRouter } from 'nextjs-toploader/app'
import { ArrowLeft } from 'lucide-react'
import type {
  AdminUser,
  Class,
  HomeworkSubmission,
  QuizAttempt,
} from '@/types/admin'
import { UserProfileCard } from './user-profile-card'
import { UserActionsCard } from './user-actions-card'
import { UserEditForm } from './user-edit-form'
import { UserSubscriptionCard } from './user-subscription-card'
import { UserPaymentsCard } from './user-payments-card'
import { UserAttemptsCard } from './user-attempts-card'
import { UserSubmissionsCard } from './user-submissions-card'

export function UserDetailView({
  user: initialUser,
  classes,
  attempts,
  submissions,
}: {
  user: AdminUser
  classes: Class[]
  attempts: QuizAttempt[]
  submissions: HomeworkSubmission[]
}) {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser>(initialUser)

  return (
    <div className="space-y-6">
      <div className="relative flex items-center justify-center py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="absolute left-0 inline-flex items-center gap-1.5 rounded-full p-1.5 text-2xl font-bold text-foreground transition hover:bg-muted hover:opacity-100 sm:text-3xl"
        >
          <ArrowLeft size={26} className="shrink-0" />
          <span className="sr-only">Go back</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
            User Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage this user&apos;s account.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <UserProfileCard user={user} classes={classes} />
          <UserActionsCard user={user} onChange={setUser} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <UserEditForm user={user} classes={classes} onChange={setUser} />
          <UserSubscriptionCard userId={user.id} />
          <UserPaymentsCard userId={user.id} />
          <UserAttemptsCard attempts={attempts} />
          <UserSubmissionsCard submissions={submissions} />
        </div>
      </div>
    </div>
  )
}