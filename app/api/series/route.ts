import { NextResponse } from 'next/server'
import { getAllSeries } from '@/lib/series-loader'

export const dynamic = 'force-static'

export async function GET() {
  try {
    const allSeries = getAllSeries()
    return NextResponse.json(allSeries)
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 })
  }
}
