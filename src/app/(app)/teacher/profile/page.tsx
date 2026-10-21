import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { getProfileServer, getClassesServer } from '@/lib/profile.server'
import { TeacherProfileView } from './teacher-profile-view'

export const metadata: Metadata = { title: 'My Profile' }
export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const session = await getSessionUser()
  if (!session) return null

  const [profile, classes] = await Promise.all([
    getProfileServer(),
    getClassesServer(),
  ])

  return <TeacherProfileView profile={profile} classes={classes} />
}