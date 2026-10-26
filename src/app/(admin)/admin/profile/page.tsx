import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { AdminUser } from '@/types/admin'
import { AdminProfileView } from './admin-profile-view'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function AdminProfilePage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  let profile: AdminUser | null = null
  try {
    profile = await serverApiRequest<AdminUser>(`/api/v1/users/${session.id}`)
  } catch {
    profile = null
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-danger-border/40 bg-danger-bg px-4 py-3 text-sm text-danger-fg">
        Could not load profile. Make sure the API is reachable and you are signed in as an admin.
      </div>
    )
  }

  return <AdminProfileView profile={profile} />
}