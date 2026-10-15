'use client'

import { useState } from 'react'
import { Mail, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { useBranding } from '@/components/brand/brand-provider'
import { formatDate } from '@/lib/utils'
import {
  deleteCampaignClient,
  sendCampaignClient,
} from '@/lib/email-campaigns.client'
import type { EmailCampaign } from '@/types/email-campaign'
import { CampaignFormModal } from './campaign-form-modal'
import { CampaignPreviewModal } from './campaign-preview-modal'
import { CampaignLogsModal } from './campaign-logs-modal'

function statusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'sending':
      return 'info'
    case 'failed':
      return 'danger'
    default:
      return 'default'
  }
}

function recipientLabel(t: string): string {
  return t.replace(/_/g, ' ')
}

export function CampaignsView({
  initialCampaigns,
}: {
  initialCampaigns: EmailCampaign[]
}) {
  const branding = useBranding()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns)
  const [formOpen, setFormOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<EmailCampaign | null>(null)
  const [logsTarget, setLogsTarget] = useState<EmailCampaign | null>(null)
  const [sendTarget, setSendTarget] = useState<EmailCampaign | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmailCampaign | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function handleCreated(c: EmailCampaign) {
    setCampaigns((list) => [c, ...list])
  }

  async function handleSend() {
    if (!sendTarget) return
    setBusyId(sendTarget.id)
    setError(null)
    try {
      const res = await sendCampaignClient(sendTarget.id)
      setCampaigns((list) =>
        list.map((c) =>
          c.id === sendTarget.id
            ? {
                ...c,
                status: 'sending',
                total_recipients: res.queued_count,
                sent_at: new Date().toISOString(),
              }
            : c,
        ),
      )
      setSendTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCampaignClient(deleteTarget.id)
      setCampaigns((list) => list.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Email campaigns</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compose and send bulk emails to user groups.
          </p>
        </div>

        <Button
          onClick={() => setFormOpen(true)}
          style={{ backgroundColor: branding.colorPrimary }}
        >
          <Plus size={16} />
          New campaign
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {campaigns.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No campaigns yet"
          description="Create your first campaign to get started."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus size={16} />
              New campaign
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {['Subject', 'Recipients', 'Sent', 'Failed', 'Status', 'Date', ''].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => {
                const busy = busyId === c.id
                const canSend = c.status === 'draft'
                const canDelete = c.status === 'draft'
                return (
                  <tr key={c.id} className="transition hover:bg-muted/30">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium">{c.subject}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {recipientLabel(c.recipient_type)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.total_recipients}
                    </td>
                    <td className="px-4 py-3 text-green-600">{c.sent_count}</td>
                    <td className="px-4 py-3 text-red-600">{c.failed_count}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(c.sent_at ?? c.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewTarget(c)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setLogsTarget(c)}
                        >
                          Logs
                        </Button>
                        {canSend && (
                          <Button
                            size="sm"
                            onClick={() => setSendTarget(c)}
                            disabled={busy}
                          >
                            {busy ? 'Sending...' : 'Send'}
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(c)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <CampaignFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={handleCreated}
      />

      <CampaignPreviewModal
        campaign={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <CampaignLogsModal
        campaign={logsTarget}
        onClose={() => setLogsTarget(null)}
      />

      <ConfirmDialog
        open={sendTarget !== null}
        onOpenChange={(o) => !o && setSendTarget(null)}
        title="Send campaign"
        description={
          sendTarget
            ? `Queue "${sendTarget.subject}" for delivery? Emails will start sending within seconds.`
            : ''
        }
        confirmLabel="Send now"
        onConfirm={handleSend}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete campaign"
        description={
          deleteTarget ? `Remove draft "${deleteTarget.subject}"?` : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}