'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  const [user, setUser] = useState<AdminUser>(initialUser)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-brand-primary"
        >
          <ArrowLeft size={14} />
          Users
        </Link>
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