import { NextResponse } from 'next/server'
import { serverApiRequest } from '@/lib/server-api'

export async function GET() {
  try {
    const plans = await serverApiRequest<any>('/api/v1/subscription-plans')
    const stats = await serverApiRequest<any>('/api/v1/admin/stats')
    
    return NextResponse.json({
      success: true,
      plansCount: plans?.length || 0,
      plansData: plans,
      statsData: stats,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}