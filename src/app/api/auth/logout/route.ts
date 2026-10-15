import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
  clearCookieOptions,
} from '@/lib/cookies'

export async function POST() {
  const store = cookies()
  store.set(ACCESS_TOKEN_COOKIE, '', clearCookieOptions())
  store.set(REFRESH_TOKEN_COOKIE, '', clearCookieOptions())
  store.set(USER_COOKIE, '', clearCookieOptions())
  return NextResponse.json({ ok: true })
}