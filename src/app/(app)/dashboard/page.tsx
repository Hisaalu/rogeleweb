import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function DashboardRedirectPage() {
  const session = await getSessionUser()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin')
  if (session.role === 'teacher') redirect('/teacher/dashboard')
  redirect('/learner/dashboard')
}