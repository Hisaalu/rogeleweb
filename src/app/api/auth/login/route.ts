import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
  sessionCookieOptions,
} from '@/lib/cookies'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? { message: 'Invalid credentials' } },
        { status: res.status }
      )
    }

    const store = cookies()
    store.set(
      ACCESS_TOKEN_COOKIE,
      data.access_token,
      sessionCookieOptions(data.expires_in)
    )
    store.set(
      REFRESH_TOKEN_COOKIE,
      data.refresh_token,
      sessionCookieOptions(60 * 60 * 24 * 7)
    )
    
    const user = data.user
    if (user) {
      store.set(USER_COOKIE, JSON.stringify(user), sessionCookieOptions(60 * 60 * 24 * 7))
    }

    return NextResponse.json({
      ok: true,
      user: user,
      role: user?.role ?? 'learner',
    })
  } catch (err) {
    return NextResponse.json(
      { error: { message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}