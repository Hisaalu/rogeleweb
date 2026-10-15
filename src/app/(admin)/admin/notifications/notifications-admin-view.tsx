'use client'

import { useState } from 'react'
import type { Notification } from '@/types/notification'
import { BroadcastComposer } from './broadcast-composer'
import { BroadcastHistory } from './broadcast-history'

export function NotificationsAdminView({
  initialBroadcasts,
}: {
  initialBroadcasts: Notification[]
}) {
  const [broadcasts, setBroadcasts] =
    useState<Notification[]>(initialBroadcasts)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Broadcast messages to every user on the platform.
        </p>
      </div>

      <BroadcastComposer
        onSent={(n) => setBroadcasts((list) => [n, ...list])}
      />

      <BroadcastHistory broadcasts={broadcasts} />
    </div>
  )
}