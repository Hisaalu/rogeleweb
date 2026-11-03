'use client'

import React, { useCallback, useState } from 'react'
import { Mail, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast-provider'
import {
  deleteCampaignClient,
  sendCampaignClient,
} from '@/lib/email-campaigns.client'
import type { EmailCampaign } from '@/types/email-campaign'
import { CampaignFormModal } from './campaign-form-modal'
import { CampaignPreviewModal } from './campaign-preview-modal'
import { CampaignLogsModal } from './campaign-logs-modal'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
})

function statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed': return 'success'
    case 'sending': return 'info'
    case 'failed': return 'danger'
    default: return 'default'
  }
}

function recipientLabel(t: string): string {
  return t.replace(/_/g, ' ')
}

const CampaignRow = React.memo(function CampaignRow({
  campaign,
  busy,
  onPreview,
  onLogs,
  onSend,
  onDelete,
}: {
  campaign: EmailCampaign
  busy: boolean
  onPreview: (c: EmailCampaign) => void
  onLogs: (c: EmailCampaign) => void
  onSend: (c: EmailCampaign) => void
  onDelete: (c: EmailCampaign) => void
}) {
  const canSend = campaign.status === 'draft'
  const canDelete = campaign.status === 'draft'

  return (
    <TableRow>
      <TableCell className="max-w-xs">
        <p className="truncate font-medium text-foreground">{campaign.subject}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">
          {recipientLabel(campaign.recipient_type)}
        </p>
      </TableCell>
      <TableCell className="text-muted-foreground">{campaign.total_recipients}</TableCell>
      <TableCell className="font-medium text-success-fg">{campaign.sent_count}</TableCell>
      <TableCell className="font-medium text-danger-fg">{campaign.failed_count}</TableCell>
      <TableCell>
        <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {dateFormatter.format(new Date(campaign.sent_at ?? campaign.created_at))}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap justify-end gap-1">
          <Button size="sm" variant="outline" onClick={() => onPreview(campaign)}>
            Preview
          </Button>
          <Button size="sm" variant="outline" onClick={() => onLogs(campaign)}>
            Logs
          </Button>
          {canSend && (
            <Button size="sm" onClick={() => onSend(campaign)} disabled={busy}>
              {busy ? 'Sending...' : 'Send'}
            </Button>
          )}
          {canDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-danger-fg hover:bg-danger-bg"
              onClick={() => onDelete(campaign)}
            >
              Delete
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
})

const MobileCampaignCard = React.memo(function MobileCampaignCard({
  campaign,
  busy,
  onPreview,
  onLogs,
  onSend,
  onDelete,
}: {
  campaign: EmailCampaign
  busy: boolean
  onPreview: (c: EmailCampaign) => void
  onLogs: (c: EmailCampaign) => void
  onSend: (c: EmailCampaign) => void
  onDelete: (c: EmailCampaign) => void
}) {
  const canSend = campaign.status === 'draft'
  const canDelete = campaign.status === 'draft'

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 last:border-0 hover:bg-muted/30">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col">
          <span className="font-medium text-foreground">{campaign.subject}</span>
          <span className="text-xs capitalize text-muted-foreground">
            {recipientLabel(campaign.recipient_type)}
          </span>
        </div>
        <Badge tone={statusTone(campaign.status)}>{campaign.status}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-medium">{campaign.total_recipients}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sent</p>
          <p className="font-medium text-success-fg">{campaign.sent_count}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="font-medium text-danger-fg">{campaign.failed_count}</p>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {dateFormatter.format(new Date(campaign.sent_at ?? campaign.created_at))}
        </span>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" onClick={() => onPreview(campaign)}>Preview</Button>
          <Button size="sm" variant="outline" onClick={() => onLogs(campaign)}>Logs</Button>
          {canSend && <Button size="sm" onClick={() => onSend(campaign)} disabled={busy}>{busy ? '...' : 'Send'}</Button>}
          {canDelete && (
            <Button size="sm" variant="outline" className="text-danger-fg hover:bg-danger-bg" onClick={() => onDelete(campaign)}>Delete</Button>
          )}
        </div>
      </div>
    </div>
  )
})

export function CampaignsView({
  initialCampaigns,
}: {
  initialCampaigns: EmailCampaign[]
}) {
  const { showToast } = useToast()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns)
  const [formOpen, setFormOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<EmailCampaign | null>(null)
  const [logsTarget, setLogsTarget] = useState<EmailCampaign | null>(null)
  const [sendTarget, setSendTarget] = useState<EmailCampaign | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmailCampaign | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  const handleCreated = useCallback((c: EmailCampaign) => {
    setCampaigns((list) => [c, ...list])
    showToast('Campaign saved as draft.', 'success')
  }, [showToast])

  const handleSend = useCallback(async () => {
    if (!sendTarget) return
    setBusyId(sendTarget.id)
    try {
      const res = await sendCampaignClient(sendTarget.id)
      setCampaigns((list) =>
        list.map((c) =>
          c.id === sendTarget.id
            ? { ...c, status: 'sending', total_recipients: res.queued_count, sent_at: new Date().toISOString() }
            : c,
        ),
      )
      showToast(`Campaign queued for ${res.queued_count} recipients.`, 'success')
      setSendTarget(null)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send', 'error')
    } finally {
      setBusyId(null)
    }
  }, [sendTarget, showToast])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteCampaignClient(deleteTarget.id)
      setCampaigns((list) => list.filter((c) => c.id !== deleteTarget.id))
      showToast('Campaign deleted.', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteTarget, showToast])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Send Emails</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send emails to your users.
          </p>
        </div>

        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} /> New email
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No campaigns yet"
          description="Create your first campaign to get started."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} /> New campaign
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden shadow-sm">
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {['Subject', 'Recipients', 'Sent', 'Failed', 'Status', 'Date', ''].map((h, i) => (
                    <TableHead key={i} className={i === 6 ? 'w-12 text-right' : ''}>
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <CampaignRow
                    key={c.id}
                    campaign={c}
                    busy={busyId === c.id}
                    onPreview={setPreviewTarget}
                    onLogs={setLogsTarget}
                    onSend={setSendTarget}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:hidden">
            {campaigns.map((c) => (
              <MobileCampaignCard
                key={c.id}
                campaign={c}
                busy={busyId === c.id}
                onPreview={setPreviewTarget}
                onLogs={setLogsTarget}
                onSend={setSendTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </Card>
      )}

      <CampaignFormModal open={formOpen} onOpenChange={setFormOpen} onCreated={handleCreated} />
      <CampaignPreviewModal campaign={previewTarget} onClose={() => setPreviewTarget(null)} />
      <CampaignLogsModal campaign={logsTarget} onClose={() => setLogsTarget(null)} />

      <ConfirmDialog
        open={sendTarget !== null}
        onOpenChange={(o) => !o && setSendTarget(null)}
        title="Send campaign"
        description={sendTarget ? `Queue "${sendTarget.subject}" for delivery? Emails will start sending within seconds.` : ''}
        confirmLabel="Send now"
        loading={busyId !== null}
        onConfirm={handleSend}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete campaign"
        description={deleteTarget ? `Remove draft "${deleteTarget.subject}"?` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}