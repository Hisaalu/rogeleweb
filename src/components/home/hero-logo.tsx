'use client'

import { useBranding } from '@/components/brand/brand-provider'

export function HeroLogo() {
  const branding = useBranding()

  if (!branding.logoUrl) {
    return (
      <div className="flex h-[280px] w-[280px] items-center justify-center rounded-3xl bg-white/20 text-6xl font-bold text-white backdrop-blur-sm sm:h-[320px] sm:w-[320px]">
        {branding.schoolName.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img 
      src={branding.logoUrl} 
      alt={branding.schoolName} 
      className="h-auto w-full max-w-[280px] rounded-2xl object-contain drop-shadow-2xl sm:max-w-[320px]" 
    />
  )
}