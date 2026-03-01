'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingHeader } from '@/components/landing-header'
import { Footer } from '@/components/footer'

const REASONS = [
  { value: 'DAMAGED', label: 'Item arrived damaged' },
  { value: 'WRONG_ITEM', label: 'Wrong item received' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not as described' },
  { value: 'CHANGED_MIND', label: 'Changed my mind' },
  { value: 'OTHER', label: 'Other' },
]

export default function ReturnsPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [reasonDetail, setReasonDetail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId || !email || !reason) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email, reason, reasonDetail: reasonDetail || undefined }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Something went wrong')
        setStatus('error')
        return
      }

      setStatus('success')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader variant="light" />

      <section className="pt-32 pb-24">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-light tracking-tight mb-2">Request a Return</h1>
            <p className="text-muted-foreground">
              We offer a 30-day satisfaction guarantee on all Glow products.
            </p>
          </div>

          {status === 'success' ? (
            <Card>
              <CardContent className="pt-8 pb-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold">Return Request Submitted</h2>
                <p className="text-muted-foreground">
                  We&apos;ll review your request and get back to you within 2 business days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Return Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Enter your order ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email used for the order"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason for Return</Label>
                    <Select value={reason} onValueChange={setReason} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {REASONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail">Additional Details (optional)</Label>
                    <Textarea
                      id="detail"
                      value={reasonDetail}
                      onChange={(e) => setReasonDetail(e.target.value)}
                      placeholder="Tell us more about the issue..."
                      rows={3}
                    />
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={status === 'submitting' || !orderId || !email || !reason}
                  >
                    {status === 'submitting' ? 'Submitting...' : 'Submit Return Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
