import { getSessionUser } from '@/lib/auth'
import { getMySubscriptionServer } from '@/lib/subscriptions.server'
import { getTrialStatusServer } from '@/lib/dashboard.server'
import { fetchPublicSettings } from '@/lib/settings.server'
import { AppShell } from '@/components/layout/app-shell'
import { AnnouncementBanner } from '@/components/layout/announcement-banner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser()
  if (!session) return null

  const [subscription, trial, settings] = await Promise.all([
    getMySubscriptionServer(),
    getTrialStatusServer(),
    fetchPublicSettings(),
  ])
  
  const isPro = subscription?.status === 'active' && 
    (subscription.plan_type === 'yearly' || subscription.plan_type === '3')

  const hasActiveSubscription = subscription?.status === 'active'
  const isInTrial = !hasActiveSubscription && trial?.is_in_trial === true

  const showAnnouncement = settings['announcement.active'] === 'true'
  const announcementTitle = settings['announcement.title']
  const announcementMessage = settings['announcement.message']
  const announcementCtaLabel = settings['announcement.cta_label']
  const announcementCtaLink = settings['announcement.cta_link']
  
  const needsProfilePhoto = !session.profile_photo
  
  const announcementId = announcementTitle || 'default'

  return (
    <AppShell 
      user={session} 
      isPro={isPro} 
      isInTrial={isInTrial}
      hasActiveSubscription={hasActiveSubscription}
    >
      {showAnnouncement && announcementMessage && needsProfilePhoto && (
        <AnnouncementBanner
          id={announcementId}
          title={announcementTitle}
          message={announcementMessage}
          ctaLabel={announcementCtaLabel}
          ctaLink={announcementCtaLink}
          variant="brand"
        />
      )}
      
      {children}
    </AppShell>
  )
}