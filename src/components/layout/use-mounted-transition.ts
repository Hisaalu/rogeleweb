'use client'

import { useEffect, useState } from 'react'

export function useMountTransition(open: boolean, duration = 300) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const t = window.setTimeout(() => setMounted(false), duration)
    return () => window.clearTimeout(t)
  }, [open, duration])

  return mounted
}