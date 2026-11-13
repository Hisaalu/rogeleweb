'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { previewCampaignClient } from '@/lib/email-campaigns.client'
import type { EmailCampaign, PreviewResponse } from '@/types/email-campaign'

function rewriteLinks(html: string): string {
  return html.replace(
    /<a\s+(?![^>]*\btarget=)([^>]*)>/gi,
    '<a $1 target="_blank" rel="noopener noreferrer">',
  )
}

export function CampaignPreviewModal({
  campaign, onClose,
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
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      previewCampaignClient(campaign.id, { sample_email: email, sample_name: name })
        .then(setPreview)
        .catch((e) => setError(e instanceof Error ? e.message : 'Failed to preview'))
        .finally(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [campaign, email, name])

  const iframeSrcDoc = useMemo(() => {
    if (!preview) return ''
    return `<!DOCTYPE html>
<html>
<head>
<base target="_blank">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.55;
    color: #111827;
    background: #ffffff;
  }
  a { color: #7f2677; text-decoration: underline; }
  a:hover { color: #f06724; }
  img { max-width: 100%; height: auto; }
  h1, h2, h3, h4 { margin: 16px 0 8px; }
  p { margin: 8px 0; }
  ul, ol { padding-left: 20px; }
  hr { border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0; }
</style>
</head>
<body>${rewriteLinks(preview.html)}</body>
</html>`
  }, [preview])

  return (
    <Dialog open={campaign !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
          <DialogDescription>{campaign ? `Rendered for ${email}` : ''}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="preview_email">Sample email</Label>
            <Input
              id="preview_email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preview_name">Sample name</Label>
            <Input
              id="preview_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-sm border border-danger-border/40 bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </div>
        )}

        {loading && !preview ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading preview...
          </div>
        ) : preview ? (
          <div className="space-y-3">
            <div className="rounded-sm border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Subject</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{preview.subject}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Will be sent to {preview.recipient_count} recipient{preview.recipient_count === 1 ? '' : 's'}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-sm border border-border bg-white">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                  <Loader2 size={20} className="animate-spin text-brand-primary" />
                </div>
              )}
              <iframe
                title="Email preview"
                srcDoc={iframeSrcDoc}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="h-[320px] w-full border-0 sm:h-[420px]"
              />
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ExternalLink size={12} /> Links in the preview open in a new tab.
            </p>
          </div>
        ) : null}

        <DialogFooter className="flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}