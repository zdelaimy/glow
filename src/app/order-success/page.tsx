import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader variant="light" />

      <div className="flex items-center justify-center pt-32 pb-24 px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#6E6A62]/10 mx-auto flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6E6A62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-light text-[#6E6A62] mb-3">Order Confirmed</h1>
          <p className="text-sm text-[#6E6A62]/60 leading-relaxed mb-8">
            Your order is on its way. Check your email for order details and tracking information.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-[#6E6A62] text-white px-8 py-3 text-sm font-medium hover:bg-[#5a5650] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
