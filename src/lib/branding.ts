import { apiRequest } from './api-client'
import { DEFAULT_BRANDING, type Branding } from '@/types/branding'

interface PublicConfigResponse {
  branding: {
    school_name?: string
    tagline?: string
    logo_url?: string
    favicon_url?: string
    color_primary?: string
    color_accent?: string
    support_email?: string
    website_url?: string
  }
}

export async function fetchBranding(): Promise<Branding> {
  try {
    const res = await apiRequest<PublicConfigResponse>('/api/v1/config/public', {
      token: null,
      cache: 'no-store',
    })
    const b = res.branding ?? {}

    return {
      schoolName: b.school_name?.trim() || DEFAULT_BRANDING.schoolName,
      tagline: b.tagline?.trim() || DEFAULT_BRANDING.tagline,
      logoUrl: b.logo_url?.trim() || null,
      faviconUrl: b.favicon_url?.trim() || null,
      colorPrimary: b.color_primary?.trim() || DEFAULT_BRANDING.colorPrimary,
      colorAccent: b.color_accent?.trim() || DEFAULT_BRANDING.colorAccent,
      supportEmail: b.support_email?.trim() || DEFAULT_BRANDING.supportEmail,
      websiteUrl: b.website_url?.trim() || '',
    }
  } catch (err) {
    console.error('[branding] fetch failed:', err)
    return DEFAULT_BRANDING
  }
}