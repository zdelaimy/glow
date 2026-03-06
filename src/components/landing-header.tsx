"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export function LandingHeader({ variant = "hero", hideNav = false }: { variant?: "hero" | "light"; hideNav?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [userLink, setUserLink] = useState<{ href: string; label: string } | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'ADMIN') {
        setUserLink({ href: '/admin', label: 'Admin Dashboard' })
      } else if (profile?.role === 'GLOW_GIRL') {
        setUserLink({ href: '/glow-girl/dashboard', label: 'Glow Girl Dashboard' })
      }
    })
  }, [])

  // hero: transparent at top, solid on scroll (for pages with dark hero images)
  // light: solid at top, transparent on scroll (for pages with white backgrounds)
  const showSolid = variant === "hero" ? scrolled : !scrolled

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showSolid
          ? "bg-[#f5f0eb] shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      )}
    >
      <nav className="relative flex items-center justify-between px-6 md:px-10 pt-7 pb-4 font-inter">
        {/* Logo — left */}
        <Link href="/" className="flex items-center">
          <span
            className={cn(
              "font-inter text-[2rem] tracking-tight transition-colors duration-300 leading-none font-medium",
              showSolid
                ? "text-[#6E6A62]"
                : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            )}
          >
            Glow Labs
          </span>
        </Link>

        {/* Right nav */}
        {!hideNav && <div className="flex items-center gap-5">
          {userLink ? (
            <Link
              href={userLink.href}
              className={cn(
                "text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300 px-4 py-1.5 rounded-full border",
                showSolid
                  ? "text-[#6E6A62] border-[#6E6A62] hover:bg-[#6E6A62] hover:text-white"
                  : "text-white/90 border-white/60 hover:bg-white hover:text-[#6E6A62] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
              )}
            >
              {userLink.label}
            </Link>
          ) : (
            <>
              <Link
                href="/glow-girls"
                className={cn(
                  "hidden sm:block text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300 px-4 py-1.5 rounded-full border",
                  showSolid
                    ? "text-[#6E6A62] border-[#6E6A62] hover:bg-[#6E6A62] hover:text-white"
                    : "text-white/90 border-white/60 hover:bg-white hover:text-[#6E6A62] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                )}
              >
                Become a Glow Girl
              </Link>
              <Link
                href="/login"
                className={cn(
                  "text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300",
                  showSolid
                    ? "text-[#6E6A62] hover:text-neutral-600"
                    : "text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                )}
              >
                Sign in
              </Link>
            </>
          )}
        </div>}
      </nav>
    </header>
  )
}
