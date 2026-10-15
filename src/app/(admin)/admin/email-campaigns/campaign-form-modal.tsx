'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createCampaignClient } from '@/lib/email-campaigns.client'
import type { EmailCampaign, RecipientType } from '@/types/email-campaign'

export function CampaignFormModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (c: EmailCampaign) => void
}) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [recipientType, setRecipientType] = useState<RecipientType>('all_users')
  const [customEmails, setCustomEmails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSubject('')
      setBody('')
      setRecipientType('all_users')
      setCustomEmails('')
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!body.trim()) {
      setError('Body is required')
      return
    }

    let emails: string[] | undefined
    if (recipientType === 'custom_emails') {
      emails = customEmails
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean)
      if (emails.length === 0) {
        setError('Add at least one email address')
        return
      }
    }

    setSubmitting(true)
    try {
      const created = await createCampaignClient({
        subject: subject.trim(),
        body: body.trim(),
        recipient_type: recipientType,
        custom_emails: emails,
      })
      onCreated(created)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Hi {{.FirstName}}, welcome!"
              autoFocus
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Templates support <code>{'{{.FirstName}}'}</code>, <code>{'{{.FullName}}'}</code>, and <code>{'{{.Email}}'}</code>.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Body (HTML)</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="<h2>Hello {{.FirstName}}</h2><p>...</p>"
              rows={10}
              className="font-mono text-xs"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient_type">Recipients</Label>
            <Select
              id="recipient_type"
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as RecipientType)}
              disabled={submitting}
            >
              <option value="all_users">All users</option>
              <option value="teachers">Teachers only</option>
              <option value="learners">Learners only</option>
              <option value="external">External users only</option>
              <option value="admins">Admins only</option>
              <option value="custom_emails">Custom email addresses</option>
            </Select>
          </div>

          {recipientType === 'custom_emails' && (
            <div className="space-y-1.5">
              <Label htmlFor="emails">Email addresses</Label>
              <Textarea
                id="emails"
                value={customEmails}
                onChange={(e) => setCustomEmails(e.target.value)}
                placeholder="one@example.com, two@example.com&#10;or one per line"
                rows={5}
                disabled={submitting}
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Save as draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}