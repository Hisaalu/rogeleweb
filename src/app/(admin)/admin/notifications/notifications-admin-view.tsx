'use client'

import { useState, useCallback } from 'react'
import type { Notification } from '@/types/notification'
import type { Class } from '@/types/admin'
import { BroadcastComposer } from './broadcast-composer'
import { BroadcastHistory } from './broadcast-history'

interface BroadcastMeta {
  id: number
  audience: string
  recipients: number
}

export function NotificationsAdminView({
  initialBroadcasts,
  classes,
}: {
  initialBroadcasts: Notification[]
  classes: Class[]
}) {
  const [broadcasts, setBroadcasts] = useState<Notification[]>(initialBroadcasts)
  const [meta, setMeta] = useState<Record<number, BroadcastMeta>>({})

  const handleSent = useCallback(
    (n: Notification, m: { audience: string; recipients: number }) => {
      setBroadcasts((list) => [n, ...list])
      setMeta((prev) => ({ ...prev, [n.id]: { id: n.id, ...m } }))
    },
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
          Broadcast messages to your users.
        </p>
      </div>

      <BroadcastComposer classes={classes} onSent={handleSent} />
      <BroadcastHistory broadcasts={broadcasts} meta={meta} />
    </div>
  )
}