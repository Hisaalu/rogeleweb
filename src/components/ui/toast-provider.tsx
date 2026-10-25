'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ToastViewport, type ToastMessage, type ToastTone } from './toast'

interface ToastContextValue {
  showToast: (
    message: string,
    tone?: ToastTone,
    options?: { title?: string; duration?: number },
  ) => number
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextId = useRef(1)

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback<ToastContextValue['showToast']>(
    (message, tone = 'info', options) => {
      const id = nextId.current++
      const toast: ToastMessage = {
        id,
        message,
        tone,
        title: options?.title,
        duration: options?.duration,
      }
      setToasts((prev) => [toast, ...prev].slice(0, 4))
      return id
    },
    [],
  )

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}