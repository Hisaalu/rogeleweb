import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { getProfileServer } from '@/lib/profile.server'
import type { User as ProfileUser } from '@/types/api'
import { EmptyState } from '@/components/ui/empty-state'
import { UserX } from 'lucide-react'
import { AdminProfileView } from './admin-profile-view'

export const metadata: Metadata = {
  title: 'Profile',
}

export const revalidate = 60

export default async function AdminProfilePage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')

  let profile: ProfileUser | null = null
  try {
    profile = await getProfileServer()
  } catch {
    profile = null
  }

  if (!profile) {
    return (
      <EmptyState
        icon={UserX}
        title="Could not load profile"
        description="Make sure the API is reachable and you are signed in as an admin."
      />
    )
  }

  return <AdminProfileView profile={profile} />
}