import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  sessionCookieOptions,
} from '@/lib/cookies'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const API_URL = process.env.ROGELEDB_API_URL ?? 'http://localhost:8080'

async function tryRefresh(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
} | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const text = await res.text()
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/')
  const search = req.nextUrl.search
  const store = cookies()

  let token = store.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value

  const buildHeaders = (t?: string): Record<string, string> => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    const contentType = req.headers.get('content-type')
    if (contentType) headers['Content-Type'] = contentType
    if (t) headers['Authorization'] = `Bearer ${t}`
    return headers
  }

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const text = await req.text()
      if (text && text.length > 0) body = text
    } catch {
      body = undefined
    }
  }

  const callUpstream = async (t?: string): Promise<Response> =>
    fetch(`${API_URL}/api/v1/${path}${search}`, {
      method: req.method,
      headers: buildHeaders(t),
      body,
      cache: 'no-store',
    })

  let upstream: Response
  try {
    upstream = await callUpstream(token)
  } catch (err) {
    console.error('[proxy] upstream fetch failed', { path, method: req.method, err })
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNREACHABLE', message: 'API is unreachable' } },
      { status: 502 },
    )
  }

  if (upstream.status === 401 && refreshToken) {
    const refreshed = await tryRefresh(refreshToken)
    if (refreshed) {
      store.set(
        ACCESS_TOKEN_COOKIE,
        refreshed.access_token,
        sessionCookieOptions(refreshed.expires_in),
      )
      store.set(
        REFRESH_TOKEN_COOKIE,
        refreshed.refresh_token,
        sessionCookieOptions(60 * 60 * 24 * 7),
      )

      try {
        upstream = await callUpstream(refreshed.access_token)
      } catch (err) {
        console.error('[proxy] retry after refresh failed', { path, err })
        return NextResponse.json(
          { error: { code: 'UPSTREAM_UNREACHABLE', message: 'API is unreachable' } },
          { status: 502 },
        )
      }
    }
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
  headers: {
    'content-type': upstreamContentType || 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
})
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy