import type { Metadata } from 'next'
import { listHomeworksServer } from '@/lib/homework.server'
import { listClassesServer } from '@/lib/lessons.server'
import { HomeworkListView } from './homework-list-view'

export const metadata: Metadata = { title: 'Manage Homework' }
export const dynamic = 'force-dynamic'

export default async function TeacherHomeworkPage({ searchParams }: { searchParams: { q?: string, class_id?: string, status?: string } }) {
  const [homeworks, classes] = await Promise.all([
    listHomeworksServer({
      q: searchParams.q,
      class_id: searchParams.class_id ? Number(searchParams.class_id) : undefined,
      status: searchParams.status,
    }),
    listClassesServer(),
  ])

  return <HomeworkListView homeworks={homeworks} classes={classes} />
}