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

  // State for specific user selection
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]) // Store the whole object so we can show badges even if filtered out
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      setSubject('')
      setBody('')
      setRecipientType('all_users')
      setCustomEmails('')
      setError(null)
      setSelectedUsers([])
      setUserSearch('')
    }
  }, [open])

  // Fetch users from server based on the search term
  useEffect(() => {
    if (recipientType !== 'specific_users') return
    
    // Debounce the search so we don't spam the API on every keystroke
    const timer = setTimeout(() => {
      setLoadingUsers(true)
      listUsersClient({ per_page: 50, q: userSearch })
        .then((res) => {
          setUsers(res.users || [])
        })
        .catch(() => showToast('Failed to load users', 'error'))
        .finally(() => setLoadingUsers(false))
    }, 300)

    return () => clearTimeout(timer)
  }, [recipientType, userSearch, showToast])

  const parsedEmails = useMemo(() => {
    if (recipientType !== 'custom_emails') return []
    return customEmails.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  }, [customEmails, recipientType])

  const toggleUser = (u: AdminUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((x) => x.id === u.id)
      if (exists) {
        return prev.filter((x) => x.id !== u.id)
      }
      return [...prev, u]
    })
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
      recipientIds = selectedUsers.map((u) => u.id)
      if (recipientIds.length === 0) return setError('Select at least one user')
    }

    setSubmitting(true)
    try {
      const created = await createCampaignClient({
        subject: subject.trim(),
        body: body.trim(),
        recipient_type: recipientType,
        custom_emails: emails,
        // @ts-ignore - Assuming your backend accepts this
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
              {/* ... Subject and Body fields remain unchanged ... */}
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
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">Body (HTML)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFormatText}
                    disabled={submitting || !body.trim()}
                  >
                    <Wand2 size={14} className="mr-1" /> Format
                  </Button>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
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
                  <option value="specific_users">Specific Users (Search system)</option>
                </Select>
              </div>

              {recipientType === 'custom_emails' && (
                <div className="space-y-1.5">
                  <Label>Email addresses</Label>
                  <Textarea
                    value={customEmails}
                    onChange={(e) => setCustomEmails(e.target.value)}
                    placeholder="one@example.com, two@example.com..."
                    rows={4}
                  />
                </div>
              )}

              {recipientType === 'specific_users' && (
                <div className="space-y-2 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between">
                    <Label>Selected Users</Label>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {selectedUsers.length} selected
                    </span>
                  </div>
                  
                  {/* Render Selected Badges */}
                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-1 pb-2">
                      {selectedUsers.map((u) => (
                        <Badge key={u.id} tone="info" className="flex items-center gap-1 pr-1">
                          {u.email}
                          <button
                            type="button"
                            onClick={() => toggleUser(u)}
                            className="ml-1 rounded-full p-0.5 hover:bg-black/10"
                          >
                            <X size={10} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Type to search database..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-8"
                      disabled={submitting}
                    />
                  </div>

                  <div className="mt-2 max-h-48 overflow-y-auto rounded border border-border">
                    {loadingUsers ? (
                      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                        <Loader2 size={14} className="mr-2 animate-spin" /> Searching...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No users found matching "{userSearch}".
                      </div>
                    ) : (
                      users.map((u) => {
                        const isSelected = selectedUsers.some((x) => x.id === u.id)
                        return (
                          <label
                            key={u.id}
                            className="flex cursor-pointer items-center gap-3 border-b border-border p-2.5 last:border-0 hover:bg-muted/50"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUser(u)}
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
                        )
                      })
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
                  {submitting && <Loader2 size={14} className="animate-spin mr-2" />} Save draft
                </Button>
              </DialogFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}