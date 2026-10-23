import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getProfileServer, getClassesServer } from '@/lib/profile.server'
import { getTrialStatusServer, getActiveSubscriptionServer } from '@/lib/dashboard.server'
import { hasAccess } from '@/lib/access'
import { LearnerProfileView } from './learner-profile-view'

export const metadata: Metadata = { title: 'Profile' }
export const dynamic = 'force-dynamic'

export default async function LearnerProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, classes, trial, subscription] = await Promise.all([
    getProfileServer(),
    getClassesServer(),
    getTrialStatusServer(),
    getActiveSubscriptionServer(),
  ])

  const userHasAccess = hasAccess(subscription, trial)

  return (
    <LearnerProfileView 
      profile={profile} 
      classes={classes} 
      trial={trial} 
      subscription={subscription}
      hasAccess={userHasAccess} 
    />
  )
}