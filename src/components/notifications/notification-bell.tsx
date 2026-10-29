'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listNotificationsClient,
  getUnreadCountClient,
  markAllNotificationsReadClient,
  markNotificationReadClient,
} from '@/lib/notifications.client'
import { cn } from '@/lib/utils'
import { NotificationList } from './notification-list'

export function NotificationBell({
  compact = false,
  viewAllHref = '/notifications',
}: {
  compact?: boolean
  viewAllHref?: string
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCountClient,
    refetchInterval: 30_000,
    staleTime: 10_000,
  })

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'preview'],
    queryFn: () => listNotificationsClient({ per_page: 10 }),
    enabled: open,
    staleTime: 10_000,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsReadClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markOneMutation = useMutation({
    mutationFn: markNotificationReadClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        const popup = document.getElementById('notification-popup')
        if (popup && popup.contains(e.target as Node)) return
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleNotificationClick(notification: any) {
    if (!notification.is_read) {
      markOneMutation.mutate(notification.id)
    }
    setOpen(false)
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const popup = open ? (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-start sm:items-end sm:pt-[72px] sm:pr-4 pointer-events-none">
      <div 
        className="absolute inset-0 sm:hidden pointer-events-auto"
        style={{ backgroundColor: 'color-mix(in srgb, hsl(var(--background)) 80%, transparent)' }}
        onClick={() => setOpen(false)} 
      />

      <div
        id="notification-popup"
        role="menu"
        className={cn(
          'relative pointer-events-auto flex flex-col bg-card shadow-2xl border border-border overflow-hidden',
          'w-full max-h-[85vh] rounded-t-2xl rounded-b-none',
          'sm:w-[380px] sm:max-h-[calc(100vh-90px)] sm:rounded-2xl sm:border-border'
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={markAllMutation.isPending}
                className="flex items-center gap-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
                style={{ color: 'var(--brand-primary)' }}
              >
                <Check size={14} />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80 sm:hidden"
              aria-label="Close notifications"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              You have no notifications.
            </div>
          ) : (
            <NotificationList
              notifications={notifications}
              onItemClick={handleNotificationClick}
              compact
            />
          )}
        </div>

        <div className="shrink-0 border-t border-border p-2">
          <Link
            href={viewAllHref}
            onClick={() => setOpen(false)}
            className="block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition hover:bg-muted"
            style={{ color: 'var(--brand-primary)' }}
          >
            View all notifications
          </Link>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:h-10 sm:w-10',
          compact && 'h-8 w-8 sm:h-9 sm:w-9',
        )}
      >
        <Bell size={compact ? 18 : 20} />
        {unreadCount > 0 && (
          <span 
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm"
            style={{ 
              backgroundColor: 'var(--brand-accent)',
              border: '2px solid hsl(var(--background))' 
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {mounted && popup ? createPortal(popup, document.body) : null}
    </div>
  )
}