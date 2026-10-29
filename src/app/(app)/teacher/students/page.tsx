import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { serverApiRequest } from '@/lib/server-api'
import type { AdminUser, Class } from '@/types/admin'
import { StudentsView } from './students-view'

export const metadata: Metadata = { title: 'My Students' }
export const dynamic = 'force-dynamic'

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; class_id?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const search = searchParams.search?.trim() || undefined
  const classId = searchParams.class_id ? Number(searchParams.class_id) : undefined

  let students: AdminUser[] = []
  let classes: Class[] = []

  try {
    const sp = new URLSearchParams()
    if (search) sp.set('q', search)
    if (classId) sp.set('class_id', String(classId))
    
    const res = await serverApiRequest<unknown>(`/api/v1/admin/students?${sp.toString()}`)
    const r = (res ?? {}) as { data?: AdminUser[]; value?: AdminUser[] }
    
    if (Array.isArray(res)) students = res as AdminUser[]
    else if (Array.isArray(r.data)) students = r.data
    else if (Array.isArray(r.value)) students = r.value
  } catch {
    students = []
  }

  try {
    const res = await serverApiRequest<unknown>('/api/v1/classes?per_page=100')
    const r = (res ?? {}) as { data?: Class[]; value?: Class[] }
    if (Array.isArray(res)) classes = res as Class[]
    else if (Array.isArray(r.data)) classes = r.data
    else if (Array.isArray(r.value)) classes = r.value
  } catch {
    classes = []
  }

  return <StudentsView students={students} classes={classes} />
}