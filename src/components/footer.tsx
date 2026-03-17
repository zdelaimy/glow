import Link from "next/link"
import { SubscribeForm } from "@/components/subscribe-form"
import { SupportForm } from "@/components/support-form"

export function Footer() {
  return (
    <footer className="bg-[#f5f0eb]">
      <div className="max-w-7xl mx-auto px-6">
        {/* GLOW LABS logo — aligned with content columns */}
        <div className="pt-12 pb-4">
          <h2
            className="font-serif text-[17vw] sm:text-[20vw] md:text-[23.2vw] lg:text-[19.3vw] xl:text-[17.3rem] leading-[0.85] tracking-tight text-[#6E6A62] text-center select-none whitespace-nowrap w-full"
            aria-hidden="true"
          >
            Glow Labs
          </h2>
        </div>
        {/* Horizontal divider */}
        <div className="border-t border-[#6E6A62]/30" />

        {/* Footer Links — no vertical padding on container so border-r connects to horizontal line */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
          {/* Email Subscribe */}
          <div className="lg:w-[30%] lg:pr-12 lg:border-r lg:border-[#6E6A62]/30 lg:shrink-0 pt-14 pb-14">
            <SubscribeForm />
          </div>

          {/* Right side — 4 link columns */}
          <div className="lg:flex-1 lg:pl-12 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-10 sm:gap-8 pt-14 pb-14">
            {/* Navigate */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                Navigate
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Shop", href: "/" },
                  { label: "Become a Glow Girl", href: "/become-a-glow-girl" },
                  { label: "Our Story", href: "/about" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6E6A62]/70 hover:text-[#6E6A62] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                Official
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                  { label: "Accessibility", href: "/accessibility" },
                  { label: "FAQ", href: "/faq" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#6E6A62]/70 hover:text-[#6E6A62] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#6E6A62] font-inter">
                Support
              </h4>
              <p className="text-sm text-[#6E6A62]/70 leading-relaxed">
                We&apos;re here M-F 9am&ndash;5pm PST.
              </p>
              <SupportForm />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#6E6A62]/10 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-[#6E6A62]/40 uppercase tracking-wider font-inter">
          <span>&copy; {new Date().getFullYear()} Glow Labs. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
