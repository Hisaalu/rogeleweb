'use client'

import { useMemo, useState } from 'react'
import { Activity, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { AdminActivityItem } from '@/types/admin'

function actionTone(action: string): 'default' | 'info' | 'success' | 'warning' | 'danger' {
  switch (action) {
    case 'login':
      return 'info'
    case 'lesson_view':
      return 'default'
    case 'quiz_attempt':
      return 'warning'
    case 'homework_submit':
      return 'success'
    default:
      return 'default'
  }
}

function userName(a: AdminActivityItem): string {
  const name = [a.user_first_name, a.user_last_name].filter(Boolean).join(' ')
  return name || a.user_email || 'system'
}

export function ActivityView({
  initialActivity,
}: {
  initialActivity: AdminActivityItem[]
}) {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')

  const actions = useMemo(() => {
    const set = new Set<string>()
    for (const a of initialActivity) set.add(a.action)
    return Array.from(set).sort()
  }, [initialActivity])

  const filtered = useMemo(() => {
    let list = initialActivity
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q) ||
          (a.user_email ?? '').toLowerCase().includes(q) ||
          (a.user_first_name ?? '').toLowerCase().includes(q) ||
          (a.user_last_name ?? '').toLowerCase().includes(q),
      )
    }
    if (actionFilter) {
      list = list.filter((a) => a.action === actionFilter)
    }
    return list
  }, [initialActivity, search, actionFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The most recent {initialActivity.length} actions across the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search action, description, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filtered.length} of {initialActivity.length} events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-6">
              <EmptyState
                icon={Activity}
                title="No matching activity"
                description="Try changing the filter or search term."
              />
            </div>
          ) : (
            <div className="max-h-[640px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 backdrop-blur">
                  <tr>
                    {['When', 'Action', 'Description', 'User', 'Role'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((a) => (
                    <tr key={a.id} className="transition hover:bg-muted/30">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={actionTone(a.action)}>{a.action}</Badge>
                      </td>
                      <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
                        {a.description ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{userName(a)}</p>
                          {a.user_email && (
                            <p className="truncate text-xs text-muted-foreground">
                              {a.user_email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.user_role ? (
                          <Badge
                            tone={
                              a.user_role === 'admin'
                                ? 'info'
                                : a.user_role === 'teacher'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {a.user_role}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}