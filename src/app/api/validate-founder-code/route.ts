import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FOUNDER_CODES = (process.env.FOUNDER_CODES || '').split(',').map(c => c.trim().toUpperCase()).filter(Boolean)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json() as { code: string }

    if (!code) {
      return NextResponse.json({ valid: false })
    }

    const normalized = code.trim().toUpperCase()

    if (!FOUNDER_CODES.includes(normalized)) {
      return NextResponse.json({ valid: false })
    }

    // Check if this code has already been redeemed
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('subscription_id', `FOUNDER_${normalized}`)
      .single()

    if (existing) {
      return NextResponse.json({ valid: false, message: 'This founder code has already been used.' })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
