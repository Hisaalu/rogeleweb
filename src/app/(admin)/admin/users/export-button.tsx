'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { AdminUser, Class } from '@/types/admin'

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rowsFromUsers(users: AdminUser[], classes: Class[]): string[][] {
  const classesById = new Map<number, Class>()
  for (const c of classes) classesById.set(c.id, c)

  const header = [
    'ID',
    'Email',
    'First name',
    'Last name',
    'Phone',
    'Role',
    'Class',
    'Status',
    'Email verified',
    'Last login',
    'Joined',
  ]

  const rows = users.map((u) => [
    String(u.id),
    u.email,
    u.first_name ?? '',
    u.last_name ?? '',
    u.phone ?? '',
    u.role,
    u.class_id ? classesById.get(u.class_id)?.name ?? '' : '',
    u.is_suspended ? 'Suspended' : u.is_active ? 'Active' : 'Deactivated',
    u.email_verified ? 'Yes' : 'No',
    u.last_login ? formatDate(u.last_login) : 'Never',
    formatDate(u.created_at),
  ])

  return [header, ...rows]
}

export function ExportButton({
  users,
  classes,
  filename,
  label = 'Export CSV',
  variant = 'outline',
}: {
  users: AdminUser[]
  classes: Class[]
  filename?: string
  label?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
}) {
  function handleClick() {
    const rows = rowsFromUsers(users, classes)
    const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    link.href = url
    link.download = filename ?? `users_${stamp}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant={variant} onClick={handleClick} disabled={users.length === 0}>
      <Download size={14} />
      {label}
    </Button>
  )
}