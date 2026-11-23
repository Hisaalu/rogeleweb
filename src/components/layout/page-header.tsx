'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { usePageHeader, type ActivePageHeader } from './page-header-context'

export function PageHeaderBar({
  title,
  fallbackHref,
  action,
}: ActivePageHeader) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else if (fallbackHref) {
      router.push(fallbackHref)
    }
  }

  return (
    <div className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 dark:bg-background/60 sm:h-[70px] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/20"
      />

      <div className="relative flex shrink-0 items-center">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/40 text-foreground ring-1 ring-inset ring-white/20 transition hover:bg-muted/80"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <h1 className="relative min-w-0 flex-1 truncate text-center text-base font-bold text-foreground sm:text-lg">
        {title}
      </h1>

      <div className="relative flex shrink-0 items-center justify-end">
        {action}
      </div>
    </div>
  )
}

export function PageHeader({ title, fallbackHref, action }: ActivePageHeader) {
  const { setHeader } = usePageHeader()

  useEffect(() => {
    setHeader({ title, fallbackHref, action })
    return () => setHeader(null)
  }, [title, fallbackHref, action, setHeader])

  return null
}