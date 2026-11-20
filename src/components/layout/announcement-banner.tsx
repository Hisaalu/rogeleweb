'use client'

import Link from 'next/link'
import { Megaphone, ArrowRight, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Substitutions {
  FirstName?: string
  LastName?: string
  Email?: string
  [key: string]: string | undefined
}

function interpolate(
  template: string,
  values: Record<string, string | undefined>,
): string {
  return template.replace(/\{\{\s*\.?(\w+)\s*\}\}/g, (_, key: string) => {
    const v = values[key]
    return v !== undefined && v !== '' ? v : `{{.${key}}}`
  })
}

export function AnnouncementBanner({
  title,
  message,
  ctaLabel,
  ctaLink,
  variant = 'default',
  id,
  substitutions,
}: {
  title?: string
  message: string
  ctaLabel?: string
  ctaLink?: string
  variant?: 'default' | 'brand'
  id: string
  substitutions?: Substitutions
}) {
  const [dismissed, setDismissed] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storageKey = `dismissed_announcement_${id}`
    const isDismissed = localStorage.getItem(storageKey) === 'true'
    setDismissed(isDismissed)
  }, [id])

  function handleDismiss() {
    const storageKey = `dismissed_announcement_${id}`
    localStorage.setItem(storageKey, 'true')
    setDismissed(true)
  }

  if (!mounted || dismissed) return null

  const isBrand = variant === 'brand'
  const finalTitle = title ? interpolate(title, substitutions ?? {}) : undefined
  const finalMessage = interpolate(message, substitutions ?? {})

  return (
    <div
      className="relative flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-6"
      style={{
        backgroundColor: isBrand
          ? 'color-mix(in srgb, var(--brand-primary) 10%, transparent)'
          : 'hsl(var(--muted))',
        borderBottom: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: isBrand
              ? 'var(--brand-primary)'
              : 'hsl(var(--muted-foreground))',
            color: 'white',
          }}
        >
          <Megaphone size={14} />
        </div>
        <div className="min-w-0">
          {finalTitle && (
            <p className="text-sm font-semibold text-foreground">{finalTitle}</p>
          )}
          <p className="text-xs text-muted-foreground sm:text-sm">
            {finalMessage}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {ctaLabel && ctaLink && (
          <Link
            href={ctaLink}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition hover:opacity-90 sm:text-sm"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
            }}
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </Link>
        )}

        <button
          onClick={handleDismiss}
          className="ml-2 rounded-full p-1.5 text-muted-foreground transition hover:bg-black/10"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}