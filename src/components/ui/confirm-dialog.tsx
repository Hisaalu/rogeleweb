'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  loading = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  loading?: boolean
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onOpenChange(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange, loading])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        style={{ backgroundColor: 'color-mix(in srgb, hsl(var(--background)) 80%, transparent)' }}
        onClick={() => !loading && onOpenChange(false)}
        aria-hidden="true"
      />
      <Card
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition hover:bg-muted disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <h3 className="mb-2 pr-8 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}