'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import { createCampaignClient } from '@/lib/email-campaigns.client'
import type { EmailCampaign, RecipientType } from '@/types/email-campaign'

function plainTextToHtml(text: string): string {
  const paragraphs = text.split(/\n{2,}/)
  return paragraphs
    .map((p) => p.replace(/\n/g, '<br>\n'))
    .map((p) => `<p>${p}</p>`)
    .join('\n')
}

export function CampaignFormModal({
  open, onOpenChange, onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (c: EmailCampaign) => void
}) {
  const { showToast } = useToast()
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

  const parsedEmails = useMemo(() => {
    if (recipientType !== 'custom_emails') return []
    return customEmails.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  }, [customEmails, recipientType])

  function handleFormatText() {
    if (!body.trim()) {
      showToast('Write some text first', 'error')
      return
    }
    if (/<[a-z][\s\S]*>/i.test(body)) {
      showToast('Body already contains HTML tags', 'info')
      return
    }
    setBody(plainTextToHtml(body))
    showToast('Converted plain text to HTML', 'success')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!subject.trim()) return setError('Subject is required')
    if (!body.trim()) return setError('Body is required')

    let emails: string[] | undefined
    if (recipientType === 'custom_emails') {
      emails = parsedEmails
      if (emails.length === 0) return setError('Add at least one email address')
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
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error')
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

        <Card className="border-none shadow-none">
          <CardContent className="p-0">
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
                  Templates support <code>{'{{.FirstName}}'}</code>,{' '}
                  <code>{'{{.FullName}}'}</code>, and <code>{'{{.Email}}'}</code>.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body (HTML)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFormatText}
                      disabled={submitting || !body.trim()}
                    >
                      <Wand2 size={14} className="mr-1" />
                      Format text
                    </Button>
                    <span className="text-[10px] text-muted-foreground">
                      {body.length} chars
                    </span>
                  </div>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={'<h2>Hello {{.FirstName}}</h2>\n\n<p>Welcome to ROGELE.</p>\n\n<p>See you soon!</p>'}
                  rows={10}
                  className="font-mono text-xs"
                  disabled={submitting}
                />
                <p className="text-xs text-muted-foreground">
                  Newlines in HTML collapse to a single space. Use <code>&lt;br&gt;</code> or
                  paragraphs <code>&lt;p&gt;</code>, or click <strong>Format text</strong> to
                  auto-convert your plain text.
                </p>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emails">Email addresses</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {parsedEmails.length} email{parsedEmails.length === 1 ? '' : 's'}
                    </span>
                  </div>
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
                <div className="rounded-sm border border-danger-border/40 bg-danger-bg px-3 py-2 text-sm text-danger-fg">
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 size={14} className="animate-spin" />} Save as draft
                </Button>
              </DialogFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}