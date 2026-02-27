import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  // Fetch commission settings for hold period
  const { data: settings } = await supabase
    .from('commission_settings')
    .select('commission_hold_days')
    .single()

  const holdDays = settings?.commission_hold_days || 14
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - holdDays)

  // Auto-approve commissions older than the hold period
  const { data, error } = await supabase
    .from('commissions')
    .update({ status: 'APPROVED', approved_at: new Date().toISOString() })
    .eq('status', 'PENDING')
    .lt('created_at', cutoff.toISOString())
    .select('id')

  return NextResponse.json({
    success: !error,
    approved_count: data?.length || 0,
  })
}
