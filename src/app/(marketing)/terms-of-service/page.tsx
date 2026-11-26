import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { TermsContent } from '@/components/legal/terms-content'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title'] || 'NexaT'
  return {
    title: `Terms of Service`,
    description: `Read the terms and conditions for using the ${siteTitle} platform.`,
  }
}

export default function TermsOfServicePage() {
  return <TermsContent />
}