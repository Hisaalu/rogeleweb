'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
}

const TONE_STYLE: Record<ToastTone, { bg: string; fg: string; icon: typeof Info }> = {
  success: { bg: '#23a74c', fg: '#ffffff', icon: CheckCircle2 },
  error: { bg: '#EF4444', fg: '#ffffff', icon: XCircle },
  info: { bg: 'var(--brand-primary)', fg: '#ffffff', icon: Info },
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage
  onClose: (id: number) => void
}) {
  const style = TONE_STYLE[toast.tone]
  const Icon = style.icon

  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 3000)
    return () => clearTimeout(t)
  }, [toast.id, onClose])

  return (
    <div
      className="pointer-events-auto flex min-w-[300px] items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-top-2 fade-in"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <Icon size={16} />
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss"
        className="opacity-80 transition hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: ToastMessage[]
  onClose: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[9999] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  )
}