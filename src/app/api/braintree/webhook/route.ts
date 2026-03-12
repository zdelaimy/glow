import { NextRequest, NextResponse } from 'next/server'
import { getBraintreeGateway } from '@/lib/braintree'

// Braintree sends a GET to verify the webhook endpoint
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('bt_challenge')
  if (!challenge) {
    return NextResponse.json({ error: 'Missing bt_challenge' }, { status: 400 })
  }

  const gateway = getBraintreeGateway()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = (gateway.webhookNotification as any).verify(challenge)
  return new NextResponse(response, { status: 200 })
}

// Braintree sends POST for actual notifications
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const btSignature = formData.get('bt_signature') as string
    const btPayload = formData.get('bt_payload') as string

    if (!btSignature || !btPayload) {
      return NextResponse.json({ error: 'Missing signature or payload' }, { status: 400 })
    }

    const gateway = getBraintreeGateway()
    const notification = await gateway.webhookNotification.parse(btSignature, btPayload)

    console.log('Braintree webhook:', notification.kind, notification.timestamp)

    // For card payments, the charge is synchronous so the checkout route
    // handles order creation. Webhooks are mainly for settlement events
    // and subscription billing. Add handling here as needed.

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Braintree webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
