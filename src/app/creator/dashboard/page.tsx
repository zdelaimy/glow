import { createClient } from '@/lib/supabase/server'
import { requireCreator } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from '@/components/sign-out-button'

export default async function CreatorDashboard() {
  const { creator } = await requireCreator()
  const supabase = await createClient()

  // Fetch signatures
  const { data: signatures } = await supabase
    .from('creator_signatures')
    .select('*, base:base_formulas(name), booster_primary:boosters!creator_signatures_booster_primary_id_fkey(name)')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })

  // Fetch analytics
  const { count: viewCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', creator.id)
    .eq('event_type', 'storefront_view')

  const { count: quizCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', creator.id)
    .eq('event_type', 'quiz_complete')

  const { count: purchaseCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', creator.id)
    .eq('event_type', 'purchase')

  // Fetch orders for revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('amount_cents')
    .eq('creator_id', creator.id)
    .eq('status', 'paid')

  const totalRevenue = (orders || []).reduce((sum, o) => sum + o.amount_cents, 0)
  const conversionRate = (viewCount && quizCount) ? ((purchaseCount || 0) / viewCount * 100).toFixed(1) : '0'

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
              <h1 className="font-semibold">{creator.brand_name}</h1>
              <p className="text-sm text-muted-foreground">Creator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/@${creator.slug}`} target="_blank">
              <Button variant="outline" size="sm">View Storefront</Button>
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {!creator.approved && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            Your creator account is pending approval. Your storefront will be visible once approved.
          </div>
        )}

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Storefront Views', value: viewCount || 0 },
            { label: 'Quiz Completions', value: quizCount || 0 },
            { label: 'Conversion Rate', value: `${conversionRate}%` },
            { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">{stat.label}</div>
                <div className="text-2xl font-semibold mt-1">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Signatures */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Serums</h2>
            <Link href="/creator/signature">
              <Button className="bg-gradient-to-r from-violet-600 to-violet-500">
                Create New Serum
              </Button>
            </Link>
          </div>

          {(!signatures || signatures.length === 0) ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven&apos;t created any serums yet.</p>
                <Link href="/creator/signature">
                  <Button>Create your first signature serum</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signatures.map((sig) => (
                <Card key={sig.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sig.signature_name}</CardTitle>
                      <Badge variant={sig.publish_status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {sig.publish_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Base: {(sig.base as { name: string })?.name}</p>
                      <p>Booster: {(sig.booster_primary as { name: string })?.name}</p>
                      <p className="font-medium text-foreground mt-2">
                        ${(sig.subscription_price_cents / 100).toFixed(2)}/mo &middot; ${(sig.one_time_price_cents / 100).toFixed(2)} one-time
                      </p>
                    </div>
                    <Link href={`/@${creator.slug}/product/${sig.slug}`} className="block mt-3">
                      <Button variant="outline" size="sm" className="w-full">View Product</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <OrdersList creatorId={creator.id} />
        </div>
      </main>
    </div>
  )
}

async function OrdersList({ creatorId }: { creatorId: string }) {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No orders yet. Share your storefront to get started!
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="divide-y">
          {orders.map((order) => (
            <div key={order.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{order.shipping_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">${(order.amount_cents / 100).toFixed(2)}</p>
                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
