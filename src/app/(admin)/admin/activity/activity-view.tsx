'use client'

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Activity, Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AdminActivityItem } from '@/types/admin'
import { fetchMoreActivity } from './actions'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDate(val: string | null | undefined) {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d.getTime()) ? '—' : dateFormatter.format(d)
}

function actionTone(action: string): 'default' | 'info' | 'success' | 'warning' | 'danger' {
  switch (action) {
    case 'login': return 'info'
    case 'lesson_view': return 'default'
    case 'quiz_attempt': return 'warning'
    case 'homework_submit': return 'success'
    default: return 'default'
  }
}

function userName(a: AdminActivityItem): string {
  const name = [a.user_first_name, a.user_last_name].filter(Boolean).join(' ')
  return name || a.user_email || 'system'
}

const ActivityRow = React.memo(function ActivityRow({ item }: { item: AdminActivityItem }) {
  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatDate(item.created_at)}</td>
      <td className="px-4 py-3"><Badge tone={actionTone(item.action)}>{item.action}</Badge></td>
      <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">{item.description ?? '—'}</td>
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{userName(item)}</p>
          {item.user_email && <p className="truncate text-xs text-muted-foreground">{item.user_email}</p>}
        </div>
      </td>
      <td className="px-4 py-3">
        {item.user_role ? (
          <Badge tone={item.user_role === 'admin' ? 'info' : item.user_role === 'teacher' ? 'warning' : 'default'}>
            {item.user_role}
          </Badge>
        ) : <span className="text-muted-foreground">—</span>}
      </td>
    </tr>
  )
})

const MobileActivityCard = React.memo(function MobileActivityCard({ item }: { item: AdminActivityItem }) {
  return (
    <div className="flex flex-col gap-2 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{userName(item)}</span>
          {item.user_email && <span className="text-xs text-muted-foreground">{item.user_email}</span>}
        </div>
        <Badge tone={actionTone(item.action)}>{item.action}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{item.description ?? 'No description'}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
        {item.user_role && (
          <Badge tone={item.user_role === 'admin' ? 'info' : item.user_role === 'teacher' ? 'warning' : 'default'}>
            {item.user_role}
          </Badge>
        )}
      </div>
    </div>
  )
})

export function ActivityView({
  initialActivity,
  initialNextCursor,
  initialHasMore,
}: {
  initialActivity: AdminActivityItem[]
  initialNextCursor: string | null
  initialHasMore: boolean
}) {
  const [items, setItems] = useState(initialActivity)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const actions = useMemo(() => {
    const set = new Set<string>()
    for (const a of initialActivity) set.add(a.action)
    return Array.from(set).sort()
  }, [initialActivity])

  const filtered = useMemo(() => {
    let list = items
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase()
      list = list.filter((a) =>
        a.action.toLowerCase().includes(q) ||
        (a.description ?? '').toLowerCase().includes(q) ||
        (a.user_email ?? '').toLowerCase().includes(q) ||
        (a.user_first_name ?? '').toLowerCase().includes(q) ||
        (a.user_last_name ?? '').toLowerCase().includes(q),
      )
    }
    if (actionFilter) list = list.filter((a) => a.action === actionFilter)
    return list
  }, [items, debouncedSearch, actionFilter])

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return
    setIsLoadingMore(true)
    setLoadError(null)
    try {
      const page = await fetchMoreActivity(nextCursor)
      if (page.items.length === 0) {
        setHasMore(false)
        setNextCursor(null)
        return
      }
      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        const unique = page.items.filter((i) => !existingIds.has(i.id))
        return [...prev, ...unique]
      })
      setNextCursor(page.nextCursor)
      setHasMore(page.hasMore)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, nextCursor])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Showing {items.length} events across the platform.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action, description, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">All actions</option>
          {actions.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10">
          <CardTitle>{filtered.length} matching events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-12">
              <EmptyState icon={Activity} title="No matching activity" description="Try changing the filter or search term." />
            </div>
          ) : (
            <>
              <div className="hidden max-h-[640px] overflow-y-auto sm:block">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/80 shadow-sm backdrop-blur">
                    <tr>
                      {['When', 'Action', 'Description', 'User', 'Role'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((a) => <ActivityRow key={a.id} item={a} />)}
                  </tbody>
                </table>
              </div>
              <div className="flex max-h-[640px] flex-col overflow-y-auto sm:hidden">
                {filtered.map((a) => <MobileActivityCard key={a.id} item={a} />)}
              </div>

              <div className="flex flex-col items-center justify-center gap-2 border-t border-border px-4 py-4">
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore || !nextCursor}
                    className={cn(
                      'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      'text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                      (isLoadingMore || !nextCursor) && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    {isLoadingMore ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading more...</>
                    ) : (
                      'Load more events'
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">End of activity</span>
                )}
                {loadError && <p className="text-xs text-danger-fg">{loadError}</p>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}