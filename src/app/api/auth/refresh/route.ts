import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from '@/lib/cookies'
import type { AuthResponse } from '@/types/api'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function POST() {
  const store = cookies()
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'No refresh token' } },
      { status: 401 },
    )
  }

  const upstream = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  const text = await upstream.text()
  const data = text ? JSON.parse(text) : null

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  const auth = data as AuthResponse

  store.set(
    ACCESS_TOKEN_COOKIE,
    auth.access_token,
    sessionCookieOptions(auth.expires_in),
  )
  store.set(REFRESH_TOKEN_COOKIE, auth.refresh_token, sessionCookieOptions(60 * 60 * 24 * 7))

  return NextResponse.json({ ok: true })
}