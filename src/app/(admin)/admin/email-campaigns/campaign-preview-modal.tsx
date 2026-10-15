'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { previewCampaignClient } from '@/lib/email-campaigns.client'
import type { EmailCampaign, PreviewResponse } from '@/types/email-campaign'

export function CampaignPreviewModal({
  campaign,
  onClose,
}: {
  campaign: EmailCampaign | null
  onClose: () => void
}) {
  const [email, setEmail] = useState('sample@example.com')
  const [name, setName] = useState('Sample')
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setPreview(null)
    setError(null)
    setLoading(true)
    previewCampaignClient(campaign.id, { sample_email: email, sample_name: name })
      .then(setPreview)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to preview'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign])

  async function handleRefresh() {
    if (!campaign) return
    setLoading(true)
    setError(null)
    try {
      const res = await previewCampaignClient(campaign.id, {
        sample_email: email,
        sample_name: name,
      })
      setPreview(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to preview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={campaign !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>
            {campaign ? `Rendered for ${email}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="preview_email">Sample email</Label>
            <Input
              id="preview_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preview_name">Sample name</Label>
            <Input
              id="preview_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading preview...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Subject
              </p>
              <p className="mt-0.5 text-sm font-semibold">{preview.subject}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Will be sent to {preview.recipient_count} recipient
                {preview.recipient_count === 1 ? '' : 's'}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-4">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}