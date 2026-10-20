import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import {
  listBookmarksServer,
  listLessonsServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import { LearnerLessonsView } from './learner-lessons-view'

export const metadata: Metadata = {
  title: 'Learning Materials',
}

export default async function LearnerLessonsPage({
  searchParams,
}: {
  searchParams: { q?: string; subject_id?: string; page?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const q = searchParams.q ?? ''
  const subjectId = searchParams.subject_id
    ? Number(searchParams.subject_id)
    : undefined
  const page = searchParams.page ? Number(searchParams.page) : 1

  const [result, subjects, bookmarks] = await Promise.all([
    listLessonsServer({
      q: q || undefined,
      subject_id: subjectId,
      class_id: session.class_id ?? undefined,
      page,
      per_page: 24,
    }),
    listSubjectsServer(),
    listBookmarksServer(),
  ])

  return (
    <LearnerLessonsView
      lessons={result.lessons}
      subjects={subjects}
      bookmarkCount={bookmarks.length}
    />
  )
}