import { NextResponse } from 'next/server'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const upstream = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json().catch(() => null)
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    return NextResponse.json(
      { error: { message: 'Failed to send password reset email' } },
      { status: 500 }
    )
  }
}