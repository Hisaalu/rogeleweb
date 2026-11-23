import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth'
import { listBookmarksPagedServer, listSubjectsServer } from '@/lib/lessons.server'
import { PremiumGate } from '@/components/premium-gate'
import { BookmarksView } from './bookmarks-view'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Library',
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: { locked?: string; page?: string; q?: string; subject_id?: string }
}) {
  const session = await getSessionUser()
  if (!session) return null

  const page = parsePositiveInt(searchParams.page) ?? 1
  const q = searchParams.q?.trim().toLowerCase() ?? ''
  const subjectId = parsePositiveInt(searchParams.subject_id)

  const [result, subjects] = await Promise.all([
    listBookmarksPagedServer({ page: 1, per_page: 100 }),
    listSubjectsServer(session.class_id ?? undefined),
  ])

  let filtered = result.lessons
  if (q) {
    filtered = filtered.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.content && l.content.toLowerCase().includes(q))
    )
  }
  if (subjectId) {
    filtered = filtered.filter((l) => l.subject_id === subjectId)
  }

  const per_page = 12
  const total = filtered.length
  const last_page = Math.max(1, Math.ceil(total / per_page))
  const start = (page - 1) * per_page
  const paginated = filtered.slice(start, start + per_page)

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  return (
    <>
      <BookmarksView
        lessons={paginated}
        subjects={subjects}
        meta={{ page, per_page, total, last_page }}
        currentPage={page}
      />
      {lockedReason && (
        <PremiumGate open context="lesson" reason={lockedReason} />
      )}
    </>
  )
}