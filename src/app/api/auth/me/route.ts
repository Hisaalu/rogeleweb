import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  USER_COOKIE,
  sessionCookieOptions,
} from '@/lib/cookies'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function PATCH(req: NextRequest) {
  const store = cookies()
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const body = await req.json()

  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    return NextResponse.json(
      data ?? { error: { message: 'Update failed' } },
      { status: res.status }
    )
  }

  const meRes = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (meRes.ok) {
    const freshUser = await meRes.json()
    store.set(USER_COOKIE, JSON.stringify(freshUser), sessionCookieOptions(60 * 60 * 24 * 7))
  }

  return NextResponse.json({ ok: true })
}