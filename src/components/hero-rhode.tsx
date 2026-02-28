"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { heroSlides } from "@/lib/hero-images"
import { useCarousel } from "@/hooks/use-carousel"
import { useRef, useEffect } from "react"

function HeroVideo({ src, active }: { src: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    if (active) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
  }, [active])

  return (
    <div
      className="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out"
      style={{ opacity: active ? 1 : 0 }}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        muted
        autoPlay={active}
        playsInline
        loop
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}

export function HeroRhode() {
  const { current, goTo } = useCarousel(heroSlides.length, 7000)
  const slide = heroSlides[current]

  return (
    <section className="bg-[#f5f0eb] px-3 pb-3 pt-3 md:px-4 md:pb-4 md:pt-4">
      {/* Inset video container with rounded corners */}
      <div className="relative w-full h-[calc(100vh-24px)] md:h-[calc(100vh-32px)] rounded-[8px] overflow-hidden">
        {/* Background videos */}
        {heroSlides.map((s, i) => (
          <HeroVideo key={s.src} src={s.src} active={i === current} />
        ))}

        {/* Warm tint overlay */}
        <div className="absolute inset-0 z-[1] bg-amber-900/10 pointer-events-none" />

        {/* Bottom gradient for text legibility */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content — bottom-left editorial */}
        <div className="absolute inset-0 z-[5] flex flex-col justify-end px-8 md:px-14 pb-12 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
            >
              <h1 className="text-[2.75rem] md:text-[3.75rem] lg:text-[4.5rem] text-white leading-[1.08] max-w-2xl tracking-tight">
                {slide.headline}
              </h1>
              <p className="mt-3 text-base md:text-lg text-white/80 max-w-md tracking-wide font-inter">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-5"
          >
            <Link href="/welcome">
              <button className="h-9 px-5 rounded-full bg-white text-neutral-900 text-[11px] uppercase tracking-[0.18em] font-medium font-inter hover:bg-white/90 transition-colors cursor-pointer">
                Start Your Journey
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Slide indicators — bottom-right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="absolute bottom-12 right-8 md:right-14 z-[5] flex gap-1.5"
        >
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-[3px] rounded-full transition-all duration-500 cursor-pointer ${
                i === current
                  ? "w-8 bg-white"
                  : "w-4 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
