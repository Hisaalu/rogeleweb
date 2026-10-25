'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useToast } from '@/components/ui/toast-provider'

export function ErrorToaster() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const hasFired = useRef(false)

  const error = searchParams.get('error')

  useEffect(() => {
    if (!error || hasFired.current) return
    hasFired.current = true

    let message = 'An error occurred.'
    if (error === 'not_found') {
      message = 'This item has been removed or no longer exists.'
    }

    showToast(message, 'error', { title: 'Not Found' })

    const newParams = new URLSearchParams(searchParams.toString())
    newParams.delete('error')
    const newUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname
    
    router.replace(newUrl, { scroll: false })
  }, [error, pathname, router, searchParams, showToast])

  return null
}