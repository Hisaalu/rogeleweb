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
    <div className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:h-[70px] sm:px-6 lg:px-8">
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <h1 className="min-w-0 flex-1 truncate text-center text-base font-bold text-foreground sm:text-lg">
        {title}
      </h1>

      <div className="flex shrink-0 items-center justify-end">
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