import Link from "next/link"
import { Footer } from "@/components/footer"

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/60 hover:text-[#6E6A62] transition-colors font-inter">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl md:text-4xl text-[#6E6A62] mt-8 mb-10">Accessibility Statement</h1>
        <div className="space-y-6 text-sm text-[#6E6A62]/80 leading-relaxed">
          <p><strong className="text-[#6E6A62]">Last Updated:</strong> February 28, 2026</p>

          <p>Glow Labs is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.</p>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">Our Commitment</h2>
          <p>We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These guidelines explain how to make web content more accessible for people with disabilities, including those with visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.</p>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">Measures We Take</h2>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Providing text alternatives for non-text content</li>
            <li>Ensuring sufficient color contrast throughout our site</li>
            <li>Making all functionality available from a keyboard</li>
            <li>Providing clear and consistent navigation</li>
            <li>Ensuring forms are properly labeled and accessible</li>
            <li>Testing with assistive technologies including screen readers</li>
          </ul>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">Known Limitations</h2>
          <p>While we strive for full accessibility, some content may not yet be fully accessible. We are actively working to identify and resolve any issues. User-generated content, such as Glow Girl storefronts, may not always meet all accessibility standards.</p>

          <h2 className="text-lg font-semibold text-[#6E6A62] pt-4">Feedback</h2>
          <p>We welcome your feedback on the accessibility of our website. If you encounter any barriers or have suggestions for improvement, please contact us at <a href="mailto:team@glowlabs.nyc" className="underline hover:text-[#6E6A62]">team@glowlabs.nyc</a>. We will make reasonable efforts to address your concerns promptly.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
