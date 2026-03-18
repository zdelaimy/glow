'use client'

import { useState } from 'react'
import { Calendar, ShieldCheck, AlertTriangle, CircleCheck, CircleAlert, ChevronDown, ChevronUp, CreditCard } from 'lucide-react'
import { submitTaxId, submitPayoutMethod } from '@/lib/actions/wallet'
import type { Payout, PayoutMethod } from '@/types/database'

const METHOD_CONFIG: Record<PayoutMethod, { label: string; icon: string; description: string }> = {
  paypal: { label: 'PayPal', icon: 'P', description: 'We\'ll send payouts to your PayPal email' },
  venmo: { label: 'Venmo', icon: 'V', description: 'We\'ll send payouts to your Venmo account' },
  zelle: { label: 'Zelle', icon: 'Z', description: 'We\'ll send payouts via Zelle' },
  direct_deposit: { label: 'Direct Deposit', icon: '$', description: 'We\'ll deposit directly to your bank account' },
}

interface PayoutCardProps {
  glowGirlId: string
  hasTaxId: boolean
  taxIdLast4: string | null
  payoutMethod: {
    method: PayoutMethod
    handle: string | null
    account_holder_name: string | null
    account_number_last4: string | null
    account_type: string | null
  } | null
  estimatedPayoutCents: number
  approvedCents: number
  pendingCents: number
  nextPayoutDate: string
  payoutHistory: Payout[]
}

