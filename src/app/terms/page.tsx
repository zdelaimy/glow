import Link from "next/link"
import { Footer } from "@/components/footer"

const sections = [
  {
    title: "1. Use of Our Services",
    content: "You must be at least 18 years old to use our website or make purchases. You agree to provide accurate and complete information when creating an account or placing an order. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "2. Products and Orders",
    content: "All product descriptions, pricing, and availability are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including errors in product or pricing information. Custom serum formulations are made to order and may not be eligible for return.",
  },
  {
    title: "3. Glow Girl Independent Sellers",
    content: "Glow Girls operate as independent sellers and are not employees of Glow Labs. Earnings and commissions are based on individual sales performance and are not guaranteed. All compensation is subject to the terms outlined in the Glow Girl Compensation Plan.",
  },
  {
    title: "4. Intellectual Property",
    content: "All content on this website, including text, graphics, logos, images, and software, is the property of Glow Labs and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.",
  },
  {
    title: "5. Disclaimer of Warranties",
    content: "Our products are cosmetic in nature and are not intended to diagnose, treat, cure, or prevent any disease or medical condition. Our website and services are provided \u201cas is\u201d without warranties of any kind, express or implied.",
  },
  {
    title: "6. Limitation of Liability",
    content: "To the fullest extent permitted by law, Glow Labs shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our website or products.",
  },
  {
    title: "7. Governing Law",
    content: "These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions.",
  },
  {
    title: "8. Changes to Terms",
    content: "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our website constitutes acceptance of the updated Terms.",
  },
  {
    title: "9. Contact",
    content: "For questions about these Terms, contact us at team@glowlabs.nyc.",
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#6E6A62]/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-inter text-lg tracking-tight text-[#6E6A62] font-medium">
            GLOW
          </Link>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 hover:text-[#6E6A62] transition-colors font-inter"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-14 w-full">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-[2rem] font-light text-[#6E6A62] tracking-tight leading-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-[#6E6A62]/40 font-inter">Last updated February 28, 2026</p>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#6E6A62]/10 p-6 sm:p-8 mb-6">
          <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
            Welcome to Glow Labs. By accessing or using our website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-[#6E6A62]/10 p-6 sm:p-8"
            >
              <h2 className="text-base font-medium text-[#6E6A62] mb-3">{section.title}</h2>
              <p className="text-sm text-[#6E6A62]/70 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact callout */}
        <div className="mt-10 text-center">
          <p className="text-xs text-[#6E6A62]/40 font-inter">
            Questions? Reach us at{" "}
            <a href="mailto:team@glowlabs.nyc" className="text-[#6E6A62] underline underline-offset-2 hover:text-[#5E5A52] transition-colors">
              team@glowlabs.nyc
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
