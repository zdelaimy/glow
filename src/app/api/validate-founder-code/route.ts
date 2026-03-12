import { NextRequest, NextResponse } from 'next/server'

const FOUNDER_CODES = (process.env.FOUNDER_CODES || '').split(',').map(c => c.trim().toUpperCase()).filter(Boolean)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json() as { code: string }

    if (!code) {
      return NextResponse.json({ valid: false })
    }

    const valid = FOUNDER_CODES.includes(code.trim().toUpperCase())
    return NextResponse.json({ valid })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
