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
  const base = 'group flex flex-col rounded-2xl p-5 sm:p-6 transition-all duration-200'
  const interactive = locked
    ? 'cursor-not-allowed opacity-80'
    : 'hover:-translate-y-1 hover:shadow-xl'

  const style: React.CSSProperties = locked
    ? { backgroundColor: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
    : variant === 'outline'
      ? {
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }
      : { backgroundColor: 'var(--brand-primary)', color: 'white' }

  const content = (
    <>
      <div className="mb-4 opacity-90">
        {icon}
      </div>
      <h3 className="mb-1.5 text-base font-bold">
        {title}
      </h3>
      <p className={`text-sm ${locked ? 'opacity-70' : 'opacity-90'}`}>
        {description}
      </p>
      {locked && (
        <div className="mt-4 inline-flex items-center rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">
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