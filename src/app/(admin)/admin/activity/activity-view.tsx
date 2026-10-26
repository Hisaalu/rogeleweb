'use client'

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { Activity, Search, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import type { AdminActivityItem } from '@/types/admin'
import { fetchMoreActivity } from './actions'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

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
      <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
        {dateFormatter.format(new Date(item.created_at))}
      </td>
      <td className="px-4 py-3">
        <Badge tone={actionTone(item.action)}>{item.action}</Badge>
      </td>
      <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
        {item.description ?? '—'}
      </td>
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{userName(item)}</p>
          {item.user_email && (
            <p className="truncate text-xs text-muted-foreground">{item.user_email}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {item.user_role ? (
          <Badge
            tone={
              item.user_role === 'admin' ? 'info' : item.user_role === 'teacher' ? 'warning' : 'default'
            }
          >
            {item.user_role}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
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
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{dateFormatter.format(new Date(item.created_at))}</span>
        {item.user_role && (
          <Badge tone={item.user_role === 'admin' ? 'info' : item.user_role === 'teacher' ? 'warning' : 'default'}>
            {item.user_role}
          </Badge>
        )}
      </div>
    </div>
  )
})

export function ActivityView({ initialActivity }: { initialActivity: AdminActivityItem[] }) {
  const [items, setItems] = useState<AdminActivityItem[]>(initialActivity)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('')
  
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialActivity.length === 25)
  
  const observerTarget = useRef<HTMLDivElement>(null)

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
  }, [items, debouncedSearch, actionFilter])

    const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    
    try {
      const lastItem = items[items.length - 1]
      const cursor = lastItem ? lastItem.created_at : null 
      
      const newItems = await fetchMoreActivity(cursor)
      
      if (newItems.length < 25) {
        setHasMore(false)
      }
      
      setItems((prev: AdminActivityItem[]) => {
        const existingIds = new Set(prev.map((item: AdminActivityItem) => item.id))
        const uniqueNewItems = newItems.filter((item: AdminActivityItem) => !existingIds.has(item.id))
        return [...prev, ...uniqueNewItems]
      })
    } catch {
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, items])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 1.0 }
    )
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current)
    }
  }, [loadMore, hasMore, isLoadingMore])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }, [])

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setActionFilter(e.target.value)
  }, [])

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
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <select
          value={actionFilter}
          onChange={handleFilterChange}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/25"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/10">
          <CardTitle>
            {filtered.length} matching events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-12">
              <EmptyState
                icon={Activity}
                title="No matching activity"
                description="Try changing the filter or search term."
              />
            </div>
          ) : (
            <>
              <div className="hidden max-h-[640px] overflow-y-auto sm:block">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur z-10 shadow-sm">
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
                      <ActivityRow key={a.id} item={a} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex max-h-[640px] flex-col overflow-y-auto sm:hidden">
                {filtered.map((a) => (
                  <MobileActivityCard key={a.id} item={a} />
                ))}
              </div>
              
              <div ref={observerTarget} className="flex h-12 items-center justify-center border-t border-border">
                {isLoadingMore && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {!hasMore && filtered.length > 0 && (
                  <span className="text-xs text-muted-foreground">End of activity</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}