'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'
import { Crown, Users, TrendingUp, ArrowRight, Sparkles, ChevronDown, ChevronUp, UserPlus } from 'lucide-react'
import Link from 'next/link'

/* ── comp plan constants ─────────────────────────────── */
const SERUM_PRICE = 80 // Glow Serum — $80/unit
const COMMISSION_RATE = 0.25
const ALL_LEVELS = [
  { level: 1, rate: 0.10, label: '10%' },
  { level: 2, rate: 0.05, label: '5%' },
  { level: 3, rate: 0.04, label: '4%' },
  { level: 4, rate: 0.03, label: '3%' },
  { level: 5, rate: 0.02, label: '2%' },
  { level: 6, rate: 0.01, label: '1%' },
  { level: 7, rate: 0.01, label: '1%' },
]

/* ── helpers ──────────────────────────────────────────── */

function formatMoneyFull(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

/* ── slider component ─────────────────────────────────── */
function PremiumSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60 font-inter font-medium">
          {label}
        </span>
        <span className="text-2xl font-light text-[#6E6A62] tabular-nums">
          {value}{suffix && <span className="text-sm text-[#6E6A62]/40 ml-1">{suffix}</span>}
        </span>
      </div>
      <div className="relative h-10 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-[#6E6A62]/10" />
        {/* Filled track */}
        <div
          className="absolute left-0 h-[3px] rounded-full bg-[#6E6A62]/50 transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-10 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6E6A62]
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.15)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6E6A62]
            [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent"
        />
      </div>
    </div>
  )
}

/* ── animated counter ─────────────────────────────────── */
function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  return (
    <motion.span
      key={Math.round(value)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="inline-block"
    >
      {prefix}{Math.round(value).toLocaleString()}
    </motion.span>
  )
}

