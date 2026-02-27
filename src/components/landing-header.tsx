"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300",
              scrolled
                ? "bg-gradient-to-br from-violet-500 to-rose-400"
                : "bg-white/20 backdrop-blur-sm"
            )}
          >
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span
            className={cn(
              "font-semibold text-lg tracking-tight transition-colors duration-300",
              scrolled ? "text-neutral-900" : "text-white"
            )}
          >
            Glow
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/glow-girls" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors duration-300",
                scrolled
                  ? "text-neutral-700 hover:text-neutral-900"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              For Glow Girls
            </Button>
          </Link>
          <Link href="/login" className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "transition-colors duration-300",
                scrolled
                  ? "text-neutral-700 hover:text-neutral-900"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
            >
              Sign in
            </Button>
          </Link>
          <Link href="/login">
            <Button
              size="sm"
              className={cn(
                "transition-all duration-300",
                scrolled
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white"
                  : "bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25"
              )}
            >
              Become a Glow Girl
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
