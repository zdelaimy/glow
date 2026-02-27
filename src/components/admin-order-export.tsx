'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function AdminOrderExport() {
  async function handleExport() {
    const supabase = createClient()
    const { data: orders } = await supabase
      .from('orders')
      .select('*, glow_girl:glow_girls(brand_name)')
      .order('created_at', { ascending: false })

    if (!orders || orders.length === 0) {
      alert('No orders to export')
      return
    }

    const header = 'ID,Date,Customer,Glow Girl,Amount,Status,Subscription,Blend\n'
    const rows = orders.map(o => {
      const glowGirl = o.glow_girl as unknown as { brand_name: string } | null
      const blend = o.blend_components as Record<string, string>
      return [
        o.id,
        new Date(o.created_at).toISOString(),
        o.shipping_name || '',
        glowGirl?.brand_name || '',
        (o.amount_cents / 100).toFixed(2),
        o.status,
        o.is_subscription ? 'Yes' : 'No',
        `${blend?.base || ''} + ${blend?.booster_primary || ''}${blend?.booster_secondary ? ' + ' + blend.booster_secondary : ''}`,
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    }).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `glow-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      Export CSV
    </Button>
  )
}
