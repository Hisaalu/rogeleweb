'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { listCampaignLogsClient } from '@/lib/email-campaigns.client'
import type { EmailCampaign, EmailLog } from '@/types/email-campaign'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
})

export function CampaignLogsModal({
  campaign, onClose,
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
          <DialogDescription>{campaign ? `For "${campaign.subject}"` : ''}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-sm border border-danger-border/40 bg-danger-bg px-3 py-2 text-sm text-danger-fg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> Loading logs...
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No delivery logs yet"
            description="Once the campaign is sent, per-recipient status will appear here."
          />
        ) : (
          <div className="max-h-[420px] overflow-y-auto rounded-sm border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {['Recipient', 'Status', 'Sent at', 'Error'].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <p className="truncate text-foreground">{l.recipient_email}</p>
                      {l.recipient_name && (
                        <p className="truncate text-xs text-muted-foreground">{l.recipient_name}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge tone={l.status === 'sent' ? 'success' : l.status === 'failed' ? 'danger' : 'warning'}>
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.sent_at ? dateFormatter.format(new Date(l.sent_at)) : '—'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-danger-fg">
                      {l.error_message ?? ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}