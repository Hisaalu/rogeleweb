import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { fetchPublicSettings } from '@/lib/settings.server'
import { AdminShell } from './admin/admin-shell'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchPublicSettings()
  
  const customTitle = settings['site.browser_title']?.trim()
  const siteTitle = customTitle || 'Admin'

  return {
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
  }
}

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  return <AdminShell user={user}>{children}</AdminShell>
}