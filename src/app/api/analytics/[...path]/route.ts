import { NextResponse, type NextRequest } from 'next/server'

const ANALYTICS_URL =
  process.env.ANALYTICS_API_URL ?? 'http://localhost:9000'

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join('/')
  const search = req.nextUrl.search

  let upstream: Response
  try {
    upstream = await fetch(`${ANALYTICS_URL}/analytics/${path}${search}`, {
      method: req.method,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[analytics-proxy] upstream fetch failed', { path, err })
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNREACHABLE', message: 'Analytics service is unreachable' } },
      { status: 502 },
    )
  }

  const text = await upstream.text()
  const contentType = upstream.headers.get('content-type') ?? 'application/json'

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  })
}

export const GET = proxy
export const POST = proxy