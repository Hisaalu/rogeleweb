import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.role === 'admin') redirect('/admin')
  if (user.role === 'learner' || user.role === 'external') {
    redirect('/learner/lessons')
  }
  return <>{children}</>
}