import { Suspense } from 'react'
import type { Metadata } from 'next'
import { fetchBranding } from '@/lib/branding'
import { fetchPublicSettings } from '@/lib/settings.server.public'
import { BrandingProvider } from '@/components/brand/brand-provider'
import { SettingsProvider } from '@/components/settings/settings-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from '@/components/providers'
import { NavigationProgress } from '@/components/navigation-progress'
import './globals.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const [branding, settings] = await Promise.all([
    fetchBranding(),
    fetchPublicSettings(),
  ])

  const customTitle = settings['site.browser_title']?.trim()
  const finalTitle = customTitle || branding.schoolName

  const customFavicon = settings['site.custom_favicon']?.trim()
  const finalFavicon = customFavicon || branding.faviconUrl

  return {
    title: {
      default: finalTitle,
      template: `%s | ${finalTitle}`,
    },
    description: branding.tagline,
    icons: finalFavicon ? { icon: finalFavicon } : undefined,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [branding, settings] = await Promise.all([
    fetchBranding(),
    fetchPublicSettings(),
  ])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --brand-accent: ${branding.colorAccent};
                --brand-primary: ${branding.colorPrimary};
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('rogele.theme') || 'system';
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var resolved = stored === 'system' ? (prefersDark ? 'dark' : 'light') : stored;
                  if (resolved === 'dark') document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ThemeProvider>
          <BrandingProvider branding={branding}>
            <SettingsProvider settings={settings}>
              <Providers>{children}</Providers>
            </SettingsProvider>
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}