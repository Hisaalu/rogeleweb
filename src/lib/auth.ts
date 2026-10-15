import { cookies } from 'next/headers'

export const ACCESS_TOKEN_COOKIE = 'rogele_access_token'
export const REFRESH_TOKEN_COOKIE = 'rogele_refresh_token'
export const USER_COOKIE = 'rogele_user'

export interface SessionUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: string
}

export async function getAccessToken(): Promise<string | null> {
  const store = cookies()
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = cookies()
  const raw = store.get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}