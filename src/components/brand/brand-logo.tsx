'use client'

import Image from 'next/image'
import { useBranding } from './brand-provider'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 40,
  showText = true,
  className,
}: {
  size?: number
  showText?: boolean
  className?: string
}) {
  const branding = useBranding()

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {branding.logoUrl ? (
        <Image
          src={branding.logoUrl}
          alt={branding.schoolName}
          width={size}
          height={size}
          className="rounded-lg object-contain"
          priority
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-lg font-bold text-white"
          style={{
            width: size,
            height: size,
            backgroundColor: branding.colorAccent,
            fontSize: size * 0.4,
          }}
        >
          {branding.schoolName.slice(0, 2).toUpperCase()}
        </div>
      )}
      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-semibold leading-tight text-foreground">
            {branding.schoolName}
          </span>
          {branding.tagline && (
            <span className="text-xs leading-tight text-muted-foreground">
              {branding.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  )
}