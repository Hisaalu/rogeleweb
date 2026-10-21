'use client'

import Link from 'next/link'
import { BookOpen, PlusCircle } from 'lucide-react'

export function TeacherHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          <BookOpen size={26} style={{ color: 'var(--brand-accent)' }} />
          <span style={{ color: 'var(--brand-primary)' }}>Lessons</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and organize your Lessons
        </p>
      </div>

      <Link
        href="/teacher/lessons/create"
        className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
        style={{ backgroundColor: 'var(--brand-primary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--brand-accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--brand-primary)'
        }}
      >
        <PlusCircle size={16} />
        Create Lesson
      </Link>
    </div>
  )
}