'use client'

import { useState } from 'react'
import { Wallet, ArrowDownToLine, ShieldCheck, AlertTriangle } from 'lucide-react'
import { submitTaxId, requestWithdrawal } from '@/lib/actions/wallet'

interface WalletProps {
  glowGirlId: string
  availableBalanceCents: number
  pendingWithdrawalCents: number
  hasTaxId: boolean
  taxIdLast4: string | null
  recentWithdrawals: {
    id: string
    amount_cents: number
    status: string
    created_at: string
  }[]
}

export function WalletCard({
  glowGirlId,
  availableBalanceCents,
  pendingWithdrawalCents,
  hasTaxId: initialHasTaxId,
  taxIdLast4: initialTaxIdLast4,
  recentWithdrawals,
}: WalletProps) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showSsnModal, setShowSsnModal] = useState(false)
  const [ssn, setSsn] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasTaxId, setHasTaxId] = useState(initialHasTaxId)
  const [taxIdLast4, setTaxIdLast4] = useState(initialTaxIdLast4)

  const handleWithdrawClick = () => {
    if (!hasTaxId) {
      setShowSsnModal(true)
    } else {
      setShowWithdrawModal(true)
    }
    setError(null)
    setSuccess(null)
  }

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
      setShowWithdrawModal(true)
    }
  }

  const handleWithdraw = async () => {
    setLoading(true)
    setError(null)
    const cents = Math.round(parseFloat(withdrawAmount) * 100)
    if (isNaN(cents) || cents <= 0) {
      setError('Please enter a valid amount.')
      setLoading(false)
      return
    }
    const result = await requestWithdrawal(glowGirlId, cents)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Withdrawal request submitted! You\'ll receive your payout once approved.')
      setWithdrawAmount('')
      setTimeout(() => {
        setShowWithdrawModal(false)
        setSuccess(null)
      }, 3000)
    }
  }

  const formatSsnInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  return (
    <>
      {/* Wallet Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6E6A62]/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#6E6A62]" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">Wallet Balance</div>
            </div>
          </div>
          {hasTaxId && (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <ShieldCheck className="w-3 h-3" /> SSN on file (***-**-{taxIdLast4})
            </span>
          )}
        </div>

        <div className="text-3xl font-light text-[#6E6A62] mb-1">
          ${(availableBalanceCents / 100).toFixed(2)}
        </div>
        {pendingWithdrawalCents > 0 && (
          <div className="text-xs text-amber-600 mb-3">
            ${(pendingWithdrawalCents / 100).toFixed(2)} pending withdrawal
          </div>
        )}

        <button
          onClick={handleWithdrawClick}
          disabled={availableBalanceCents <= 0}
          className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-[#6E6A62] text-white px-4 py-2.5 text-sm hover:bg-[#5a574f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowDownToLine className="w-4 h-4" /> Withdraw
        </button>

        {/* Recent withdrawals */}
        {recentWithdrawals.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-200/60">
            <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 mb-2">Recent Withdrawals</div>
            <div className="space-y-2">
              {recentWithdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#6E6A62]/60">
                    {new Date(w.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6E6A62]">${(w.amount_cents / 100).toFixed(2)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      w.status === 'PAID' ? 'bg-emerald-50 text-emerald-700'
                        : w.status === 'DENIED' ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
              Before you can withdraw earnings, we need your Social Security Number for tax reporting purposes.
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
                {loading ? 'Submitting...' : 'Submit & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-medium text-[#6E6A62]">Request Withdrawal</h3>

            <div className="bg-[#f5f0eb] rounded-xl p-4">
              <div className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50">Available Balance</div>
              <div className="text-2xl font-light text-[#6E6A62]">${(availableBalanceCents / 100).toFixed(2)}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6E6A62] mb-1">Withdrawal Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6A62]/50">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(availableBalanceCents / 100).toFixed(2)}
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 pl-8 pr-4 py-2.5 text-[#6E6A62] focus:outline-none focus:ring-2 focus:ring-[#6E6A62]/30"
                />
              </div>
              <button
                onClick={() => setWithdrawAmount((availableBalanceCents / 100).toFixed(2))}
                className="mt-1 text-xs text-[#6E6A62]/50 hover:text-[#6E6A62] underline"
              >
                Withdraw full balance
              </button>
            </div>

            <p className="text-xs text-[#6E6A62]/50">
              Withdrawal requests are reviewed and processed manually. You will receive your payout via Square once approved.
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowWithdrawModal(false); setError(null); setSuccess(null); setWithdrawAmount('') }}
                className="flex-1 rounded-full border border-[#6E6A62]/30 px-4 py-2.5 text-sm text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="flex-1 rounded-full bg-[#6E6A62] text-white px-4 py-2.5 text-sm hover:bg-[#5a574f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
