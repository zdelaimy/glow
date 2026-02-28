"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#f5f0eb] shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      )}
    >
      <nav className="relative flex items-center justify-between px-6 md:px-10 pt-7 pb-4 font-inter">
        {/* Left nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/shop"
            className={cn(
              "text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300",
              scrolled
                ? "text-neutral-800 hover:text-neutral-600"
                : "text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            )}
          >
            Shop
          </Link>
        </div>

        {/* Centered logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
        >
          <span
            className={cn(
              "font-inter text-[2rem] tracking-tight transition-colors duration-300 leading-none font-medium",
              scrolled
                ? "text-neutral-900"
                : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
            )}
          >
            GLOW
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-5">
          <Link
            href="/glow-girls"
            className={cn(
              "hidden sm:block text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300 px-4 py-1.5 rounded-full border",
              scrolled
                ? "text-neutral-800 border-neutral-800 hover:bg-neutral-800 hover:text-white"
                : "text-white/90 border-white/60 hover:bg-white hover:text-neutral-900 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            )}
          >
            Become a Glow Girl
          </Link>
          <Link
            href="/login"
            className={cn(
              "text-sm md:text-base uppercase tracking-[0.12em] font-medium transition-colors duration-300",
              scrolled
                ? "text-neutral-800 hover:text-neutral-600"
                : "text-white/90 hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            )}
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  )
}
