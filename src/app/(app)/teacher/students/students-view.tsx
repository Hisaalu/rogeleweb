'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useMemo } from 'react'
import { 
  Search, Users, GraduationCap, Mail, BarChart2, 
  User, Crown, Star 
} from 'lucide-react'
import type { Class } from '@/types/admin'

interface StudentListItem {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: string
  class_id?: number
  profile_photo?: string
  quizzes_taken: number
  avg_score: number
}

function getInitials(first?: string, last?: string, fullName?: string): string {
  if (first && last) {
    return (first[0] + last[0]).toUpperCase()
  }
  if (first) {
    return first.slice(0, 2).toUpperCase()
  }
  if (fullName) {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return 'ST'
}

export function StudentsView({ students, classes }: { students: StudentListItem[], classes: Class[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(params.get('search') ?? '')
  const [selectedClass, setSelectedClass] = useState(params.get('class_id') ?? '')

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = 
        (s.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesClass = selectedClass ? String(s.class_id) === selectedClass : true
      
      return matchesSearch && matchesClass
    })
  }, [students, searchTerm, selectedClass])

  const totalStudents = filteredStudents.length
  const avgPerformance = useMemo(() => {
    const valid = filteredStudents.filter(s => s.quizzes_taken > 0)
    if (valid.length === 0) return 0
    return Math.round(valid.reduce((sum, s) => sum + s.avg_score, 0) / valid.length)
  }, [filteredStudents])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (searchTerm) sp.set('search', searchTerm)
    if (selectedClass) sp.set('class_id', selectedClass)
    router.push(`${pathname}?${sp.toString()}`)
  }

  function handleClear() {
    setSearchTerm('')
    setSelectedClass('')
    router.push(pathname)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--brand-primary)' }}>
            <Users size={28} className="shrink-0" />
            <span className="truncate">My Students</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">View and track your students' progress</p>
        </div>

        {totalStudents > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: 'var(--brand-accent)' }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Students</p>
                <p className="text-lg font-bold text-foreground">{totalStudents}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: 'var(--brand-primary)' }}>
                <BarChart2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg. Performance</p>
                <p className="text-lg font-bold text-foreground">{avgPerformance}%</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand-accent"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="min-w-[180px] rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-brand-accent"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-primary)' }}>
            Filter
          </button>
          {(searchTerm || selectedClass) && (
            <button type="button" onClick={handleClear} className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--brand-accent)' }}>
              Clear
            </button>
          )}
        </form>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Users size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--brand-accent)' }} />
          <h3 className="text-xl font-bold text-foreground">No Students Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">You don't have any students assigned to your classes yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map(student => {
            const name = [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Student'
            const classObj = classes.find(c => c.id === student.class_id)
            const initials = getInitials(student.first_name, student.last_name, name)
            
            const avgScore = Math.round(student.avg_score)
            const quizzesTaken = student.quizzes_taken
            const passed = avgScore >= 50

            return (
              <div key={student.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-[120px]" style={{ backgroundColor: 'var(--brand-accent)' }}>
                  <div className="absolute -bottom-10 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 border-card bg-card text-2xl font-bold text-brand-primary shadow-md">
                    {student.profile_photo ? (
                      <img src={student.profile_photo} alt={name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  
                  {avgScore >= 80 && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--warning-border)', color: 'white' }} title="Top Performer">
                      <Crown size={14} />
                    </div>
                  )}
                  {avgScore >= 60 && avgScore < 80 && (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'hsl(var(--muted-foreground))', color: 'white' }} title="Good Performer">
                      <Star size={14} />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6 pt-12 text-center">
                  <h3 className="text-lg font-bold text-foreground">{name}</h3>
                  
                  <div className="mt-1 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-fg)' }}>
                      {student.role === 'learner' ? <GraduationCap size={12} /> : <User size={12} />}
                      Student
                    </span>
                  </div>

                  <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <GraduationCap size={14} style={{ color: 'var(--brand-accent)' }} /> 
                    {classObj?.name ?? 'No Class'}
                  </p>
                  <p className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground truncate px-2">
                    <Mail size={14} style={{ color: 'var(--brand-accent)' }} /> 
                    {student.email}
                  </p>

                  <div className="mb-4 rounded-xl bg-muted/50 p-3">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">Performance</span>
                      <span className="font-bold text-foreground">{avgScore}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                      <div 
                        className="h-full rounded-full transition-all" 
                        style={{ 
                          width: `${avgScore}%`, 
                          backgroundColor: avgScore >= 70 ? 'var(--success-border)' : avgScore >= 50 ? 'var(--warning-border)' : 'var(--danger-border)' 
                        }} 
                      />
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-3 gap-2 border-y border-border py-4 text-xs">
                    <div>
                      <p className="mb-1 text-[10px] uppercase text-muted-foreground">Quizzes</p>
                      <p className="font-bold text-foreground">{quizzesTaken}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase text-muted-foreground">Avg Score</p>
                      <p className="font-bold" style={{ color: passed ? 'var(--success-fg)' : 'var(--danger-fg)' }}>{avgScore}%</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase text-muted-foreground">Lessons</p>
                      <p className="font-bold text-foreground">NA</p>
                    </div>
                  </div>

                  <Link
                    href={`/teacher/students/${student.id}`}
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <BarChart2 size={16} /> View Progress
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}