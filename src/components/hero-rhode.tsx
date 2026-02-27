"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { heroImages } from "@/lib/hero-images"
import { useCarousel } from "@/hooks/use-carousel"

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "4%" : "-4%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-4%" : "4%",
    opacity: 0,
  }),
}

export function HeroRhode() {
  const { current, direction, goTo } = useCarousel(heroImages.length, 5000)
  const slide = heroImages[current]

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-900">
      {/* Background carousel — direction-aware slide + fade */}
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={current === 0}
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Minimal bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

      {/* Content — bottom-left editorial */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-12 lg:px-20 pb-20 md:pb-24">
        {/* Product name + "by Glow" */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] max-w-lg">
              {slide.product}
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/50 tracking-wide">
              {slide.glowGirl}&apos;s formula{" "}
              <span className="text-white/70">by Glow</span>
            </p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <Link href="/login">
            <button className="h-10 px-6 rounded-full bg-white/90 text-neutral-900 text-xs uppercase tracking-[0.15em] font-medium hover:bg-white transition-colors cursor-pointer">
              Discover Your Serum
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Thin line indicators — bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-10 right-6 md:right-12 lg:right-20 z-10 flex gap-1.5"
      >
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-0.5 rounded-full transition-all duration-500 cursor-pointer ${
              i === current
                ? "w-10 bg-white"
                : "w-5 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </motion.div>
    </section>
  )
}
