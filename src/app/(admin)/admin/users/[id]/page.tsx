import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getUserServer,
  listClassesForFilterServer,
  listUserAttemptsServer,
  listUserSubmissionsServer,
} from '@/lib/users.server'
import type {
  AdminUser,
  Class,
  HomeworkSubmission,
  QuizAttempt,
} from '@/types/admin'
import { UserDetailView } from './user-detail-view'

export const metadata: Metadata = {
  title: 'User detail',
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const userId = Number(params.id)
  if (!Number.isFinite(userId)) notFound()

  let user: AdminUser | null = null
  try {
    user = await getUserServer(userId)
  } catch {
    user = null
  }

  if (!user) notFound()

  const [classes, attempts, submissions] = await Promise.all([
    listClassesForFilterServer().catch(() => []),
    listUserAttemptsServer(userId).catch(() => []),
    listUserSubmissionsServer(userId).catch(() => []),
  ])

  return (
    <UserDetailView
      user={user}
      classes={classes}
      attempts={attempts}
      submissions={submissions}
    />
  )
}