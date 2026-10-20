'use client'

import Link from 'next/link'
import { BookOpen, Bookmark } from 'lucide-react'

export function LearnerHeader({ bookmarkCount }: { bookmarkCount: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <BookOpen size={26} style={{ color: 'var(--brand-accent)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>Learning Materials</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Explore lessons and resources to enhance your knowledge
        </p>
      </div>

      <Link
        href="/learner/bookmarks"
        className="group inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--warning-border) 20%, transparent), transparent)',
          borderColor:
            'color-mix(in srgb, var(--warning-border) 40%, transparent)',
          color: 'var(--brand-primary)',
        }}
      >
        <Bookmark size={15} />
        <span>Bookmarks</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
          style={{ backgroundColor: 'var(--brand-accent)' }}
        >
          {bookmarkCount}
        </span>
      </Link>
    </div>
  )
}