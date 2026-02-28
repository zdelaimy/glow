import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOutButton } from '@/components/sign-out-button'
import { AdminGlowGirlActions } from '@/components/admin-glow-girl-actions'
import { AdminOrderExport } from '@/components/admin-order-export'
import { AdminApplicationActions } from '@/components/admin-application-actions'
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

  // Fetch applications
  const { data: applications } = await supabase
    .from('glow_girl_applications')
    .select('*')
    .order('created_at', { ascending: false })

  const pendingApplications = (applications || []).filter(a => a.status === 'PENDING')

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
    <div className="min-h-screen bg-[#f5f0eb] font-inter">
      <header className="bg-white/60 backdrop-blur-sm border-b border-[#6E6A62]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg tracking-tight text-[#6E6A62] font-medium">
              GLOW
            </Link>
            <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/40 font-inter">Admin</span>
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
            <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
              <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">{stat.label}</div>
              <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
            </div>
          ))}
        </div>

        <Tabs defaultValue={pendingApplications.length > 0 ? 'applications' : 'glow-girls'}>
          <TabsList className="bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full p-1">
            <TabsTrigger value="applications" className="relative rounded-full text-xs uppercase tracking-[0.15em] font-inter text-[#6E6A62]/60 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm">
              Applications
              {pendingApplications.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-rose-400 rounded-full">
                  {pendingApplications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="glow-girls" className="rounded-full text-xs uppercase tracking-[0.15em] font-inter text-[#6E6A62]/60 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm">Glow Girls</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-full text-xs uppercase tracking-[0.15em] font-inter text-[#6E6A62]/60 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm">Orders</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full text-xs uppercase tracking-[0.15em] font-inter text-[#6E6A62]/60 data-[state=active]:bg-white data-[state=active]:text-[#6E6A62] data-[state=active]:shadow-sm">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="mt-6">
            <div className="bg-white rounded-2xl border border-neutral-200/60">
              <div className="px-6 py-4 border-b border-neutral-200/60">
                <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">Glow Girl Applications</h2>
              </div>
              <div className="px-6">
                <div className="divide-y divide-neutral-200/60">
                  {(applications || []).map((app) => (
                    <div key={app.id} className="py-4 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#6E6A62]">{app.full_name}</p>
                        <p className="text-sm text-[#6E6A62]/60">
                          {app.city}, {app.state} &middot; {app.follower_range} followers &middot; {app.social_platforms.join(', ')}
                        </p>
                        {app.primary_handle && (
                          <p className="text-sm text-[#6E6A62]/60">{app.primary_handle}</p>
                        )}
                        <p className="text-sm mt-1 text-[#6E6A62]/60 line-clamp-2">&ldquo;{app.why_glow}&rdquo;</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="inline-flex items-center rounded-full bg-[#f5f0eb] px-2.5 py-0.5 text-xs text-[#6E6A62]">{app.heard_from}</span>
                          {app.creates_content && <span className="inline-flex items-center rounded-full bg-[#f5f0eb] px-2.5 py-0.5 text-xs text-[#6E6A62]">Content creator</span>}
                          {app.previous_direct_sales && <span className="inline-flex items-center rounded-full bg-[#f5f0eb] px-2.5 py-0.5 text-xs text-[#6E6A62]">DS experience{app.previous_company ? `: ${app.previous_company}` : ''}</span>}
                          {app.referral_code && <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">Ref: {app.referral_code}</span>}
                        </div>
                        <p className="text-xs text-[#6E6A62]/40 mt-2">
                          Applied {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <AdminApplicationActions applicationId={app.id} status={app.status} />
                    </div>
                  ))}
                  {(!applications || applications.length === 0) && (
                    <p className="py-8 text-center text-[#6E6A62]/50">No applications yet.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="glow-girls" className="mt-6">
            <div className="bg-white rounded-2xl border border-neutral-200/60">
              <div className="px-6 py-4 border-b border-neutral-200/60">
                <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">Glow Girls</h2>
              </div>
              <div className="px-6">
                <div className="divide-y divide-neutral-200/60">
                  {(glowGirls || []).map((glowGirl) => {
                    const profile = glowGirl.profiles as unknown as { full_name: string }
                    return (
                      <div key={glowGirl.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#6E6A62]">{glowGirl.brand_name || 'Unnamed'}</p>
                          <p className="text-sm text-[#6E6A62]/60">
                            @{glowGirl.slug} &middot; {profile?.full_name || 'No name'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${glowGirl.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f0eb] text-[#6E6A62]'}`}>
                            {glowGirl.approved ? 'Approved' : 'Pending'}
                          </span>
                          <AdminGlowGirlActions glowGirlId={glowGirl.id} approved={glowGirl.approved} />
                        </div>
                      </div>
                    )
                  })}
                  {(!glowGirls || glowGirls.length === 0) && (
                    <p className="py-8 text-center text-[#6E6A62]/50">No Glow Girls yet.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="bg-white rounded-2xl border border-neutral-200/60">
              <div className="px-6 py-4 border-b border-neutral-200/60 flex items-center justify-between">
                <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">Recent Orders</h2>
                <AdminOrderExport />
              </div>
              <div className="px-6">
                <div className="divide-y divide-neutral-200/60">
                  {(orders || []).map((order) => {
                    const glowGirl = order.glow_girl as unknown as { brand_name: string; slug: string } | null
                    return (
                      <div key={order.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#6E6A62]">{order.shipping_name || 'Customer'}</p>
                          <p className="text-sm text-[#6E6A62]/60">
                            {glowGirl?.brand_name} &middot; {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#6E6A62]">${(order.amount_cents / 100).toFixed(2)}</p>
                          <div className="flex items-center gap-1">
                            {order.is_subscription && <span className="inline-flex items-center rounded-full bg-[#f5f0eb] px-2 py-0.5 text-xs text-[#6E6A62]">Sub</span>}
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${order.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f0eb] text-[#6E6A62]'}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {(!orders || orders.length === 0) && (
                    <p className="py-8 text-center text-[#6E6A62]/50">No orders yet.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-neutral-200/60">
                <div className="px-6 py-4 border-b border-neutral-200/60">
                  <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">Top Glow Girls (by sales)</h2>
                </div>
                <div className="px-6 py-4">
                  {topGlowGirlsList.length > 0 ? (
                    <div className="space-y-3">
                      {topGlowGirlsList.map((c, i) => (
                        <div key={c.slug} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-light text-[#6E6A62]/40 w-6">{i + 1}</span>
                            <div>
                              <p className="font-medium text-[#6E6A62]">{c.name}</p>
                              <p className="text-sm text-[#6E6A62]/60">@{c.slug}</p>
                            </div>
                          </div>
                          <span className="inline-flex items-center rounded-full bg-[#f5f0eb] px-2.5 py-0.5 text-xs text-[#6E6A62]">{c.count} sales</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#6E6A62]/50 text-center py-8">No sales data yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/60">
                <div className="px-6 py-4 border-b border-neutral-200/60">
                  <h2 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 font-inter">Platform Overview</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-[#6E6A62]/60">Total revenue</span>
                      <span className="font-medium text-[#6E6A62]">${(totalRevenue / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E6A62]/60">Total orders</span>
                      <span className="font-medium text-[#6E6A62]">{totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E6A62]/60">Active Glow Girls</span>
                      <span className="font-medium text-[#6E6A62]">{(glowGirls || []).filter(c => c.approved).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6E6A62]/60">Pending approval</span>
                      <span className="font-medium text-[#6E6A62]">{(glowGirls || []).filter(c => !c.approved).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
