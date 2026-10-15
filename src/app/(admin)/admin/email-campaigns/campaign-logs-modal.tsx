'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { listCampaignLogsClient } from '@/lib/email-campaigns.client'
import { formatDate } from '@/lib/utils'
import type { EmailCampaign, EmailLog } from '@/types/email-campaign'

export function CampaignLogsModal({
  campaign,
  onClose,
}: {
  campaign: EmailCampaign | null
  onClose: () => void
}) {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaign) return
    setLoading(true)
    setError(null)
    listCampaignLogsClient(campaign.id, { per_page: 200 })
      .then(setLogs)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load logs'))
      .finally(() => setLoading(false))
  }, [campaign])

  return (
    <Dialog open={campaign !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Delivery logs</DialogTitle>
          <DialogDescription>
            {campaign ? `For "${campaign.subject}"` : ''}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No delivery logs yet"
            description="Once the campaign is sent, per-recipient status will appear here."
          />
        ) : (
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/40">
                <tr>
                  {['Recipient', 'Status', 'Sent at', 'Error'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-3 py-2">
                      <p className="truncate">{l.recipient_email}</p>
                      {l.recipient_name && (
                        <p className="truncate text-xs text-muted-foreground">
                          {l.recipient_name}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge
                        tone={
                          l.status === 'sent'
                            ? 'success'
                            : l.status === 'failed'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {l.sent_at ? formatDate(l.sent_at) : '—'}
                    </td>
                    <td className="max-w-[240px] truncate px-3 py-2 text-xs text-destructive">
                      {l.error_message ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}