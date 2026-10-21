import type { Metadata } from 'next'
import { fetchBranding } from '@/lib/branding'
import { BrandingProvider } from '@/components/brand/brand-provider'
import { ThemeProvider } from '@/components/theme-provider'
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
        <ThemeProvider>
          <BrandingProvider branding={branding}>
            <Providers>{children}</Providers>
          </BrandingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}