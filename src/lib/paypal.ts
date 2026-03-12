const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!

const base =
  process.env.PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  return data.access_token
}

export async function createOrder(
  amountUSD: string,
  items: { name: string; quantity: number; unitAmountUSD: string }[]
): Promise<string> {
  const accessToken = await getAccessToken()

  const res = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amountUSD,
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: amountUSD,
              },
            },
          },
          items: items.map(i => ({
            name: i.name,
            quantity: String(i.quantity),
            unit_amount: {
              currency_code: 'USD',
              value: i.unitAmountUSD,
            },
          })),
        },
      ],
    }),
  })

  const data = await res.json()
  return data.id
}

export async function captureOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  return data
}
