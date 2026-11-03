'use client'

import React from 'react'
import { Megaphone } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import type { Notification } from '@/types/notification'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

interface BroadcastMeta { id: number; audience: string; recipients: number }

const BroadcastItem = React.memo(function BroadcastItem({
  broadcast, meta,
}: {
  broadcast: Notification
  meta?: BroadcastMeta
}) {
  return (
    <li className="px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{broadcast.title}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {broadcast.message}
          </p>
          {broadcast.link && broadcast.link.trim() !== '' && (
            <p className="mt-1 text-xs font-medium text-brand-primary">
              → {broadcast.link}
            </p>
          )}
          {meta && (
            <p className="mt-1 text-xs text-muted-foreground">
              Sent to <span className="font-medium text-foreground">{meta.audience}</span>
              {' · '}
              <span className="font-medium text-foreground">
                {meta.recipients} recipient{meta.recipients === 1 ? '' : 's'}
              </span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {broadcast.type}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormatter.format(new Date(broadcast.created_at))}
          </span>
        </div>
      </div>
    </li>
  )
})

export function BroadcastHistory({
  broadcasts, meta,
}: {
  broadcasts: Notification[]
  meta: Record<number, BroadcastMeta>
}) {
  return (
    <Card>
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Sent broadcasts</h2>
        <p className="text-xs text-muted-foreground">{broadcasts.length} sent</p>
      </header>

      <div className="p-2">
        {broadcasts.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No broadcasts yet"
            description="Compose your first broadcast above."
          />
        ) : (
          <ul className="divide-y divide-border">
            {broadcasts.map((b) => (
              <BroadcastItem key={b.id} broadcast={b} meta={meta[b.id]} />
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}