/* ── downline tree visualization ──────────────────────── */
function DownlineTree({ recruits, branchFactor, activeLevels }: { recruits: number; branchFactor: number; activeLevels: number }) {
  const levels = ALL_LEVELS.slice(0, activeLevels).map((l, i) => {
    const people = Math.round(recruits * Math.pow(branchFactor, i))
    return { ...l, people }
  })

  return (
    <div className="relative">
      {/* You — the root */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="w-12 h-12 rounded-full bg-[#6E6A62] flex items-center justify-center shadow-lg z-10"
        >
          <Crown className="w-5 h-5 text-white" />
        </motion.div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A62] font-inter font-medium mt-2 mb-1">
          You
        </p>
      </div>

      {/* Levels with branch lines */}
      <div className="relative">
        {levels.map((level, i) => {
          const nodeCount = Math.min(level.people, 2 + i) // show up to 2+i dots per row for visual
          const dots = Math.min(nodeCount, 7) // cap visual dots
          const isLast = i === levels.length - 1

          return (
            <motion.div
              key={level.level}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative"
            >
              {/* Branch lines from center */}
              <div className="flex justify-center">
                <svg
                  width="100%"
                  height="24"
                  className="overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Vertical trunk */}
                  <line
                    x1="50%"
                    y1="0"
                    x2="50%"
                    y2="12"
                    stroke="#6E6A62"
                    strokeOpacity="0.15"
                    strokeWidth="1.5"
                  />
                  {/* Horizontal spread */}
                  {dots > 1 && (
                    <line
                      x1={`${50 - (dots - 1) * 5}%`}
                      y1="12"
                      x2={`${50 + (dots - 1) * 5}%`}
                      y2="12"
                      stroke="#6E6A62"
                      strokeOpacity="0.15"
                      strokeWidth="1.5"
                    />
                  )}
                  {/* Vertical drops to each node */}
                  {Array.from({ length: dots }).map((_, d) => {
                    const x = dots === 1 ? 50 : 50 - (dots - 1) * 5 + d * 10
                    return (
                      <line
                        key={d}
                        x1={`${x}%`}
                        y1="12"
                        x2={`${x}%`}
                        y2="24"
                        stroke="#6E6A62"
                        strokeOpacity="0.15"
                        strokeWidth="1.5"
                      />
                    )
                  })}
                </svg>
              </div>

              {/* Node dots */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {Array.from({ length: dots }).map((_, d) => (
                  <div
                    key={d}
                    className="w-3 h-3 rounded-full bg-[#6E6A62]"
                    style={{ opacity: 0.15 + 0.12 * (7 - i) / 7 }}
                  />
                ))}
                {level.people > dots && (
                  <span className="text-[10px] text-[#6E6A62]/30 font-inter ml-0.5">
                    +{(level.people - dots).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Level info */}
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <span className="text-xs font-inter font-semibold text-[#6E6A62]/50 uppercase tracking-wider">
                  L{level.level}
                </span>
                <span className="text-sm text-[#6E6A62] font-medium">
                  {level.people.toLocaleString()} {level.people === 1 ? 'person' : 'people'}
                </span>
                <span className="text-xs font-medium text-[#6E6A62]/50 font-inter">
                  {level.label} override
                </span>
              </div>

              {/* Trunk to next level */}
              {!isLast && (
                <div className="flex justify-center">
                  <div className="w-[1.5px] h-2 bg-[#6E6A62]/15" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Total */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
        className="text-center mt-6 pt-5 border-t border-[#6E6A62]/10"
      >
        <span className="text-2xl font-light text-[#6E6A62]">
          {levels.reduce((sum, l) => sum + l.people, 0).toLocaleString()}
        </span>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#6E6A62]/50 font-inter mt-1">
          Total in your downline
        </p>
      </motion.div>
    </div>
  )
}

/* ── main page ────────────────────────────────────────── */
export default function FoundersPage() {
  const [personalSales, setPersonalSales] = useState(20)
  const [directRecruits, setDirectRecruits] = useState(5)
  const [recruitSales, setRecruitSales] = useState(15)
  const [activeLevels, setActiveLevels] = useState(7)
  const [branchFactor, setBranchFactor] = useState(2)

  const earnings = useMemo(() => {
    const personal = personalSales * SERUM_PRICE * COMMISSION_RATE

    const levelEarnings = ALL_LEVELS.slice(0, activeLevels).map((level, i) => {
      const peopleAtLevel = Math.round(directRecruits * Math.pow(branchFactor, i))
      const levelSalesVolume = peopleAtLevel * recruitSales * SERUM_PRICE
      const override = levelSalesVolume * level.rate
      return {
        ...level,
        people: peopleAtLevel,
        salesVolume: levelSalesVolume,
        override,
      }
    })

    const totalOverrides = levelEarnings.reduce((sum, l) => sum + l.override, 0)

    const total = personal + totalOverrides

    return { personal, levelEarnings, totalOverrides, total }
  }, [personalSales, directRecruits, recruitSales, activeLevels, branchFactor])

  return (
    <div className="min-h-screen bg-[#f5f0eb]">
      <LandingHeader variant="light" ctaHref="/apply" ctaLabel="Apply Now" />

      <main>
        {/* ── Hero ── */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#6E6A62] text-white text-[10px] uppercase tracking-[0.2em] font-inter font-medium px-4 py-1.5 rounded-full mb-8">
                <Sparkles className="w-3 h-3" />
                Limited founding positions
              </div>

              <h1 className="text-4xl md:text-6xl leading-[1.05] text-[#6E6A62] font-light tracking-tight mb-6">
                Become a{' '}
                <span className="italic">Founding</span><br />
                Glow Girl
              </h1>

              <p className="text-[#6E6A62]/55 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10">
                The first to join sit at the top. As your network grows through 7 levels,
                you earn on every single sale beneath you — forever.
              </p>

              <div className="flex items-center justify-center gap-2 text-[#6E6A62]/40">
                <span className="text-xs uppercase tracking-[0.15em] font-inter">See how much you could earn</span>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Earnings Calculator ── */}
        <section className="pb-24 md:pb-32">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/50 mb-3 font-inter">
                Earnings Calculator
              </p>
              <h2 className="text-3xl md:text-4xl text-[#6E6A62] font-light">
                Slide to see your <span className="italic">potential</span>
              </h2>
            </div>

            {/* Total — pinned to top */}
            <div className="bg-[#6E6A62] rounded-2xl p-6 md:p-8 mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-inter font-medium mb-2">
                Your Estimated Earnings
              </p>
              <div className="text-3xl md:text-4xl font-light text-white mb-1">
                <AnimatedNumber value={earnings.total} />
                <span className="text-sm text-white/40 font-inter ml-1">/mo</span>
              </div>
              <div className="text-4xl md:text-5xl font-light text-white mt-2">
                <AnimatedNumber value={earnings.total * 12} />
                <span className="text-base text-white/40 font-inter ml-1">/year</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
              {/* Left — Sliders + Breakdown */}
              <div className="space-y-6">
                {/* Sliders */}
                <div className="bg-white rounded-2xl border border-[#6E6A62]/[0.06] p-6 md:p-8 space-y-8">
                  <div className="flex items-center gap-2 bg-[#6E6A62]/[0.04] rounded-lg px-4 py-2.5 -mt-1 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#6E6A62]/50 flex-shrink-0" />
                    <p className="text-xs text-[#6E6A62]/60 font-inter">
                      Each unit is the <span className="font-medium text-[#6E6A62]/80">Glow Serum — $80</span>. Adjust levels and branching below.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active levels', value: activeLevels, min: 4, max: 7, onChange: setActiveLevels, suffix: activeLevels === 1 ? 'level' : 'levels' },
                      { label: 'Each person recruits', value: branchFactor, min: 2, max: 5, onChange: setBranchFactor, suffix: 'others' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60 font-inter font-medium">
                          {item.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => item.value < item.max && item.onChange(item.value + 1)}
                              disabled={item.value >= item.max}
                              className="w-7 h-7 rounded-md bg-[#6E6A62]/[0.06] hover:bg-[#6E6A62]/[0.12] disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <ChevronUp className="w-3.5 h-3.5 text-[#6E6A62]" />
                            </button>
                            <button
                              onClick={() => item.value > item.min && item.onChange(item.value - 1)}
                              disabled={item.value <= item.min}
                              className="w-7 h-7 rounded-md bg-[#6E6A62]/[0.06] hover:bg-[#6E6A62]/[0.12] disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5 text-[#6E6A62]" />
                            </button>
                          </div>
                          <div className="flex-1 text-center">
                            <span className="text-2xl font-light text-[#6E6A62] tabular-nums">{item.value}</span>
                            <span className="text-sm text-[#6E6A62]/40 ml-1">{item.suffix}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#6E6A62]/[0.06] pt-6" />
                  <PremiumSlider
                    label="Your personal sales"
                    value={personalSales}
                    min={1}
                    max={100}
                    step={1}
                    suffix="units/mo"
                    onChange={setPersonalSales}
                  />
                  <PremiumSlider
                    label="Direct recruits"
                    value={directRecruits}
                    min={2}
                    max={20}
                    step={1}
                    suffix="people"
                    onChange={setDirectRecruits}
                  />
                  <PremiumSlider
                    label="Avg recruit sales"
                    value={recruitSales}
                    min={1}
                    max={50}
                    step={1}
                    suffix="units/mo"
                    onChange={setRecruitSales}
                  />

                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-[#6E6A62]/[0.06] p-6 md:p-8">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-inter font-medium mb-5">
                    Monthly Earnings Breakdown
                  </h3>

                  {/* Personal */}
                  <div className="py-3 border-b border-[#6E6A62]/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#6E6A62]">Personal commission</span>
                      <span className="text-sm text-[#6E6A62] font-medium tabular-nums">
                        {formatMoneyFull(earnings.personal)}/mo
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6A62]/40 font-inter mt-1">
                      25% × {personalSales} units × $80/unit
                    </p>
                  </div>

                  {/* Level overrides */}
                  {earnings.levelEarnings.map((level) => (
                    <div
                      key={level.level}
                      className="py-3 border-b border-[#6E6A62]/[0.06] last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#6E6A62]/[0.06] flex items-center justify-center text-[9px] font-inter text-[#6E6A62]/60">
                            {level.level}
                          </span>
                          <span className="text-sm font-medium text-[#6E6A62]">
                            Level {level.level} override
                          </span>
                        </div>
                        <span className="text-sm text-[#6E6A62] font-medium tabular-nums">
                          {formatMoneyFull(level.override)}/mo
                        </span>
                      </div>
                      <p className="text-xs text-[#6E6A62]/40 font-inter mt-1 pl-7">
                        {level.label} × {level.people.toLocaleString()} people × {recruitSales} units × $80/unit
                      </p>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-[#6E6A62]/15 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#6E6A62]">Total</span>
                    <span className="text-base text-[#6E6A62] font-medium tabular-nums">
                      {formatMoneyFull(earnings.total)}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Right — Downline Tree */}
              <div className="bg-white rounded-2xl border border-[#6E6A62]/[0.06] p-6 md:p-8 lg:sticky lg:top-24">
                {/* Organic placement callout */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-xl bg-[#6E6A62]/[0.04] border border-dashed border-[#6E6A62]/15 p-5 mb-6"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-8 h-8 rounded-full bg-[#6E6A62]/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#6E6A62]/60" />
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-[#6E6A62] leading-snug">
                        Your network fills automatically
                      </p>
                      <p className="text-xs text-[#6E6A62]/50 leading-relaxed mt-1.5">
                        When a new creator joins Glow without a referrer, they&apos;re placed under the founding layer.
                        Every organic sign-up grows <span className="font-medium text-[#6E6A62]/70">your</span> downline — no recruiting needed.
                      </p>
                      <p className="text-sm uppercase tracking-[0.15em] text-[#6E6A62] font-inter font-bold mt-3">
                        The earlier you join, the more you capture
                      </p>
                    </div>
                  </div>
                </motion.div>

                <h3 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-inter font-medium mb-6 text-center">
                  Your Downline Network
                </h3>
                <DownlineTree recruits={directRecruits} branchFactor={branchFactor} activeLevels={activeLevels} />
              </div>
            </div>
          </div>
        </section>

        {/* ── Commission Table ── */}
        <section className="pb-24 md:pb-32">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/50 mb-3 font-inter">
                How You Get Paid
              </p>
              <h2 className="text-3xl md:text-4xl text-[#6E6A62] font-light">
                Your commission at <span className="italic">every</span> level
              </h2>
              <p className="text-sm text-[#6E6A62]/50 mt-3 max-w-lg mx-auto">
                You earn a percentage every time someone in your network makes a sale.
                The deeper your network, the more you earn.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#6E6A62]/[0.06] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-3 bg-[#6E6A62] text-white px-6 py-4">
                <span className="text-sm font-inter font-semibold">Level</span>
                <span className="text-sm font-inter font-semibold text-center">You Earn</span>
                <span className="text-sm font-inter font-semibold text-right">What This Means</span>
              </div>

              {/* Personal row */}
              <div className="grid grid-cols-3 items-center px-6 py-4 bg-[#6E6A62]/[0.04] border-b border-[#6E6A62]/[0.06]">
                <div>
                  <span className="text-base font-semibold text-[#6E6A62]">You</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#6E6A62]">25%</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[#6E6A62]/60">Your own sales</span>
                </div>
              </div>

              {/* Level rows */}
              {ALL_LEVELS.map((level, i) => (
                <div
                  key={level.level}
                  className={`grid grid-cols-3 items-center px-6 py-4 border-b border-[#6E6A62]/[0.06] last:border-0 ${
                    i % 2 === 0 ? '' : 'bg-[#6E6A62]/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#6E6A62]/[0.08] flex items-center justify-center text-sm font-bold text-[#6E6A62] font-inter">
                      {level.level}
                    </span>
                    <span className="text-sm font-medium text-[#6E6A62]">
                      Level {level.level}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#6E6A62]">{level.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-[#6E6A62]/60">
                      {level.level === 1
                        ? 'People you recruit'
                        : level.level === 2
                        ? 'Their recruits'
                        : `${level.level} layers below you`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-[#6E6A62]/50 mt-6 max-w-md mx-auto leading-relaxed">
              <span className="font-semibold text-[#6E6A62]/70">Example:</span> Someone 3 levels below you sells a $80 serum.
              You automatically earn <span className="font-semibold text-[#6E6A62]/70">$3.20</span> (4%) — without doing anything.
            </p>
          </div>
        </section>

        {/* ── Why Founding Matters ── */}
        <section className="py-24 md:py-32 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/50 mb-3 font-inter">
                The Founder Advantage
              </p>
              <h2 className="text-3xl md:text-4xl text-[#6E6A62] font-light leading-tight">
                Early means <span className="italic">everything</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Crown,
                  title: 'Top of the tree',
                  description:
                    'Founders sit at Level 0. Everyone who joins after you falls into your downline — not the other way around. Position matters more than anything.',
                },
                {
                  icon: Users,
                  title: '7 levels of income',
                  description:
                    'You earn overrides on 7 levels deep. Each person recruits 2–3 more. By Level 7, that\'s thousands of people generating sales — and you earn on every one of them.',
                },
                {
                  icon: TrendingUp,
                  title: 'Automatic growth',
                  description:
                    'When new creators join Glow without a referrer, they\'re placed under the founding layer. Your network grows organically — even when you\'re not actively recruiting.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-[#f5f0eb] rounded-2xl p-7"
                >
                  <div className="w-10 h-10 rounded-full bg-[#6E6A62]/[0.07] flex items-center justify-center mb-5">
                    <item.icon className="w-4.5 h-4.5 text-[#6E6A62]/70" />
                  </div>
                  <h3 className="text-base font-medium text-[#6E6A62] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6E6A62]/55 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            {/* The math */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-14 bg-[#6E6A62] rounded-2xl p-8 md:p-12 text-white"
            >
              <h3 className="text-xl md:text-2xl font-light mb-6 text-center">
                The math speaks for itself
              </h3>
              <div className={`grid grid-cols-4 ${activeLevels <= 4 ? 'md:grid-cols-' + (activeLevels + 1) : 'md:grid-cols-8'} gap-3 mb-8`}>
                {['You', ...Array.from({ length: activeLevels }, (_, i) => `L${i + 1}`)].map((label, i) => {
                  const people = i === 0 ? 1 : Math.round(directRecruits * Math.pow(branchFactor, i - 1))
                  return (
                    <div key={label} className="text-center">
                      <div className={`text-lg md:text-2xl font-light mb-1 ${i === 0 ? 'text-white' : 'text-white/80'}`}>
                        {people.toLocaleString()}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-inter">
                        {label}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-center border-t border-white/10 pt-6">
                <p className="text-white/50 text-sm font-inter mb-2">
                  With {directRecruits} personal recruit{directRecruits !== 1 ? 's' : ''} — each person recruits {branchFactor} more:
                </p>
                <p className="text-3xl md:text-4xl font-light">
                  {Array.from({ length: activeLevels }, (_, i) => Math.round(directRecruits * Math.pow(branchFactor, i))).reduce((a, b) => a + b, 0).toLocaleString()} people <span className="text-white/40 text-lg">in your downline</span>
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── How it compounds ── */}
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-[#6E6A62]/50 mb-3 font-inter">
                The Compounding Effect
              </p>
              <h2 className="text-3xl md:text-4xl text-[#6E6A62] font-light leading-tight">
                Your income grows <span className="italic">exponentially</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { month: 'Month 1', desc: 'You join + recruit 5 people', income: '$1,400', highlight: false },
                { month: 'Month 3', desc: 'Your recruits each bring 3 more → 20 people in your network', income: '$4,500', highlight: false },
                { month: 'Month 6', desc: 'Network hits 200 people across 4 levels', income: '$14,000', highlight: false },
                { month: 'Month 12', desc: '5,000+ people across all 7 levels', income: '$102,000+', highlight: true },
              ].map((item, i) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between rounded-xl border px-6 py-5 ${
                    item.highlight
                      ? 'bg-[#6E6A62] border-[#6E6A62] text-white'
                      : 'bg-white border-[#6E6A62]/[0.06]'
                  }`}
                >
                  <div>
                    <span className={`text-xs uppercase tracking-[0.15em] font-inter font-medium ${
                      item.highlight ? 'text-white/50' : 'text-[#6E6A62]/40'
                    }`}>
                      {item.month}
                    </span>
                    <p className={`text-sm mt-0.5 ${
                      item.highlight ? 'text-white/80' : 'text-[#6E6A62]/70'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                  <span className={`text-xl md:text-2xl font-light tabular-nums ${
                    item.highlight ? 'text-white' : 'text-[#6E6A62]'
                  }`}>
                    {item.income}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-[#6E6A62]/35 mt-6 font-inter">
              Projections based on 5 direct recruits, each person recruits 3 more, average sales of 20 units/month at $80/unit (Glow Serum). Actual results vary.
            </p>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="pb-28 md:pb-36">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl text-[#6E6A62] font-light leading-tight mb-4">
                The window is <span className="italic">now</span>
              </h2>
              <p className="text-[#6E6A62]/55 text-base max-w-md mx-auto mb-8">
                Founding positions are limited. Once they&apos;re filled, new members join beneath existing founders — not alongside them.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-[#6E6A62] text-white text-sm font-inter font-medium px-8 py-3.5 rounded-full hover:bg-[#5E5A52] transition-colors"
              >
                Apply as a Founding Glow Girl
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-[#6E6A62]/35 mt-4 font-inter">
                $200/month · Cancel anytime · Start earning immediately
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
