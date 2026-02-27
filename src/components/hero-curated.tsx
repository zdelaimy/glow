"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { heroImages } from "@/lib/hero-images"
import { useCarousel } from "@/hooks/use-carousel"

export function HeroCurated() {
  const { current, goTo } = useCarousel(heroImages.length, 6000)

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-900">
      {/* Background carousel */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroImages[current].src}
            alt={heroImages[current].alt}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Triple overlay */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-amber-950/15" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs uppercase tracking-[0.2em] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            Glow Girl Skincare Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-white"
        >
          Your skin.{" "}
          <em className="text-amber-300 not-italic font-serif italic">
            Your Glow Girl.
          </em>
          <br />
          Your glow.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-base md:text-lg text-white/60 max-w-md"
        >
          Custom serums designed by Glow Girls, blended just for you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-3"
        >
          <Link href="/login">
            <button className="h-12 px-8 rounded-full bg-[#F5F0E8] text-neutral-900 font-medium text-sm hover:bg-[#EDE7DA] transition-colors cursor-pointer">
              Find Your Serum
            </button>
          </Link>
          <Link href="/glow-girls">
            <button className="h-12 px-8 rounded-full bg-white/10 text-white border border-white/30 font-medium text-sm hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer">
              Start Your Brand
            </button>
          </Link>
        </motion.div>

        {/* Dot indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="absolute bottom-10 flex gap-2"
        >
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                i === current
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
