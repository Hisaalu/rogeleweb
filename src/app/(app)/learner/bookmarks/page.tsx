import type { Metadata } from 'next'
import { listBookmarksServer } from '@/lib/lessons.server'
import { PremiumGate } from '@/components/premium-gate'
import { BookmarksView } from './bookmarks-view'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Bookmarks',
}

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: { locked?: string }
}) {
  const bookmarks = await listBookmarksServer()

  const lockedReason =
    searchParams.locked === 'trial_expired' ||
    searchParams.locked === 'no_plan'
      ? searchParams.locked
      : null

  return (
    <>
      <BookmarksView lessons={bookmarks} />
      {lockedReason && (
        <PremiumGate open context="lesson" reason={lockedReason} />
      )}
    </>
  )
}