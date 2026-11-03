'use client'

import { useState } from 'react'
import { Loader2, Send, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import { sendBroadcastClient } from '@/lib/notifications.client'
import type { BroadcastAudience, Notification, NotificationType } from '@/types/notification'
import type { Class } from '@/types/admin'

type AudienceKind = 'all' | 'role' | 'class' | 'users'

const TYPES: Array<{ value: NotificationType; label: string }> = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'system', label: 'System message' },
]

const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Notifications', href: '/notifications' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Terms of service', href: '/terms-of-service' },
  { label: 'Learner · Lessons', href: '/learner/lessons' },
  { label: 'Learner · Homework', href: '/learner/homework' },
  { label: 'Learner · Quizzes', href: '/learner/quizzes' },
  { label: 'Learner · Subscription', href: '/learner/subscription' },
  { label: 'Teacher · Analytics', href: '/teacher/analytics' },
  { label: 'Admin · Users', href: '/admin/users' },
  { label: 'Admin · Payments', href: '/admin/payments' },
]

export function BroadcastComposer({
  classes,
  onSent,
}: {
  classes: Class[]
  onSent: (n: Notification, meta: { audience: string; recipients: number }) => void
}) {
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [type, setType] = useState<NotificationType>('announcement')
  const [audienceKind, setAudienceKind] = useState<AudienceKind>('all')
  const [audienceRole, setAudienceRole] = useState<'learner' | 'teacher' | 'admin' | 'external'>('learner')
  const [audienceClassId, setAudienceClassId] = useState<number | null>(null)
  const [audienceUsersRaw, setAudienceUsersRaw] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isFormValid =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    (audienceKind !== 'class' || audienceClassId !== null) &&
    (audienceKind !== 'users' || audienceUsersRaw.trim().length > 0)

  function buildAudience(): BroadcastAudience {
    switch (audienceKind) {
      case 'role':
        return { kind: 'role', role: audienceRole }
      case 'class':
        return { kind: 'class', class_id: audienceClassId! }
      case 'users':
        return {
          kind: 'users',
          user_ids: audienceUsersRaw
            .split(/[,\s]+/)
            .map((s) => Number(s))
            .filter((n) => Number.isFinite(n) && n > 0),
        }
      default:
        return { kind: 'all' }
    }
  }

  function audienceSummary(): string {
    switch (audienceKind) {
      case 'all':
        return 'Everyone'
      case 'role':
        return `All ${audienceRole}s`
      case 'class': {
        const c = classes.find((x) => x.id === audienceClassId)
        return c ? `Class: ${c.name}` : 'Class'
      }
      case 'users': {
        const n = audienceUsersRaw.split(/[,\s]+/).filter(Boolean).length
        return `${n} selected user${n === 1 ? '' : 's'}`
      }
    }
  }

  function openConfirm(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormValid) return
    setConfirmOpen(true)
  }

  async function handleSend() {
    if (!isFormValid) return
    setSubmitting(true)

    try {
      const audience = buildAudience()
      const res = await sendBroadcastClient({
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        type,
        audience,
      })

      onSent(
        {
          id: -Date.now(),
          type,
          title: title.trim(),
          message: message.trim(),
          link: link.trim() || undefined,
          is_read: false,
          created_at: new Date().toISOString(),
        },
        { audience: res.audience, recipients: res.recipients },
      )

      showToast(`Sent to ${res.recipients} recipient${res.recipients === 1 ? '' : 's'}.`, 'success')
      setTitle('')
      setMessage('')
      setLink('')
      setType('announcement')
      setAudienceKind('all')
      setAudienceUsersRaw('')
      setConfirmOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send broadcast', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">New broadcast</h2>
          <p className="text-xs text-muted-foreground">
            Targeted delivery — everyone by default.
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

          <div className="space-y-2">
            <Label htmlFor="audience_kind">Send to</Label>
            <Select
              id="audience_kind"
              value={audienceKind}
              onChange={(e) => setAudienceKind(e.target.value as AudienceKind)}
              disabled={submitting}
            >
              <option value="all">Everyone (all active users)</option>
              <option value="role">A specific role…</option>
              <option value="class">A specific class…</option>
              <option value="users">Specific user IDs…</option>
            </Select>

            {audienceKind === 'role' && (
              <Select
                value={audienceRole}
                onChange={(e) =>
                  setAudienceRole(e.target.value as 'learner' | 'teacher' | 'admin' | 'external')
                }
                disabled={submitting}
              >
                <option value="learner">All learners</option>
                <option value="external">All external learners</option>
                <option value="teacher">All teachers</option>
                <option value="admin">All admins</option>
              </Select>
            )}

            {audienceKind === 'class' && (
              <Select
                value={audienceClassId ?? ''}
                onChange={(e) =>
                  setAudienceClassId(e.target.value ? Number(e.target.value) : null)
                }
                disabled={submitting}
              >
                <option value="">Choose a class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            )}

            {audienceKind === 'users' && (
              <Input
                placeholder="Comma-separated user IDs, e.g. 12, 34, 56"
                value={audienceUsersRaw}
                onChange={(e) => setAudienceUsersRaw(e.target.value)}
                disabled={submitting}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="link">Link (optional)</Label>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-primary hover:underline"
                >
                  Preview <ExternalLink size={10} />
                </a>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/notifications"
                disabled={submitting}
              />
              <Select
                aria-label="Choose a quick link"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) setLink(e.target.value)
                  e.target.value = ''
                }}
                disabled={submitting}
              >
                <option value="">Quick link…</option>
                {QUICK_LINKS.map((q) => (
                  <option key={q.href} value={q.href}>{q.label} ({q.href})</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t border-border bg-muted/10 px-5 py-3">
          <Button type="submit" onClick={openConfirm} disabled={submitting || !isFormValid}>
            <Send size={14} /> Send broadcast
          </Button>
        </footer>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send broadcast?</DialogTitle>
            <DialogDescription>
              Delivery target: <strong>{audienceSummary()}</strong>. Cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-sm border border-border bg-muted/40 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {type}
              </span>
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-primary">
                {audienceSummary()}
              </span>
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{message}</p>
            {link && <p className="mt-2 text-xs font-medium text-brand-primary">→ {link}</p>}
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