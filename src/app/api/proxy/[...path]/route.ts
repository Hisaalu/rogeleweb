import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '@/lib/cookies'

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const search = req.nextUrl.search
  const token = cookies().get(ACCESS_TOKEN_COOKIE)?.value

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }
  const contentType = req.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType
  if (token) headers['Authorization'] = `Bearer ${token}`

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const text = await req.text()
      if (text && text.length > 0) body = text
    } catch {
      body = undefined
    }
  }

  let upstream: Response
  try {
    upstream = await fetch(`${API_URL}/api/v1/${path}${search}`, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[proxy] upstream fetch failed', { path, method: req.method, err })
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNREACHABLE', message: 'API is unreachable' } },
      { status: 502 },
    )
  }

  if (upstream.status === 204 || upstream.status === 304) {
    return new NextResponse(null, { status: upstream.status })
  }

  const text = await upstream.text()
  const upstreamContentType = upstream.headers.get('content-type')

  const responseHeaders: Record<string, string> = {}
  if (upstreamContentType) responseHeaders['content-type'] = upstreamContentType

  return new NextResponse(text, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy