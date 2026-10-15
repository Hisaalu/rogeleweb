import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { User } from '@/types/api'
import { ProfileView } from './profile-view'

export const metadata: Metadata = {
  title: 'Profile',
}

export default async function ProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  let profile: User | null = null
  try {
    profile = await serverApiRequest<User>('/api/v1/auth/me')
  } catch (err) {
    console.error('[profile] fetch failed:', err)
    profile = null
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Unable to load profile.</p>
  }

  return <ProfileView profile={profile} />
}

