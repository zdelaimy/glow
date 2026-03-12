import { NextResponse } from 'next/server'
import { getBraintreeGateway } from '@/lib/braintree'

export async function POST() {
  if (!process.env.BRAINTREE_MERCHANT_ID) {
    return NextResponse.json(
      { error: 'Payment processing is not configured yet' },
      { status: 503 }
    )
  }

  try {
    const gateway = getBraintreeGateway()
    const response = await gateway.clientToken.generate({})
    return NextResponse.json({ clientToken: response.clientToken })
  } catch (err) {
    console.error('Braintree token error:', err)
    return NextResponse.json(
      { error: 'Failed to generate payment token' },
      { status: 500 }
    )
  }
}
