import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { PrivacyContent } from '@/components/legal/privacy-content'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
  return {
    title: `Privacy Policy`,
    description: `Learn how ${siteTitle} collects, uses, and protects your personal data.`,
  }
}

export default function PrivacyPolicyPage() {
  return <PrivacyContent />
}