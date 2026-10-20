import type { Metadata } from 'next'
import { listBookmarksServer } from '@/lib/lessons.server'
import { BookmarksView } from './bookmarks-view'

export const metadata: Metadata = {
  title: 'Bookmarks',
}

export default async function BookmarksPage() {
  const bookmarks = await listBookmarksServer()
  return <BookmarksView lessons={bookmarks} />
}