'use client'

import { useCallback } from 'react'
import { AddressAutocomplete } from '@/components/address-autocomplete'

export interface ShippingInfo {
  name: string
  email: string
  address: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface Props {
  shipping: ShippingInfo
  onChange: (shipping: ShippingInfo) => void
  hideHeader?: boolean
}

const inputClass =
  'w-full border border-neutral-200 rounded-sm px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400'
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1'

const COUNTRIES = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'KR', label: 'South Korea' },
  { code: 'MX', label: 'Mexico' },
  { code: 'BR', label: 'Brazil' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'SE', label: 'Sweden' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'IE', label: 'Ireland' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AE', label: 'United Arab Emirates' },
]

export function ShippingForm({ shipping, onChange, hideHeader }: Props) {
  function update(field: keyof ShippingInfo, value: string) {
    onChange({ ...shipping, [field]: value })
  }

  const handleAddressSelect = useCallback((parsed: { address: string; address2: string; city: string; state: string; zip: string; country: string }) => {
    onChange({
      ...shipping,
      address: parsed.address,
      address2: parsed.address2 || shipping.address2,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      country: parsed.country,
    })
  }, [shipping, onChange])

  return (
    <form className="space-y-3" autoComplete="on" onSubmit={e => e.preventDefault()}>
      {!hideHeader && (
        <p className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60 font-medium">
          Shipping Information
        </p>
      )}

      <div>
        <label className={labelClass} htmlFor="shipping-name">Full Name</label>
        <input
          id="shipping-name"
          name="name"
          type="text"
          placeholder="Jane Doe"
          value={shipping.name}
          onChange={e => update('name', e.target.value)}
          className={inputClass}
          autoComplete="shipping name"
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="shipping-email">Email</label>
        <input
          id="shipping-email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          value={shipping.email}
          onChange={e => update('email', e.target.value)}
          className={inputClass}
          autoComplete="shipping email"
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="shipping-country">Country</label>
        <select
          id="shipping-country"
          name="country"
          value={shipping.country}
          onChange={e => update('country', e.target.value)}
          className={inputClass}
          autoComplete="shipping country"
          required
        >
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="shipping-address">Street Address</label>
        <AddressAutocomplete
          value={shipping.address}
          onChange={v => update('address', v)}
          onSelect={handleAddressSelect}
          className={inputClass}
          placeholder="Start typing an address..."
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="shipping-address2">Apt, Suite, Unit (optional)</label>
        <input
          id="shipping-address2"
          name="address2"
          type="text"
          placeholder="Apt 4B"
          value={shipping.address2}
          onChange={e => update('address2', e.target.value)}
          className={inputClass}
          autoComplete="shipping address-line2"
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <label className={labelClass} htmlFor="shipping-city">City</label>
          <input
            id="shipping-city"
            name="city"
            type="text"
            placeholder="New York"
            value={shipping.city}
            onChange={e => update('city', e.target.value)}
            className={inputClass}
            autoComplete="shipping address-level2"
            required
          />
        </div>
        <div className="col-span-1">
          <label className={labelClass} htmlFor="shipping-state">State</label>
          <input
            id="shipping-state"
            name="state"
            type="text"
            placeholder="NY"
            maxLength={2}
            value={shipping.state}
            onChange={e => update('state', e.target.value.toUpperCase())}
            className={inputClass}
            autoComplete="shipping address-level1"
            required
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass} htmlFor="shipping-zip">ZIP Code</label>
          <input
            id="shipping-zip"
            name="postal-code"
            type="text"
            placeholder="10001"
            maxLength={10}
            value={shipping.zip}
            onChange={e => update('zip', e.target.value)}
            className={inputClass}
            autoComplete="shipping postal-code"
            required
          />
        </div>
      </div>
    </form>
  )
}

export function validateShipping(s: ShippingInfo): string | null {
  if (!s.name.trim()) return 'Name is required'
  if (!s.email.trim() || !s.email.includes('@')) return 'Valid email is required'
  if (!s.country.trim()) return 'Country is required'
  if (!s.address.trim()) return 'Address is required'
  if (!s.city.trim()) return 'City is required'
  if (!s.state.trim()) return 'State/province is required'
  if (!s.zip.trim()) return 'ZIP/postal code is required'
  return null
}

export const emptyShipping: ShippingInfo = {
  name: '',
  email: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
}

/** Flat-rate international shipping in cents. US is free. */
export function getShippingCost(country: string): number {
  if (country === 'US') return 0
  return 1500 // $15 flat rate for international
}
