'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [isPending, startTransition] = useTransition()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const timers = useRef<number[]>([])
  const isFirstRender = useRef(true)

  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }

  useEffect(() => {
    if (isPending) {
      clearTimers()
      setVisible(true)
      setProgress(10)

      const t0 = window.setTimeout(() => setProgress(20), 80)
      const t1 = window.setTimeout(() => setProgress(45), 250)
      const t2 = window.setTimeout(() => setProgress(70), 700)
      const t3 = window.setTimeout(() => setProgress(88), 1400)
      timers.current.push(t0, t1, t2, t3)
    }
  }, [isPending])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    if (!isPending && visible) {
      clearTimers()
      setProgress(100)
      
      const done = window.setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 250)
      timers.current.push(done)
    }
  }, [isPending, visible, pathname, searchParams])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      
      if (!anchor) return
      if (anchor.hasAttribute('data-no-progress')) return
      
      const href = anchor.getAttribute('href')
      if (!href) return
      if (href.startsWith('#')) return
      if (anchor.target && anchor.target !== '_self') return

      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return
        }

        e.preventDefault()
        startTransition(() => {
          router.push(href)
        })
      } catch {
        return
      }
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease' }}
    >
      <div
        className="h-full origin-left"
        style={{
          width: `${progress}%`,
          backgroundColor: 'var(--brand-accent)',
          boxShadow: '0 0 8px var(--brand-accent)',
          transition: 'width 300ms ease',
        }}
      />
    </div>
  )
}