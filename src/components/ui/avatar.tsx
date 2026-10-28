'use client'

import { useState } from 'react'
import Image from 'next/image'

export function Avatar({
  src,
  fallback,
  size = 40,
  className,
}: {
  src?: string | null
  fallback: string
  size?: number
  className?: string
}) {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-semibold text-white ${className ?? ''}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {fallback}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={fallback}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-cover ${className ?? ''}`}
      style={{ width: size, height: size }}
      onError={() => setErrored(true)}
      unoptimized
    />
  )
}