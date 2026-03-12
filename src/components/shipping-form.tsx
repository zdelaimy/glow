'use client'

export interface ShippingInfo {
  name: string
  email: string
  address: string
  city: string
  state: string
  zip: string
}

interface Props {
  shipping: ShippingInfo
  onChange: (shipping: ShippingInfo) => void
}

const inputClass =
  'w-full border border-neutral-200 rounded-sm px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 focus:outline-none focus:border-neutral-400'
const labelClass = 'block text-[11px] uppercase tracking-[0.12em] text-neutral-400 mb-1'

export function ShippingForm({ shipping, onChange }: Props) {
  function update(field: keyof ShippingInfo, value: string) {
    onChange({ ...shipping, [field]: value })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/60 font-medium">
        Shipping Information
      </p>

      <div>
        <label className={labelClass}>Full Name</label>
        <input
          type="text"
          placeholder="Jane Doe"
          value={shipping.name}
          onChange={e => update('name', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          placeholder="jane@example.com"
          value={shipping.email}
          onChange={e => update('email', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Street Address</label>
        <input
          type="text"
          placeholder="123 Main St, Apt 4"
          value={shipping.address}
          onChange={e => update('address', e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        <div className="col-span-2">
          <label className={labelClass}>City</label>
          <input
            type="text"
            placeholder="New York"
            value={shipping.city}
            onChange={e => update('city', e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div className="col-span-1">
          <label className={labelClass}>State</label>
          <input
            type="text"
            placeholder="NY"
            maxLength={2}
            value={shipping.state}
            onChange={e => update('state', e.target.value.toUpperCase())}
            className={inputClass}
            required
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>ZIP Code</label>
          <input
            type="text"
            placeholder="10001"
            maxLength={10}
            value={shipping.zip}
            onChange={e => update('zip', e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>
    </div>
  )
}

export function validateShipping(s: ShippingInfo): string | null {
  if (!s.name.trim()) return 'Name is required'
  if (!s.email.trim() || !s.email.includes('@')) return 'Valid email is required'
  if (!s.address.trim()) return 'Address is required'
  if (!s.city.trim()) return 'City is required'
  if (!s.state.trim() || s.state.length !== 2) return 'Valid 2-letter state is required'
  if (!s.zip.trim()) return 'ZIP code is required'
  return null
}

export const emptyShipping: ShippingInfo = {
  name: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
}
