'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface SettingsContextValue {
  getSetting: (key: string) => string | null
  getSettingOrDefault: (key: string, fallback: string) => string
  allSettings: Record<string, string>
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({
  settings,
  children,
}: {
  settings: Record<string, string>
  children: ReactNode
}) {
  const value = useMemo<SettingsContextValue>(() => {
    return {
      getSetting: (key) => settings[key] ?? null,
      getSettingOrDefault: (key, fallback) => settings[key] ?? fallback,
      allSettings: settings,
    }
  }, [settings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}