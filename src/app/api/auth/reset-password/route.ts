import { NextResponse } from 'next/server'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.token || !body.password) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Token and password are required' } },
        { status: 400 }
      )
    }

    const upstream = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: body.token,
        password: body.password,
      }),
    })

    const text = await upstream.text()
    const data = text ? JSON.parse(text) : null

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    )
  }
}