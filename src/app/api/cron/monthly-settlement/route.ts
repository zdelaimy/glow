import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runMonthlySettlement } from '@/lib/commissions/monthly-settlement'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  // Default to previous month if no period specified
  const period = body.period || getPreviousMonth()

  const supabase = await createServiceClient()
  await runMonthlySettlement(supabase, period)

  return NextResponse.json({ success: true, period })
}

function getPreviousMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 7)
}
