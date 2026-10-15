export interface Branding {
  schoolName: string
  tagline: string
  logoUrl: string | null
  faviconUrl: string | null
  colorPrimary: string
  colorAccent: string
  supportEmail: string
  websiteUrl: string
}

export const DEFAULT_BRANDING: Branding = {
  schoolName: 'Rogele',
  tagline: 'E-Learning Platform',
  logoUrl: null,
  faviconUrl: null,
  colorPrimary: '#7f2677',
  colorAccent: '#f06724',
  supportEmail: 'support@raysofgrace.ac.ug',
  websiteUrl: '',
}