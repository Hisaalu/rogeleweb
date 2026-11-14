import type { Metadata } from 'next'
import { listBookmarksPagedServer } from '@/lib/lessons.server'
import { PremiumGate } from '@/components/premium-gate'
import { BookmarksView } from './bookmarks-view'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bookmarks',
}

function parsePositiveInt(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined
}

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: { locked?: string; page?: string }
}) {
  const page = parsePositiveInt(searchParams.page) ?? 1

  const result = await listBookmarksPagedServer({ page, per_page: 12 })

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  return (
    <>
      <BookmarksView
        lessons={result.lessons}
        meta={result.meta}
        currentPage={page}
      />
      {lockedReason && (
        <PremiumGate open context="lesson" reason={lockedReason} />
      )}
    </>
  )
}