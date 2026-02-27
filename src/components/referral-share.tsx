'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'

export function ReferralShare({ referralCode }: { referralCode: string | null }) {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null)

  if (!referralCode) return null

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/creators?ref=${referralCode}`

  function copyToClipboard(text: string, type: 'link' | 'code') {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Your Referral Link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Share this link</label>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralLink, 'link')}
            >
              {copied === 'link' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Your code</label>
          <div className="flex gap-2">
            <Input value={referralCode} readOnly className="font-mono text-sm tracking-widest" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode, 'code')}
            >
              {copied === 'code' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
