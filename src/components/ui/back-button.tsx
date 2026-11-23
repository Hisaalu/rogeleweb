'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton({ fallbackHref = '/teacher/lessons' }: { fallbackHref?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back()
        } else {
          router.push(fallbackHref)
        }
      }}
      aria-label="Go back"
      className="inline-flex items-center gap-1.5 rounded-full p-1.5 text-2xl font-bold text-foreground transition hover:bg-muted hover:opacity-100 sm:text-3xl"
    >
      <ArrowLeft size={26} className="shrink-0" />
      <span className="sr-only">Go back</span>
    </button>
  )
}