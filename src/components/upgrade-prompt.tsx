'use client'

import Link from 'next/link'
import { Lock, Sparkles } from 'lucide-react'

export function UpgradePrompt({
  title = 'Subscription Required',
  description = 'Your free trial has ended or you don\'t have an active plan. Please subscribe to access this feature and continue your learning journey.',
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--warning-bg)' }}
      >
        <Lock size={32} style={{ color: 'var(--warning-fg)' }} />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        {description}
      </p>

      <Link
        href="/learner/subscription"
        className="mt-8 flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: 'var(--brand-accent)' }}
      >
        <Sparkles size={16} />
        Click to Select a Plan
      </Link>
    </div>
  )
}