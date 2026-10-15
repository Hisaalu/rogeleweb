'use client'

import { Megaphone } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'
import type { Notification } from '@/types/notification'

export function BroadcastHistory({
  broadcasts,
}: {
  broadcasts: Notification[]
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Sent broadcasts</h2>
        <p className="text-xs text-muted-foreground">
          {broadcasts.length} sent
        </p>
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
              <li key={b.id} className="px-3 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{b.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {b.message}
                    </p>
                    {b.link && b.link.trim() !== '' && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        → {b.link}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {b.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(b.created_at)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}