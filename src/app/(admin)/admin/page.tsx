import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
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

export const revalidate = 60

export default async function AdminPage() {
  const [
    overviewRes,
    signupsRes,
    paymentsRes,
    activityRes,
    learnersRes,
    settings
  ] = await Promise.allSettled([
    getAdminOverviewServer(),
    getRecentSignupsServer(5),
    getRecentPaymentsServer(5),
    getRecentActivityServer(5),
    getLearnersByClassServer(),
    fetchPublicSettings(),
  ])

  const overview = overviewRes.status === 'fulfilled' ? overviewRes.value : null
  const signups = signupsRes.status === 'fulfilled' ? signupsRes.value : []
  const payments = paymentsRes.status === 'fulfilled' ? paymentsRes.value : []
  const activity = activityRes.status === 'fulfilled' ? activityRes.value : []
  const learnersByClass = learnersRes.status === 'fulfilled' ? learnersRes.value : []
  
  const siteTitle = settings.status === 'fulfilled' 
    ? settings.value['site.browser_title']?.trim() 
    : undefined

  return (
    <AdminDashboardView
      overview={overview}
      signups={signups}
      payments={payments}
      activity={activity}
      learnersByClass={learnersByClass}
      siteTitle={siteTitle}
    />
  )
}