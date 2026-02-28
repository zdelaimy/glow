import Link from "next/link"
import { Footer } from "@/components/footer"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors font-inter">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl text-[#6E6A62] mt-8 mb-10">Frequently Asked Questions</h1>
        <div className="space-y-8 text-sm text-[#6E6A62]/80 leading-relaxed">
          {[
            {
              q: "What is Glow?",
              a: "Glow is a platform where aspiring creators and entrepreneurs can launch their own beauty storefront and start selling products. Each Glow Girl gets a personalized online store, and we handle all the product fulfillment and shipping — you just focus on building your brand and community.",
            },
            {
              q: "How does it work?",
              a: "Sign up to become a Glow Girl, customize your storefront, and share it with your audience. When someone purchases through your store, you earn a commission. There's no inventory to manage, no upfront cost for products, and no shipping to worry about — we take care of everything behind the scenes.",
            },
            {
              q: "How do I become a Glow Girl?",
              a: "Visit our Glow Girls page to learn more about the opportunity. You can sign up, get your own branded storefront, and start earning commissions on every sale. There's no inventory to hold — we handle fulfillment and shipping.",
            },
            {
              q: "How much can I earn?",
              a: "Glow Girls earn 25% commission on every sale. You can also earn a 10% referral match when you recruit other Glow Girls to the network, plus a 5% pod override on your team's sales. Top performers unlock tiered monthly bonuses. Visit our Compensation Plan page for full details.",
            },
            {
              q: "Can I recruit other Glow Girls?",
              a: "Absolutely. When you refer someone to join Glow as a new Glow Girl, you earn a 10% match on their sales. You can build a team (called a Pod) and earn overrides on your Pod's total volume. It's a great way to grow your income beyond just your own storefront.",
            },
            {
              q: "Do I need to hold inventory or ship products?",
              a: "No. Glow handles all product sourcing, inventory, packaging, and shipping. When a customer places an order through your storefront, we fulfill it directly. You never have to touch a product.",
            },
            {
              q: "What is your return policy?",
              a: "Unopened products may be returned within 30 days of purchase for a full refund. If a customer experiences any issues with their product, they can reach out to our support team and we'll take care of it.",
            },
            {
              q: "How do I contact support?",
              a: "You can reach our team at team@glowlabs.nyc or use the support form in the footer of our website. We're available Monday through Friday, 9am to 5pm PST.",
            },
          ].map((item, i) => (
            <div key={i}>
              <h2 className="text-base font-semibold text-[#6E6A62] mb-2">{item.q}</h2>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
