import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOutButton } from '@/components/sign-out-button'
import { AdminGlowGirlActions } from '@/components/admin-glow-girl-actions'
import { AdminOrderExport } from '@/components/admin-order-export'
import Link from 'next/link'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()

  // Fetch all glow girls
  const { data: glowGirls } = await supabase
    .from('glow_girls')
    .select('*, profiles!inner(full_name, role)')
    .order('created_at', { ascending: false })

  // Fetch all orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*, glow_girl:glow_girls(brand_name, slug)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Analytics
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { data: revenueData } = await supabase
    .from('orders')
    .select('amount_cents')
    .eq('status', 'paid')

  const totalRevenue = (revenueData || []).reduce((s, o) => s + o.amount_cents, 0)

  const { count: totalGlowGirls } = await supabase
    .from('glow_girls')
    .select('*', { count: 'exact', head: true })

  // Top glow girls by events
  const { data: topGlowGirls } = await supabase
    .from('events')
    .select('glow_girl_id, glow_girls!inner(brand_name, slug)')
    .eq('event_type', 'purchase')
    .limit(100)

  const glowGirlCounts: Record<string, { name: string; slug: string; count: number }> = {}
  for (const ev of topGlowGirls || []) {
    const c = ev.glow_girls as unknown as { brand_name: string; slug: string }
    if (!glowGirlCounts[ev.glow_girl_id!]) {
      glowGirlCounts[ev.glow_girl_id!] = { name: c.brand_name, slug: c.slug, count: 0 }
    }
    glowGirlCounts[ev.glow_girl_id!].count++
  }
  const topGlowGirlsList = Object.values(glowGirlCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-rose-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
            </Link>
            <div>
              <h1 className="font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage Glow platform</p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
            { label: 'Total Orders', value: totalOrders || 0 },
            { label: 'Glow Girls', value: totalGlowGirls || 0 },
            { label: 'Avg Order Value', value: totalOrders ? `$${(totalRevenue / (totalOrders || 1) / 100).toFixed(2)}` : '$0' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-semibold mt-1">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="glow-girls">
          <TabsList>
            <TabsTrigger value="glow-girls">Glow Girls</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="glow-girls" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Glow Girls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {(glowGirls || []).map((glowGirl) => {
                    const profile = glowGirl.profiles as unknown as { full_name: string }
                    return (
                      <div key={glowGirl.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{glowGirl.brand_name || 'Unnamed'}</p>
                          <p className="text-sm text-muted-foreground">
                            @{glowGirl.slug} &middot; {profile?.full_name || 'No name'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={glowGirl.approved ? 'default' : 'secondary'}>
                            {glowGirl.approved ? 'Approved' : 'Pending'}
                          </Badge>
                          <AdminGlowGirlActions glowGirlId={glowGirl.id} approved={glowGirl.approved} />
                        </div>
                      </div>
                    )
                  })}
                  {(!glowGirls || glowGirls.length === 0) && (
                    <p className="py-8 text-center text-muted-foreground">No Glow Girls yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <AdminOrderExport />
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {(orders || []).map((order) => {
                    const glowGirl = order.glow_girl as unknown as { brand_name: string; slug: string } | null
                    return (
                      <div key={order.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.shipping_name || 'Customer'}</p>
                          <p className="text-sm text-muted-foreground">
                            {glowGirl?.brand_name} &middot; {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(order.amount_cents / 100).toFixed(2)}</p>
                          <div className="flex items-center gap-1">
                            {order.is_subscription && <Badge variant="outline" className="text-xs">Sub</Badge>}
                            <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(!orders || orders.length === 0) && (
                    <p className="py-8 text-center text-muted-foreground">No orders yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Top Glow Girls (by sales)</CardTitle></CardHeader>
                <CardContent>
                  {topGlowGirlsList.length > 0 ? (
                    <div className="space-y-3">
                      {topGlowGirlsList.map((c, i) => (
                        <div key={c.slug} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-light text-muted-foreground w-6">{i + 1}</span>
                            <div>
                              <p className="font-medium">{c.name}</p>
                              <p className="text-sm text-muted-foreground">@{c.slug}</p>
                            </div>
                          </div>
                          <Badge>{c.count} sales</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No sales data yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total revenue</span>
                      <span className="font-semibold">${(totalRevenue / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total orders</span>
                      <span className="font-semibold">{totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Glow Girls</span>
                      <span className="font-semibold">{(glowGirls || []).filter(c => c.approved).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending approval</span>
                      <span className="font-semibold">{(glowGirls || []).filter(c => !c.approved).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
