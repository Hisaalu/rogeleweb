import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { AdminShell } from './admin/admin-shell'

export const metadata: Metadata = {
  title: {
    default: 'Admin',
    template: '%s | Admin',
  },
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