'use client'

import { useEffect, useRef } from 'react'

interface CalendlyEmbedProps {
  url: string
}

export function CalendlyEmbed({ url }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup on unmount
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget rounded-xl overflow-hidden"
      data-url={url}
      style={{ minWidth: '280px', height: '630px' }}
    />
  )
}