export function PayoutCard({
  glowGirlId,
  hasTaxId: initialHasTaxId,
  taxIdLast4: initialTaxIdLast4,
  payoutMethod: initialPayoutMethod,
  estimatedPayoutCents,
  approvedCents: _approvedCents,
  pendingCents,
  nextPayoutDate,
  payoutHistory,
}: PayoutCardProps) {
  const [showSsnModal, setShowSsnModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [ssn, setSsn] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null)
  const [handle, setHandle] = useState('')
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasTaxId, setHasTaxId] = useState(initialHasTaxId)
  const [taxIdLast4, setTaxIdLast4] = useState(initialTaxIdLast4)
  const [payoutMethod, setPayoutMethod] = useState(initialPayoutMethod)

  const hasPayoutMethod = !!payoutMethod
  const isPayoutReady = hasTaxId && hasPayoutMethod
  const nextDate = new Date(nextPayoutDate)

  const handleSsnSubmit = async () => {
    setLoading(true)
    setError(null)
    const cleaned = ssn.replace(/\D/g, '')
    const result = await submitTaxId(glowGirlId, cleaned)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setHasTaxId(true)
      setTaxIdLast4(result.last4!)
      setShowSsnModal(false)
      setSsn('')
    }
  }

  const handlePayoutMethodSubmit = async () => {
    if (!selectedMethod) return
    setLoading(true)
    setError(null)

    let result: { success?: boolean; error?: string }

    if (selectedMethod === 'direct_deposit') {
      if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
        setError('Account numbers do not match.')
        setLoading(false)
        return
      }
      result = await submitPayoutMethod(glowGirlId, {
        method: 'direct_deposit',
        accountHolderName: bankForm.accountHolderName,
        routingNumber: bankForm.routingNumber.replace(/\D/g, ''),
        accountNumber: bankForm.accountNumber.replace(/\D/g, ''),
        accountType: bankForm.accountType,
      })
    } else {
      result = await submitPayoutMethod(glowGirlId, {
        method: selectedMethod,
        handle: handle.trim(),
      })
    }

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setPayoutMethod({
        method: selectedMethod,
        handle: selectedMethod !== 'direct_deposit' ? handle.trim() : null,
        account_holder_name: selectedMethod === 'direct_deposit' ? bankForm.accountHolderName : null,
        account_number_last4: selectedMethod === 'direct_deposit' ? bankForm.accountNumber.slice(-4) : null,
        account_type: selectedMethod === 'direct_deposit' ? bankForm.accountType : null,
      })
      resetPayoutForm()
    }
  }

  const resetPayoutForm = () => {
    setShowPayoutModal(false)
    setSelectedMethod(null)
    setHandle('')
    setBankForm({ accountHolderName: '', routingNumber: '', accountNumber: '', confirmAccountNumber: '', accountType: 'checking' })
    setError(null)
  }

  const formatSsnInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  const getPayoutMethodDisplay = () => {
    if (!payoutMethod) return null
    const config = METHOD_CONFIG[payoutMethod.method]
    if (payoutMethod.method === 'direct_deposit') {
      return `${config.label} — ${payoutMethod.account_type} ****${payoutMethod.account_number_last4}`
    }
    return `${config.label} — ${payoutMethod.handle}`
  }

  const isPayoutFormValid = () => {
    if (!selectedMethod) return false
    if (selectedMethod === 'direct_deposit') {
      return (
        bankForm.accountHolderName.trim().length > 0 &&
        bankForm.routingNumber.length === 9 &&
        bankForm.accountNumber.length >= 4 &&
        bankForm.accountNumber === bankForm.confirmAccountNumber
      )
    }
    return handle.trim().length > 0
  }

  return (
    <>
      {/* Payout Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6E6A62]/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#6E6A62]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">Monthly Payout</div>
            </div>
          </div>
          {isPayoutReady && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CircleCheck className="w-3.5 h-3.5" /> Payout ready
            </span>
          )}
        </div>

        {/* Estimated Payout */}
        <div>
          <div className="text-3xl font-light text-[#6E6A62]">
            ${(estimatedPayoutCents / 100).toFixed(2)}
          </div>
          <div className="text-xs text-[#6E6A62]/50 mt-1">
            Estimated payout for {new Date().toLocaleString('default', { month: 'long' })}
          </div>
          {pendingCents > 0 && (
            <div className="text-xs text-amber-600 mt-1">
              ${(pendingCents / 100).toFixed(2)} still in 14-day hold
            </div>
          )}
        </div>

        {/* Next payout date */}
        <div className="flex items-center gap-2 bg-[#f5f0eb]/60 rounded-xl px-4 py-3">
          <Calendar className="w-4 h-4 text-[#6E6A62]/50" />
          <span className="text-sm text-[#6E6A62]/70">
            Next payout: <span className="font-medium text-[#6E6A62]">{nextDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </span>
        </div>

        {/* Setup Checklist */}
        {!isPayoutReady && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <CircleAlert className="w-4 h-4" /> Complete setup to receive payouts
            </div>
            <div className="space-y-2">
              <button
                onClick={() => { setShowSsnModal(true); setError(null) }}
                disabled={hasTaxId}
                className="w-full flex items-center gap-3 text-left text-sm px-3 py-2 rounded-lg hover:bg-amber-100/50 transition-colors disabled:opacity-60 disabled:cursor-default"
              >
                {hasTaxId ? (
                  <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0" />
                )}
                <span className={hasTaxId ? 'text-[#6E6A62]/60 line-through' : 'text-amber-900'}>
                  Submit SSN for tax reporting
                </span>
                {hasTaxId && (
                  <span className="ml-auto text-xs text-[#6E6A62]/40">***-**-{taxIdLast4}</span>
                )}
              </button>

              <button
                onClick={() => { setShowPayoutModal(true); setError(null) }}
                disabled={hasPayoutMethod}
                className="w-full flex items-center gap-3 text-left text-sm px-3 py-2 rounded-lg hover:bg-amber-100/50 transition-colors disabled:opacity-60 disabled:cursor-default"
              >
                {hasPayoutMethod ? (
                  <CircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 shrink-0" />
                )}
                <span className={hasPayoutMethod ? 'text-[#6E6A62]/60 line-through' : 'text-amber-900'}>
                  Choose payout method
                </span>
                {hasPayoutMethod && (
                  <span className="ml-auto text-xs text-[#6E6A62]/40">{getPayoutMethodDisplay()}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Completed setup - show linked info */}
        {isPayoutReady && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-[#f5f0eb]/40">
              <span className="flex items-center gap-2 text-[#6E6A62]/60">
                <ShieldCheck className="w-3.5 h-3.5" /> SSN on file
              </span>
              <span className="text-xs text-[#6E6A62]/40">***-**-{taxIdLast4}</span>
            </div>
            <div className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-[#f5f0eb]/40">
              <span className="flex items-center gap-2 text-[#6E6A62]/60">
                <CreditCard className="w-3.5 h-3.5" /> {getPayoutMethodDisplay()}
              </span>
              <button
                onClick={() => { setShowPayoutModal(true); setError(null) }}
                className="text-xs text-[#6E6A62]/50 underline hover:text-[#6E6A62]"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Payout History */}
        {payoutHistory.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 hover:text-[#6E6A62]/70 transition-colors"
            >
              <span>Payout History</span>
              {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {payoutHistory.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#6E6A62]/60">
                      {new Date(p.period + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#6E6A62]">${(p.total_cents / 100).toFixed(2)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        p.status === 'PAID' ? 'bg-emerald-50 text-emerald-700'
                          : p.status === 'FAILED' ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SSN Modal */}
      {showSsnModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-medium text-[#6E6A62]">Tax Information Required</h3>
            </div>

            <p className="text-sm text-[#6E6A62]/70">
              Before you can receive payouts, we need your Social Security Number for tax reporting purposes.
              As an independent ambassador earning commissions, the IRS requires us to issue a 1099 form for
              annual earnings of $600 or more.
            </p>

            <p className="text-xs text-[#6E6A62]/50">
              Your SSN is encrypted and stored securely. Only the last 4 digits are visible to you after submission.
            </p>

            <div>
              <label className="block text-sm font-medium text-[#6E6A62] mb-1">Social Security Number</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="XXX-XX-XXXX"
                value={formatSsnInput(ssn)}
                onChange={(e) => setSsn(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowSsnModal(false); setError(null); setSsn('') }}
                className="flex-1 rounded-full border border-[#6E6A62]/30 px-4 py-2.5 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSsnSubmit}
                disabled={loading || ssn.replace(/\D/g, '').length !== 9}
                className="flex-1 rounded-full bg-[#6E6A62] text-white px-4 py-2.5 text-sm hover:bg-[#5a574f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Method Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#6E6A62]" />
              <h3 className="text-lg font-medium text-[#6E6A62]">Payout Method</h3>
            </div>

            <p className="text-sm text-[#6E6A62]/70">
              Choose how you&apos;d like to receive your monthly commission payouts.
            </p>

            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(METHOD_CONFIG) as [PayoutMethod, typeof METHOD_CONFIG[PayoutMethod]][]).map(([method, config]) => (
                <button
                  key={method}
                  onClick={() => { setSelectedMethod(method); setError(null); setHandle('') }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm transition-colors ${
                    selectedMethod === method
                      ? 'border-[#6E6A62] bg-[#6E6A62]/5 text-[#6E6A62]'
                      : 'border-neutral-200 text-[#6E6A62]/50 hover:border-[#6E6A62]/30'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedMethod === method ? 'bg-[#6E6A62] text-white' : 'bg-[#f5f0eb] text-[#6E6A62]/60'
                  }`}>
                    {config.icon}
                  </span>
                  <span className="font-medium">{config.label}</span>
                </button>
              ))}
            </div>

            {/* Method-specific form */}
            {selectedMethod && selectedMethod !== 'direct_deposit' && (
              <div className="space-y-3">
                <p className="text-xs text-[#6E6A62]/50">{METHOD_CONFIG[selectedMethod].description}</p>
                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">
                    {selectedMethod === 'paypal' ? 'PayPal Email' : selectedMethod === 'venmo' ? 'Venmo Username' : 'Zelle Email or Phone'}
                  </label>
                  <input
                    type={selectedMethod === 'venmo' ? 'text' : selectedMethod === 'zelle' ? 'text' : 'email'}
                    placeholder={
                      selectedMethod === 'paypal' ? 'you@example.com'
                        : selectedMethod === 'venmo' ? '@username'
                        : 'email or phone number'
                    }
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                  />
                </div>
              </div>
            )}

            {selectedMethod === 'direct_deposit' && (
              <div className="space-y-3">
                <p className="text-xs text-[#6E6A62]/50">{METHOD_CONFIG.direct_deposit.description}</p>

                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    placeholder="Full legal name"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm(f => ({ ...f, accountHolderName: e.target.value }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">Account Type</label>
                  <div className="flex gap-3">
                    {(['checking', 'savings'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setBankForm(f => ({ ...f, accountType: type }))}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm capitalize transition-colors ${
                          bankForm.accountType === type
                            ? 'border-[#6E6A62] bg-[#6E6A62]/5 text-[#6E6A62] font-medium'
                            : 'border-neutral-200 text-[#6E6A62]/50 hover:border-[#6E6A62]/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">Routing Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="9-digit routing number"
                    maxLength={9}
                    value={bankForm.routingNumber}
                    onChange={(e) => setBankForm(f => ({ ...f, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Account number"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6E6A62] mb-1">Confirm Account Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Re-enter account number"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm(f => ({ ...f, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                  />
                </div>
              </div>
            )}

            {selectedMethod && (
              <p className="text-xs text-[#6E6A62]/50">
                Your information is stored securely and only used to process your monthly payouts.
              </p>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={resetPayoutForm}
                className="flex-1 rounded-full border border-[#6E6A62]/30 px-4 py-2.5 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutMethodSubmit}
                disabled={loading || !isPayoutFormValid()}
                className="flex-1 rounded-full bg-[#6E6A62] text-white px-4 py-2.5 text-sm hover:bg-[#5a574f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
