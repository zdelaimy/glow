'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createPod, joinPod, leavePod, disbandPod } from '@/lib/actions/pods'

interface PodMember {
  id: string
  role: string
  joined_at: string
  glow_girl: { id: string; brand_name: string; slug: string } | { id: string; brand_name: string; slug: string }[]
}

interface PodData {
  membership: { id: string; role: string; joined_at: string }
  pod: {
    id: string
    name: string
    pod_code: string
    leader_id: string
    created_at: string
    leader: { brand_name: string; slug: string }
  }
  members: PodMember[]
  isLeader: boolean
}

interface PodStats {
  memberCount: number
  totalSalesCents: number
  overrideCents: number
}

interface Props {
  podData: PodData | null
  podStats: PodStats | null
}

export function PodDashboard({ podData: initialData, podStats }: Props) {
  const [podData, setPodData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [podName, setPodName] = useState('')
  const [podCode, setPodCode] = useState('')

  async function handleCreate() {
    if (!podName.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createPod(podName.trim())
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pod')
    }
    setLoading(false)
  }

  async function handleJoin() {
    if (!podCode.trim()) return
    setLoading(true)
    setError(null)
    try {
      await joinPod(podCode.trim())
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join pod')
    }
    setLoading(false)
  }

  async function handleLeave() {
    if (!confirm('Are you sure you want to leave this pod?')) return
    setLoading(true)
    setError(null)
    try {
      await leavePod()
      setPodData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave pod')
    }
    setLoading(false)
  }

  async function handleDisband() {
    if (!podData) return
    if (!confirm('Are you sure you want to disband this pod? All members will be removed.')) return
    setLoading(true)
    setError(null)
    try {
      await disbandPod(podData.pod.id)
      setPodData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disband pod')
    }
    setLoading(false)
  }

  if (error) {
    // Show error inline
  }

  // No pod state
  if (!podData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Join or Create a Pod</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pods are small teams of Glow Girls. Pod leaders earn a 5% override on their members&apos; sales.
          </p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create a Pod</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pod Name</Label>
                <Input
                  value={podName}
                  onChange={(e) => setPodName(e.target.value)}
                  placeholder="My Glow Squad"
                />
              </div>
              <Button onClick={handleCreate} disabled={loading || !podName.trim()} className="w-full">
                {loading ? 'Creating...' : 'Create Pod'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join a Pod</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pod Code</Label>
                <Input
                  value={podCode}
                  onChange={(e) => setPodCode(e.target.value)}
                  placeholder="ABC12345"
                  className="uppercase"
                />
              </div>
              <Button onClick={handleJoin} disabled={loading || !podCode.trim()} variant="outline" className="w-full">
                {loading ? 'Joining...' : 'Join Pod'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Active pod view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{podData.pod.name}</h3>
          <p className="text-sm text-muted-foreground">
            {podData.isLeader ? 'You are the pod leader' : `Led by ${podData.pod.leader.brand_name}`}
          </p>
        </div>
        {podData.isLeader && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Share this code</p>
            <Badge variant="outline" className="text-lg font-mono px-4 py-1.5">
              {podData.pod.pod_code}
            </Badge>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Stats */}
      {podStats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-semibold">{podStats.memberCount}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-semibold">${(podStats.totalSalesCents / 100).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Pod Sales (this month)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-semibold">${(podStats.overrideCents / 100).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Override Earned</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {podData.members.map((m) => {
              const gg = Array.isArray(m.glow_girl) ? m.glow_girl[0] : m.glow_girl
              return (
              <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">
                    {gg?.brand_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{gg?.brand_name}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Badge variant={m.role === 'LEADER' ? 'default' : 'secondary'} className="text-xs">
                  {m.role}
                </Badge>
              </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {podData.isLeader ? (
          <Button variant="destructive" size="sm" onClick={handleDisband} disabled={loading}>
            {loading ? 'Disbanding...' : 'Disband Pod'}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handleLeave} disabled={loading}>
            {loading ? 'Leaving...' : 'Leave Pod'}
          </Button>
        )}
      </div>
    </div>
  )
}
