import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { AdminUser } from '@/types/admin'
import { StudentsView } from './students-view'

export const metadata: Metadata = { title: 'My Students' }
export const dynamic = 'force-dynamic'

export default async function TeacherStudentsPage() {
  const session = await getSessionUser()
  if (!session) return null

  let students: AdminUser[] = []
  let classes: any[] = []

  try {
    const res = await serverApiRequest<unknown>('/api/v1/admin/students')
    const r = (res ?? {}) as { data?: AdminUser[]; value?: AdminUser[] }
    if (Array.isArray(res)) students = res
    else if (Array.isArray(r.data)) students = r.data
    else if (Array.isArray(r.value)) students = r.value
  } catch {
    students = []
  }

  try {
    const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
    const r = (res ?? {}) as { data?: any[]; value?: any[] }
    if (Array.isArray(res)) classes = res
    else if (Array.isArray(r.data)) classes = r.data
    else if (Array.isArray(r.value)) classes = r.value
  } catch {
    classes = []
  }

  return <StudentsView students={students} classes={classes} />
}