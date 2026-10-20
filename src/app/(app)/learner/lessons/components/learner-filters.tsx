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
    <div className="rounded-2xl border border-border bg-card p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push({})
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative min-w-[240px] flex-[2]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons by title or description..."
            className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
          />
        </div>

        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value)
            push({ subject_id: e.target.value })
          }}
          className="min-w-[180px] rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
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
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <X size={15} />
            Clear
          </button>
        )}
      </form>
    </div>
  )
}