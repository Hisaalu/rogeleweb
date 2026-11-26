import type { Metadata } from 'next'
import { fetchPublicSettings } from '@/lib/settings.server'
import { ContactContent } from '@/components/legal/contact-content'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  const siteTitle = settings['site.browser_title']?.trim() || 'NexaT'
  return {
    title: `Contact`,
    description: `Get in touch with ${siteTitle}.`,
  }
}

export default function ContactPage() {
  return <ContactContent />
}