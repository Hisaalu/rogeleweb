import { fetchPublicSettings } from './settings.server'
import { DEFAULT_BRANDING, type Branding } from '@/types/branding'

export async function fetchBranding(): Promise<Branding> {
  try {
    const settings = await fetchPublicSettings()

    return {
      schoolName: settings['branding.school_name']?.trim() || DEFAULT_BRANDING.schoolName,
      tagline: settings['branding.tagline']?.trim() || DEFAULT_BRANDING.tagline,
      logoUrl: settings['branding.logo_url']?.trim() || null,
      faviconUrl: settings['branding.favicon_url']?.trim() || null,
      colorPrimary: settings['branding.color_primary']?.trim() || DEFAULT_BRANDING.colorPrimary,
      colorAccent: settings['branding.color_accent']?.trim() || DEFAULT_BRANDING.colorAccent,
      supportEmail: settings['branding.support_email']?.trim() || DEFAULT_BRANDING.supportEmail,
      websiteUrl: settings['branding.website_url']?.trim() || '',
    }
  } catch (err) {
    console.error('[branding] fetch failed:', err)
    return DEFAULT_BRANDING
  }
}