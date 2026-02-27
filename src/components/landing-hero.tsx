'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function LandingHero() {
  return (
    <section className="py-24 md:py-36 text-center max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          Glow Girl Commerce Platform
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1] mb-6"
      >
        Your skin.{' '}
        <span className="font-semibold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
          Your Glow Girl.
        </span>
        <br />
        Your glow.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
      >
        Glow Girls design signature custom serums. You take a quick quiz.
        We blend it just for you. It&apos;s skincare, reimagined.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600">
            Find Your Serum
          </Button>
        </Link>
        <Link href="/glow-girls">
          <Button size="lg" variant="outline" className="h-12 px-8 text-base">
            Start Your Brand
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
