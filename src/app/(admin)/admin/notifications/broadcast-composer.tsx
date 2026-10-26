'use client'

import { useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import { sendBroadcastClient } from '@/lib/notifications.client'
import type { Notification, NotificationType } from '@/types/notification'

const TYPES: Array<{ value: NotificationType; label: string }> = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'system', label: 'System message' },
]

export function BroadcastComposer({
  onSent,
}: {
  onSent: (n: Notification) => void
}) {
  const { showToast } = useToast()
  
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [type, setType] = useState<NotificationType>('announcement')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isFormValid = title.trim().length > 0 && message.trim().length > 0

  function openConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setConfirmOpen(true)
  }

  async function handleSend() {
    if (!isFormValid) return
    setSubmitting(true)

    try {
      await sendBroadcastClient({
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        type,
      })

      onSent({
        id: -Date.now(),
        type,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        is_read: false,
        created_at: new Date().toISOString(),
      })

      showToast('Broadcast sent to all users.', 'success')
      setTitle('')
      setMessage('')
      setLink('')
      setType('announcement')
      setConfirmOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send broadcast', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={openConfirm} className="rounded-xl border border-border bg-card shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">New broadcast</h2>
          <p className="text-xs text-muted-foreground">
            Sends to every active user. Cannot be undone.
          </p>
        </header>

        <div className="grid gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform maintenance"
                disabled={submitting}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as NotificationType)}
                disabled={submitting}
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <span className="text-[10px] text-muted-foreground">{message.length} characters</span>
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Keep it short and clear."
              rows={4}
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/lessons"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Where users go when they click the notification.
            </p>
          </div>
        </div>

        <footer className="flex justify-end border-t border-border px-5 py-3 bg-muted/10">
          <Button type="submit" disabled={submitting || !isFormValid}>
            <Send size={14} /> Send broadcast
          </Button>
        </footer>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send broadcast?</DialogTitle>
            <DialogDescription>
              This will deliver a notification to every active user on the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {type}
              </span>
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-muted-foreground whitespace-pre-wrap">{message}</p>
            {link && <p className="mt-2 text-xs text-brand-primary font-medium">→ {link}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />} Send now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}