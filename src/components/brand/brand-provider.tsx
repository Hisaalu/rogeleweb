'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import type { Branding } from '@/types/branding'

const BrandingContext = createContext<Branding | null>(null)

export function BrandingProvider({
  branding,
  children,
}: {
  branding: Branding
  children: ReactNode
}) {
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--brand-accent', branding.colorAccent)
    root.style.setProperty('--brand-primary', branding.colorPrimary)
  }, [branding.colorAccent, branding.colorPrimary])

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding(): Branding {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return ctx
}