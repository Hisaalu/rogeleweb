'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  message: string
  tone: ToastTone
  title?: string
  duration?: number
}

const DEFAULT_DURATION = 3000

const TONE: Record<
  ToastTone,
  {
    surface: string
    border: string
    accent: string
    iconFg: string
    icon: typeof Info
    live: 'polite' | 'assertive'
    role: 'status' | 'alert'
  }
> = {
  success: {
    surface: 'bg-success-bg',
    border: 'border-success-border/40',
    accent: 'bg-success-border',
    iconFg: 'text-success-fg',
    icon: CheckCircle2,
    live: 'polite',
    role: 'status',
  },
  error: {
    surface: 'bg-danger-bg',
    border: 'border-danger-border/40',
    accent: 'bg-danger-border',
    iconFg: 'text-danger-fg',
    icon: XCircle,
    live: 'assertive',
    role: 'alert',
  },
  info: {
    surface: 'bg-brand-primary/10',
    border: 'border-brand-primary/30',
    accent: 'bg-brand-accent',
    iconFg: 'text-brand-accent',
    icon: Info,
    live: 'polite',
    role: 'status',
  },
}

export function Toast({
  toast,
  onClose,
}: {
  toast: ToastMessage
  onClose: (id: number) => void
}) {
  const tone = TONE[toast.tone]
  const Icon = tone.icon
  const duration = toast.duration ?? DEFAULT_DURATION
  const barRef = useRef<HTMLDivElement>(null)
  const remainingRef = useRef(duration)
  const startRef = useRef(0)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let raf = 0
    let paused = false

    const tick = () => {
      if (paused) return
      const elapsed = performance.now() - startRef.current
      const remaining = Math.max(remainingRef.current - elapsed, 0)
      const pct = duration > 0 ? (remaining / duration) * 100 : 0
      bar.style.width = `${pct}%`
      if (remaining <= 0) {
        onClose(toast.id)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const pause = () => {
      if (paused) return
      paused = true
      remainingRef.current = Math.max(
        remainingRef.current - (performance.now() - startRef.current),
        0,
      )
      cancelAnimationFrame(raf)
      bar.style.animationPlayState = 'paused'
    }

    const resume = () => {
      if (!paused) return
      paused = false
      startRef.current = performance.now()
      raf = requestAnimationFrame(tick)
      bar.style.animationPlayState = 'running'
    }

    const onVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }

    startRef.current = performance.now()
    raf = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [toast.id, duration, onClose])

  return (
    <div
      role={tone.role}
      aria-live={tone.live}
      aria-atomic="true"
      className={[
        'pointer-events-auto relative flex w-[calc(100vw-1.5rem)] max-w-sm items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md',
        'animate-in slide-in-from-top-2 fade-in',
        tone.surface,
        tone.border,
      ].join(' ')}
    >
      <span
        aria-hidden
        className={['absolute inset-y-0 left-0 w-1', tone.accent].join(' ')}
      />

      <Icon size={16} className={['mt-0.5 shrink-0', tone.iconFg].join(' ')} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {toast.title && (
          <p className="truncate text-sm font-semibold text-foreground">
            {toast.title}
          </p>
        )}
        <p className="text-sm leading-snug text-foreground/90">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
        className="-mr-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
      >
        <X size={14} />
      </button>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-foreground/5"
      >
        <div
          ref={barRef}
          className={['h-full', tone.accent].join(' ')}
          style={{ width: '100%' }}
        />
      </div>
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
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-2 px-3 sm:top-6"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  )
}