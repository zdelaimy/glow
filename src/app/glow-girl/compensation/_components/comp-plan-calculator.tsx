'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const SERUM_PRICE = 80
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

function formatMoney(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

function Slider({
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
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-[#6E6A62]/10" />
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
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#6E6A62]
            [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-track]:bg-transparent"
        />
      </div>
    </div>
  )
}

export function CompPlanCalculator() {
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
    <div className="space-y-6">
      {/* Total */}
      <div className="bg-[#6E6A62] rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-white/40 font-inter font-medium mb-2">
          Estimated Monthly Earnings
        </p>
        <div className="text-3xl font-light text-white">
          {formatMoney(earnings.total)}
          <span className="text-sm text-white/40 font-inter ml-1">/mo</span>
        </div>
        <div className="text-xl font-light text-white/70 mt-1">
          {formatMoney(earnings.total * 12)}
          <span className="text-sm text-white/40 font-inter ml-1">/year</span>
        </div>
      </div>

      {/* Stepper controls */}
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

      {/* Sliders */}
      <div className="space-y-6 border-t border-[#6E6A62]/[0.06] pt-6">
        <Slider label="Your personal sales" value={personalSales} min={1} max={100} step={1} suffix="units/mo" onChange={setPersonalSales} />
        <Slider label="Direct recruits" value={directRecruits} min={2} max={20} step={1} suffix="people" onChange={setDirectRecruits} />
        <Slider label="Avg recruit sales" value={recruitSales} min={1} max={50} step={1} suffix="units/mo" onChange={setRecruitSales} />
      </div>

      {/* Breakdown */}
      <div className="border-t border-[#6E6A62]/[0.06] pt-6 space-y-3">
        <h4 className="text-xs uppercase tracking-[0.2em] text-[#6E6A62]/50 font-inter font-medium">Breakdown</h4>

        <div className="py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-[#6E6A62]">Personal commission</span>
          <span className="text-sm text-[#6E6A62] font-medium tabular-nums">{formatMoney(earnings.personal)}/mo</span>
        </div>

        {earnings.levelEarnings.map((level) => (
          <div key={level.level} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#6E6A62]/[0.06] flex items-center justify-center text-[9px] font-inter text-[#6E6A62]/60">
                {level.level}
              </span>
              <span className="text-sm text-[#6E6A62]">
                Level {level.level} — {level.label} of {level.people.toLocaleString()} {level.people === 1 ? 'person' : 'people'}
              </span>
            </div>
            <span className="text-sm text-[#6E6A62] font-medium tabular-nums">{formatMoney(level.override)}/mo</span>
          </div>
        ))}

        <div className="pt-3 border-t border-[#6E6A62]/15 flex items-center justify-between">
          <span className="text-sm font-medium text-[#6E6A62]">Total</span>
          <span className="text-base text-[#6E6A62] font-medium tabular-nums">{formatMoney(earnings.total)}/mo</span>
        </div>
      </div>

      <p className="text-xs text-[#6E6A62]/35 font-inter text-center">
        Based on Glow Serum at $80/unit. Actual results vary.
      </p>
    </div>
  )
}
