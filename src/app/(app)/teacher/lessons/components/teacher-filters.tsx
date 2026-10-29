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
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          push({})
        }}
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <div className="relative w-full flex-1 sm:min-w-[250px]">
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

        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:flex-row">
          <select
            value={classId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:w-[160px] sm:px-4"
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
            className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30 sm:w-[160px] sm:px-4"
          >
            <option value="">All Subjects</option>
            {filteredSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

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
                setClassId('')
                setSubjectId('')
                push({ q: '', class_id: '', subject_id: '' })
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-accent)' }}
            >
              <X size={15} />
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}