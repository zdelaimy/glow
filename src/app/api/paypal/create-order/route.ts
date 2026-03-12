import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { items } = await request.json() as {
      items: { productId: string; quantity: number }[]
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    const productIds = items.map(i => i.productId)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('active', true)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 404 })
    }

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)!
      return {
        name: product.name,
        quantity: item.quantity,
        unitAmountUSD: (product.price_cents / 100).toFixed(2),
      }
    })

    const totalCents = items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)!
      return sum + product.price_cents * item.quantity
    }, 0)
    const totalDollars = (totalCents / 100).toFixed(2)

    const orderId = await createOrder(totalDollars, orderItems)

    return NextResponse.json({ orderId })
  } catch (err) {
    console.error('PayPal create order error:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
