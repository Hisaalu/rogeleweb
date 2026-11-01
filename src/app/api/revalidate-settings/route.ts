import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST() {
  try {
    revalidateTag('public-settings')
    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}