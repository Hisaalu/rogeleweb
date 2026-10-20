'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Class, Subject } from '@/types/admin'

export function TeacherFilters({
  classes,
  subjects,
}: {
  classes: Class[]
  subjects: Subject[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [q, setQ] = useState(params.get('q') ?? '')
  const [classId, setClassId] = useState(params.get('class_id') ?? '')
  const [subjectId, setSubjectId] = useState(params.get('subject_id') ?? '')

  useEffect(() => {
    setQ(params.get('q') ?? '')
    setClassId(params.get('class_id') ?? '')
    setSubjectId(params.get('subject_id') ?? '')
  }, [params])

  const filteredSubjects = useMemo(() => {
    if (!classId) return subjects
    return subjects.filter((s) => String(s.class_id) === classId)
  }, [classId, subjects])

  function push(next: {
    q?: string
    class_id?: string
    subject_id?: string
  }) {
    const sp = new URLSearchParams(params.toString())

    const applyQ = next.q !== undefined ? next.q : q
    const applyClass = next.class_id !== undefined ? next.class_id : classId
    const applySubject =
      next.subject_id !== undefined ? next.subject_id : subjectId

    if (applyQ) sp.set('q', applyQ)
    else sp.delete('q')

    if (applyClass) sp.set('class_id', applyClass)
    else sp.delete('class_id')

    if (applySubject) sp.set('subject_id', applySubject)
    else sp.delete('subject_id')

    sp.delete('page')
    router.push(`${pathname}?${sp.toString()}`)
  }

  function handleClassChange(value: string) {
    setClassId(value)
    setSubjectId('')
    push({ class_id: value, subject_id: '' })
  }

  function handleSubjectChange(value: string) {
    setSubjectId(value)
    push({ subject_id: value })
  }

  const hasFilters = q || classId || subjectId

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push({})
        }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative min-w-[220px] flex-[2]">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search lessons by title..."
            className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
          />
        </div>

        <select
          value={classId}
          onChange={(e) => handleClassChange(e.target.value)}
          className="min-w-[170px] rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={subjectId}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="min-w-[170px] rounded-xl border border-border bg-background px-4 py-3.5 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30"
        >
          <option value="">All Subjects</option>
          {filteredSubjects.map((s) => (
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
              setClassId('')
              setSubjectId('')
              push({ q: '', class_id: '', subject_id: '' })
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