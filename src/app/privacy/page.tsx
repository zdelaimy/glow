import Link from "next/link"
import { Footer } from "@/components/footer"

const sections = [
  {
    title: "1. Information We Collect",
    content: [
      "We may collect personal information that you voluntarily provide to us when you register on the website, place an order, subscribe to our newsletter, or contact us. This includes your name, email address, mailing address, phone number, and payment information.",
      "We automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and browsing behavior through cookies and similar technologies.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      "We use the information we collect to process and fulfill your orders, communicate with you about your account or transactions, send you marketing communications (with your consent), improve our website and product offerings, and comply with legal obligations.",
    ],
  },
  {
    title: "3. Sharing Your Information",
    content: [
      "We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, shipping carriers). These parties are obligated to keep your information confidential.",
    ],
  },
  {
    title: "4. Cookies",
    content: [
      "We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.",
    ],
  },
  {
    title: "5. Data Security",
    content: [
      "We implement commercially reasonable security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "6. Your Rights",
    content: [
      "Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. To exercise any of these rights, please contact us at team@glowlabs.nyc.",
    ],
  },
  {
    title: "7. Children\u2019s Privacy",
    content: [
      "Our website is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the \u201cLast Updated\u201d date.",
    ],
  },
  {
    title: "9. Contact Us",
    content: [
      "If you have questions about this Privacy Policy, please contact us at team@glowlabs.nyc.",
    ],
  },
]

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-[#6E6A62]/40 font-inter">Last updated February 28, 2026</p>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-[#6E6A62]/10 p-6 sm:p-8 mb-6">
          <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
            Glow Labs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products.
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
              <div className="space-y-3">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-[#6E6A62]/70 leading-relaxed">{paragraph}</p>
                ))}
              </div>
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
