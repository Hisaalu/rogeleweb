'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Wand2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast-provider'
import { createCampaignClient } from '@/lib/email-campaigns.client'
import { listUsersClient } from '@/lib/users.client'
import type { EmailCampaign, RecipientType } from '@/types/email-campaign'
import type { AdminUser } from '@/types/admin'

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

  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      setSubject('')
      setBody('')
      setRecipientType('all_users')
      setCustomEmails('')
      setError(null)
      setSelectedUserIds([])
      setUserSearch('')
    }
  }, [open])

  useEffect(() => {
    if (recipientType === 'specific_users' && users.length === 0) {
      setLoadingUsers(true)
      listUsersClient({ per_page: 1000 }) 
        .then((res) => {
          setUsers(res.users || [])
        })
        .catch(() => showToast('Failed to load users', 'error'))
        .finally(() => setLoadingUsers(false))
    }
  }, [recipientType, users.length, showToast])

  const parsedEmails = useMemo(() => {
    if (recipientType !== 'custom_emails') return []
    return customEmails.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  }, [customEmails, recipientType])

  const filteredUsers = useMemo(() => {
    if (!userSearch) return users
    const q = userSearch.toLowerCase()
    return users.filter((u) => {
      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase()
      return (
        name.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
    })
  }, [users, userSearch])

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    )
  }

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
    let recipientIds: number[] | undefined

    if (recipientType === 'custom_emails') {
      emails = parsedEmails
      if (emails.length === 0) return setError('Add at least one email address')
    } else if (recipientType === 'specific_users') {
      recipientIds = selectedUserIds
      if (recipientIds.length === 0) return setError('Select at least one user')
    }

    setSubmitting(true)
    try {
      const created = await createCampaignClient({
        subject: subject.trim(),
        body: body.trim(),
        recipient_type: recipientType,
        custom_emails: emails,
        recipient_ids: recipientIds, 
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <option value="specific_users">Specific Users (Select from system)</option>
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

              {recipientType === 'specific_users' && (
                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label>Select Users</Label>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {selectedUserIds.length} selected
                    </span>
                  </div>
                  
                  {selectedUserIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 pb-2">
                      {selectedUserIds.map((id) => {
                        const u = users.find((x) => x.id === id)
                        if (!u) return null
                        return (
                          <Badge key={id} tone="info" className="flex items-center gap-1 pr-1">
                            {u.email}
                            <button
                              type="button"
                              onClick={() => toggleUser(id)}
                              className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                            >
                              <X size={10} />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8"
                      disabled={submitting}
                    />
                  </div>

                  <div className="mt-2 max-h-48 overflow-y-auto rounded border border-border">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        <Loader2 size={14} className="mr-2 animate-spin" /> Loading users...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No users found.
                      </div>
                    ) : (
                      filteredUsers.map((u) => (
                        <label
                          key={u.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-border p-2.5 last:border-0 hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={() => toggleUser(u.id)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {`${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed User'}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                          </div>
                          <span className="shrink-0 text-[10px] capitalize text-muted-foreground">
                            {u.role}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
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
                  {submitting && <Loader2 size={14} className="animate-spin mr-2" />} Save as draft
                </Button>
              </DialogFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}