'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface ParsedAddress {
  address: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  onSelect: (address: ParsedAddress) => void
  className?: string
  placeholder?: string
}

// Load the Google Maps script once
let loadPromise: Promise<void> | null = null
function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise
  if (typeof window !== 'undefined' && window.google?.maps?.places) {
    return Promise.resolve()
  }

  loadPromise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!key) {
      reject(new Error('Google Places API key not configured'))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Failed to load Google Maps'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

function parsePlace(place: google.maps.places.PlaceResult): ParsedAddress {
  const components = place.address_components || []
  let streetNumber = ''
  let route = ''
  let subpremise = ''
  let city = ''
  let state = ''
  let zip = ''
  let country = ''

  for (const c of components) {
    const types = c.types
    if (types.includes('street_number')) streetNumber = c.long_name
    else if (types.includes('route')) route = c.long_name
    else if (types.includes('subpremise')) subpremise = c.long_name
    else if (types.includes('locality')) city = c.long_name
    else if (types.includes('sublocality_level_1') && !city) city = c.long_name
    else if (types.includes('administrative_area_level_1')) state = c.short_name
    else if (types.includes('postal_code')) zip = c.long_name
    else if (types.includes('country')) country = c.short_name
  }

  return {
    address: streetNumber ? `${streetNumber} ${route}` : route,
    address2: subpremise,
    city,
    state,
    zip,
    country: country || 'US',
  }
}

export function AddressAutocomplete({ value, onChange, onSelect, className, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)
  const onSelectRef = useRef(onSelect)
  const onChangeRef = useRef(onChange)

  // Keep refs current to avoid stale closures in the Google listener
  onSelectRef.current = onSelect
  onChangeRef.current = onChange

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['address_components'],
    })

    autocompleteRef.current = autocomplete

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.address_components) return

      // Capture what user typed before Google replaced it — may contain apt/unit
      const userTyped = inputRef.current?.value || ''

      const parsed = parsePlace(place)

      // If Google didn't return a subpremise, try to extract unit from what user typed
      // Matches patterns like "#22C", "Apt 4B", "Suite 100", "Unit 3", etc.
      if (!parsed.address2) {
        const unitMatch = userTyped.match(/(?:#|apt\.?\s*|suite\s*|unit\s*|ste\.?\s*)(\S+)/i)
        if (unitMatch) {
          parsed.address2 = unitMatch[0].trim()
        }
      }

      // Update the input to show only the street address
      if (inputRef.current) {
        inputRef.current.value = parsed.address
      }
      onChangeRef.current(parsed.address)
      onSelectRef.current(parsed)
    })

    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [ready])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Start typing an address...'}
        className={className}
        autoComplete="off"
      />
      {ready && (
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 pointer-events-none" />
      )}
    </div>
  )
}
