import type { ReactNode } from 'react'
import { PageHeader } from '@/components/layout/page-header'

export function PublicContentShell({
  title,
  fallbackHref,
  embedded,
  children,
}: {
  title: string
  fallbackHref?: string
  embedded?: boolean
  children: ReactNode
}) {
  if (!embedded) {
    return <>{children}</>
  }

  return (
    <>
      <PageHeader title={title} fallbackHref={fallbackHref} />
      <div>{children}</div>
    </>
  )
}