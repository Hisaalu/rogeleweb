import type { Metadata } from 'next'
import { fetchBranding } from '@/lib/branding'
import { BrandingProvider } from '@/components/brand/brand-provider'
import { Providers } from '@/components/providers'
import './globals.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const branding = await fetchBranding()
  return {
    title: {
      default: branding.schoolName,
      template: `%s | ${branding.schoolName}`,
    },
    description: branding.tagline,
    icons: branding.faviconUrl ? { icon: branding.faviconUrl } : undefined,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const branding = await fetchBranding()

  return (
    <html lang="en">
      <body>
        <BrandingProvider branding={branding}>
          <Providers>{children}</Providers>
        </BrandingProvider>
      </body>
    </html>
  )
}