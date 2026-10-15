import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
  sessionCookieOptions,
} from '@/lib/cookies'
import type { AuthResponse } from '@/types/api'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Invalid request body' } },
      { status: 400 },
    )
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: 'Email and password are required' } },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  })

  const text = await upstream.text()
  const data = text ? JSON.parse(text) : null

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status })
  }

  const auth = data as AuthResponse
  const store = cookies()

  store.set(
    ACCESS_TOKEN_COOKIE,
    auth.access_token,
    sessionCookieOptions(auth.expires_in),
  )
  store.set(REFRESH_TOKEN_COOKIE, auth.refresh_token, sessionCookieOptions(60 * 60 * 24 * 7))
  store.set(
    USER_COOKIE,
    JSON.stringify({
      id: auth.user.id,
      email: auth.user.email,
      first_name: auth.user.first_name,
      last_name: auth.user.last_name,
      role: auth.user.role,
    }),
    sessionCookieOptions(60 * 60 * 24 * 7),
  )

  return NextResponse.json({ user: auth.user })
}