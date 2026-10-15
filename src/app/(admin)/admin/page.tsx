import type { Metadata } from 'next'
import {
  getAdminOverviewServer,
  getRecentActivityServer,
  getRecentPaymentsServer,
  getRecentSignupsServer,
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

  try {
    overview = await getAdminOverviewServer()
  } catch {
    overview = null
  }
  try {
    signups = await getRecentSignupsServer(8)
  } catch {
    signups = []
  }
  try {
    payments = await getRecentPaymentsServer(8)
  } catch {
    payments = []
  }
  try {
    activity = await getRecentActivityServer(10)
  } catch {
    activity = []
  }

  return (
    <AdminDashboardView
      overview={overview}
      signups={signups}
      payments={payments}
      activity={activity}
    />
  )
}