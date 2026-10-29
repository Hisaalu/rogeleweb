'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { Subject } from '@/types/admin'

export function LearnerFilters({ subjects }: { subjects: Subject[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [subjectId, setSubjectId] = useState(params.get('subject_id') ?? '')

  useEffect(() => {
    setQ(params.get('q') ?? '')
    setSubjectId(params.get('subject_id') ?? '')
  }, [params])

  function push(next: { q?: string; subject_id?: string }) {
    const sp = new URLSearchParams(params.toString())
    const applyQ = next.q !== undefined ? next.q : q
    const applyS = next.subject_id !== undefined ? next.subject_id : subjectId

    if (applyQ) sp.set('q', applyQ)
    else sp.delete('q')

    if (applyS) sp.set('subject_id', applyS)
    else sp.delete('subject_id')

    sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  const hasFilters = q || subjectId

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push({})
        }}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <div className="relative w-full flex-1 sm:min-w-[240px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons by title..."
            className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value)
              push({ subject_id: e.target.value })
            }}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:w-[180px]"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:flex-none"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              <Search size={15} />
              Search
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setQ('')
                  setSubjectId('')
                  push({ q: '', subject_id: '' })
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: 'var(--brand-accent)' }}
              >
                <X size={15} />
                <span className="sm:hidden">Clear</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}