import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
} from './cookies'

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE }

export interface SessionUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
  role: string
  class_id?: number | null
  profile_photo?: string | null
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