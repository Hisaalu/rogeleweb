import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listStudentsServer, listClassesServer } from '@/lib/students.server'
import { StudentsView } from './students-view'

export const metadata: Metadata = { title: 'My Students' }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: { search?: string; class_id?: string; page?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const search = searchParams.search?.trim() || undefined
  const classId = searchParams.class_id ? Number(searchParams.class_id) : undefined
  const page = searchParams.page ? Number(searchParams.page) : 1

  const [result, classes] = await Promise.all([
    listStudentsServer({ q: search, class_id: classId, page, per_page: 12 }),
    listClassesServer(),
  ])

  return (
    <StudentsView 
      students={result.students} 
      meta={result.meta}
      classes={classes} 
    />
  )
}