import { createClient } from '@/lib/supabase/server'
import { requireGlowGirl } from '@/lib/auth'
import { ReferralShare } from '@/components/referral-share'
import { AffiliateLink } from '@/components/affiliate-link'
import { ConnectLink } from '@/components/connect-link'
import { CalendlySetting } from '@/components/calendly-setting'
import { ConnectBioEditor } from '@/components/connect-bio-editor'

export default async function GlowGirlDashboard() {
  const { glowGirl } = await requireGlowGirl()
  const supabase = await createClient()

  // Fetch analytics
  const { count: viewCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'storefront_view')

  const { count: productsSoldCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('status', 'paid')

  const { count: purchaseCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('glow_girl_id', glowGirl.id)
    .eq('event_type', 'purchase')

  // Fetch orders for revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('amount_cents')
    .eq('glow_girl_id', glowGirl.id)
    .eq('status', 'paid')

  const totalRevenue = (orders || []).reduce((sum, o) => sum + o.amount_cents, 0)
  const conversionRate = (viewCount && purchaseCount) ? ((purchaseCount || 0) / viewCount * 100).toFixed(1) : '0'

  // Referral data
  const { data: referrals } = await supabase
    .from('glow_girl_referrals')
    .select('*, referred:glow_girls!glow_girl_referrals_referred_id_fkey(id, brand_name, created_at, approved)')
    .eq('referrer_id', glowGirl.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
        {!glowGirl.approved && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800 mb-6">
            Your Glow Girl account is pending approval. Your storefront will be visible once approved.
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Link Clicks', value: viewCount || 0 },
              { label: 'Products Sold', value: productsSoldCount || 0 },
              { label: 'Conversion Rate', value: `${conversionRate}%` },
              { label: 'Revenue', value: `$${(totalRevenue / 100).toFixed(2)}` },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-6">
                <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">{stat.label}</div>
                <div className="text-2xl text-[#6E6A62] font-light mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          <ReferralShare referralCode={glowGirl.referral_code} />
          <AffiliateLink slug={glowGirl.slug} />
          <ConnectLink slug={glowGirl.slug} />
          <ConnectBioEditor
            glowGirlId={glowGirl.id}
            initialHeadline={glowGirl.connect_headline}
            initialBio={glowGirl.connect_bio}
            initialPhotoUrl={glowGirl.connect_photo_url}
          />
          <CalendlySetting glowGirlId={glowGirl.id} initialUrl={glowGirl.calendly_url} />

          <div>
            <h2 className="text-xl font-light text-[#6E6A62] mb-4">Recent Orders</h2>
            <OrdersList glowGirlId={glowGirl.id} />
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h3 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Referred Glow Girls</h3>
            </div>
            <div className="p-6">
              {(!referrals || referrals.length === 0) ? (
                <p className="text-center text-[#6E6A62]/50 py-6">
                  No referrals yet. Share your referral link to get started!
                </p>
              ) : (
                <div className="divide-y divide-neutral-200/60">
                  {referrals.map((ref) => {
                    const referred = ref.referred as { id: string; brand_name: string | null; created_at: string; approved: boolean } | null
                    return (
                      <div key={ref.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#6E6A62]">{referred?.brand_name || 'Unknown'}</p>
                          <p className="text-xs text-[#6E6A62]/50">
                            Joined {referred ? new Date(referred.created_at).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                          referred?.approved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-[#f5f0eb] text-[#6E6A62]'
                        }`}>
                          {referred?.approved ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  )
}

async function OrdersList({ glowGirlId }: { glowGirlId: string }) {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('glow_girl_id', glowGirlId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/60 py-8 text-center text-[#6E6A62]/50">
        No orders yet. Share your storefront to get started!
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
      <div className="divide-y divide-neutral-200/60">
        {orders.map((order) => (
          <div key={order.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-[#6E6A62]">{order.shipping_name || 'Customer'}</p>
              <p className="text-sm text-[#6E6A62]/50">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              {order.tracking_number && (
                <p className="text-xs text-[#6E6A62]/50 mt-0.5">
                  {order.tracking_carrier ? `${order.tracking_carrier}: ` : ''}
                  {order.tracking_url ? (
                    <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="underline">{order.tracking_number}</a>
                  ) : order.tracking_number}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium text-[#6E6A62]">${(order.amount_cents / 100).toFixed(2)}</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                  order.status === 'paid'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#f5f0eb] text-[#6E6A62]'
                }`}>
                  {order.status}
                </span>
                {order.fulfillment_status && order.fulfillment_status !== 'UNFULFILLED' && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                    order.fulfillment_status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : order.fulfillment_status === 'SHIPPED'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-[#f5f0eb] text-[#6E6A62]'
                  }`}>
                    {order.fulfillment_status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
