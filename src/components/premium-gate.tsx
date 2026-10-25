'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AccessReason } from '@/lib/access'

const GATE_COPY: Record<Exclude<AccessReason, 'ok'>, {
  title: string
  description: string
  upgradeLabel: string
  dismissLabel: string
}> = {
  trial_expired: {
    title: 'Unlock detailed lesson view with Premium',
    description:
      'Only Premium subscribers have access to detailed lesson view and downloadable files. Upgrade to continue.',
    upgradeLabel: 'Upgrade',
    dismissLabel: 'Maybe later',
  },
  no_plan: {
    title: 'Unlock detailed lesson view with Premium',
    description:
      'Only Premium subscribers have access to detailed lesson view and downloadable files. Upgrade to continue.',
    upgradeLabel: 'Upgrade',
    dismissLabel: 'Maybe later',
  },
}

export interface PremiumGateProps {
  open: boolean
  reason: Exclude<AccessReason, 'ok'>
  upgradeHref?: string
  onDismiss?: () => void
  className?: string
}

export function PremiumGate({
  open,
  reason,
  upgradeHref = '/learner/subscription',
  onDismiss,
  className,
}: PremiumGateProps) {
  const [dismissed, setDismissed] = useState(false)
  const copy = GATE_COPY[reason]

  const isOpen = open && !dismissed

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) handleDismiss()
      }}
    >
      <DialogContent
        hideClose
        overlayClassName="bg-background/60 backdrop-blur-sm"
        className={[
          'fixed left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 w-full max-w-none rounded-t-2xl rounded-b-none border-x-0 border-b-0',
          'sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-md sm:rounded-2xl sm:border',
          'max-h-[85vh] overflow-y-auto p-0',
          className ?? '',
        ].join(' ')}
      >
        <div className="flex flex-col gap-5 p-6">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--warning-bg)' }}
              aria-hidden
            >
              <Lock size={20} style={{ color: 'var(--warning-fg)' }} />
            </div>
            <div className="flex flex-col gap-1 pt-0.5">
              <DialogTitle className="text-lg font-bold text-foreground">
                {copy.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {copy.description}
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
            >
              {copy.dismissLabel}
            </button>
            <Link
              href={upgradeHref}
              onClick={handleDismiss}
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--brand-accent)' }}
            >
              {copy.upgradeLabel}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}