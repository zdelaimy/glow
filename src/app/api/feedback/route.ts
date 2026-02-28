import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/*
  Requires a `product_feedback` table in Supabase:

  create table product_feedback (
    id uuid default gen_random_uuid() primary key,
    message text not null,
    created_at timestamptz default now()
  );
*/

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const trimmed = message.trim().slice(0, 1000)

    const supabase = await createServiceClient()

    const { error } = await supabase
      .from('product_feedback')
      .insert({ message: trimmed })

    if (error) {
      console.error('Supabase feedback error:', error)
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
