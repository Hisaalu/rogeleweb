'use client'

const STORAGE_KEY = 'nav.hints.dismissed'

export type HintRole = 'learner' | 'teacher'

interface DismissedHints {
  analytics?: boolean
}

function readAll(): Partial<Record<HintRole, DismissedHints>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<Record<HintRole, DismissedHints>>
  } catch {
    return {}
  }
}

function writeAll(data: Partial<Record<HintRole, DismissedHints>>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function isAnalyticsHintDismissed(role: HintRole): boolean {
  if (typeof window === 'undefined') return false
  return readAll()[role]?.analytics === true
}

export function dismissAnalyticsHint(role: HintRole) {
  if (typeof window === 'undefined') return
  const data = readAll()
  data[role] = { ...(data[role] ?? {}), analytics: true }
  writeAll(data)
}

export function toHintRole(role: string): HintRole | null {
  if (role === 'learner') return 'learner'
  if (role === 'teacher') return 'teacher'
  return null
}