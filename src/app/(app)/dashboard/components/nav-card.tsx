'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function NavCard({
  href,
  icon,
  title,
  description,
  locked = false,
  variant = 'filled',
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  locked?: boolean
  variant?: 'filled' | 'outline'
}) {
  const base = 'group flex flex-col rounded-2xl p-6 transition'
  const interactive = locked
    ? 'cursor-not-allowed'
    : 'hover:-translate-y-1 hover:shadow-xl'

  const style: React.CSSProperties = locked
    ? { backgroundColor: 'var(--locked-bg)' }
    : variant === 'outline'
      ? {
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        }
      : { backgroundColor: 'var(--brand-primary)' }

  const titleColor = locked
    ? 'hsl(var(--foreground))'
    : variant === 'outline'
      ? 'hsl(var(--foreground))'
      : 'white'

  const descColor = locked
    ? 'hsl(var(--muted-foreground))'
    : variant === 'outline'
      ? 'hsl(var(--muted-foreground))'
      : 'rgba(255,255,255,0.9)'

  const iconColor = locked ? 'var(--locked-fg)' : 'var(--brand-accent)'

  const content = (
    <>
      <div className="mb-4" style={{ color: iconColor }}>
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold" style={{ color: titleColor }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: descColor }}>
        {description}
      </p>
      {locked && (
        <div
          className="mt-3 text-xs font-medium"
          style={{ color: 'var(--locked-text)' }}
        >
          Locked
        </div>
      )}
    </>
  )

  if (locked) {
    return (
      <div className={`${base} ${interactive}`} style={style}>
        {content}
      </div>
    )
  }

  return (
    <Link href={href} className={`${base} ${interactive}`} style={style}>
      {content}
    </Link>
  )
}