import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import {
  listBookmarksServer,
  listLessonsServer,
  listSubjectsServer,
} from '@/lib/lessons.server'
import { PremiumGate } from '@/components/premium-gate'
import { ErrorToaster } from '@/components/error-toaster'
import { LearnerLessonsView } from './learner-lessons-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Learning Materials',
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export default async function LearnerLessonsPage({
  searchParams,
}: {
  searchParams: {
    q?: string
    subject_id?: string
    page?: string
    locked?: string
  }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const q = searchParams.q?.trim() ?? ''
  const subjectId = parsePositiveInt(searchParams.subject_id)
  const page = parsePositiveInt(searchParams.page) ?? 1

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  const [result, subjects, bookmarks] = await Promise.all([
    listLessonsServer({
      q: q || undefined,
      subject_id: subjectId,
      class_id: session.class_id ?? undefined,
      page,
      per_page: 12,
    }),
    listSubjectsServer(session.class_id ?? undefined),
    listBookmarksServer(),
  ])

  return (
    <>
      <ErrorToaster />
      <LearnerLessonsView
        lessons={result.lessons}
        subjects={subjects}
        bookmarkCount={bookmarks.length}
      />
      {lockedReason && (
        <PremiumGate open context="lesson" reason={lockedReason} />
      )}
    </>
  )
}