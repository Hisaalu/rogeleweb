import type { Metadata } from 'next'
import {
  getAdminOverviewServer,
  getLearnersByClassServer,
  getRecentActivityServer,
  getRecentPaymentsServer,
  getRecentSignupsServer,
  type ClassLearnerCount,
} from '@/lib/admin.server'
import type {
  AdminActivityItem,
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
} from '@/types/admin'
import { AdminDashboardView } from './admin-dashboard-view'

export const metadata: Metadata = {
  title: 'Overview',
}

export default async function AdminPage() {
  let overview: AdminOverview | null = null
  let signups: AdminUserSummary[] = []
  let payments: AdminPaymentSummary[] = []
  let activity: AdminActivityItem[] = []
  let learnersByClass: ClassLearnerCount[] = []

  try {
    overview = await getAdminOverviewServer()
  } catch {
    overview = null
  }
  try {
    signups = await getRecentSignupsServer(5)
  } catch {
    signups = []
  }
  try {
    payments = await getRecentPaymentsServer(5)
  } catch {
    payments = []
  }
  try {
    activity = await getRecentActivityServer(5)
  } catch {
    activity = []
  }
  try {
    learnersByClass = await getLearnersByClassServer()
  } catch {
    learnersByClass = []
  }

  return (
    <AdminDashboardView
      overview={overview}
      signups={signups}
      payments={payments}
      activity={activity}
      learnersByClass={learnersByClass}
    />
  )
}