"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export function useCarousel(totalSlides: number, intervalMs = 6000) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % totalSlides)
    }, intervalMs)
  }, [totalSlides, intervalMs])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % totalSlides)
    resetTimer()
  }, [totalSlides, resetTimer])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides)
    resetTimer()
  }, [totalSlides, resetTimer])

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
      resetTimer()
    },
    [current, resetTimer]
  )

  return { current, direction, next, prev, goTo }
}
