'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
          <h3 className="text-xl font-light text-[#6E6A62]">Join or Create a Pod</h3>
          <p className="text-[#6E6A62]/50 max-w-md mx-auto mt-2">
            Pods are small teams of Glow Girls. Pod leaders earn a 5% override on their members&apos; sales.
          </p>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h4 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Create a Pod</h4>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Pod Name</Label>
                <Input
                  value={podName}
                  onChange={(e) => setPodName(e.target.value)}
                  placeholder="My Glow Squad"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={loading || !podName.trim()}
                className="w-full rounded-full bg-[#6E6A62] text-white py-2.5 text-sm font-medium hover:bg-[#5a5650] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Pod'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/60">
            <div className="px-6 py-4 border-b border-neutral-200/60">
              <h4 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Join a Pod</h4>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Pod Code</Label>
                <Input
                  value={podCode}
                  onChange={(e) => setPodCode(e.target.value)}
                  placeholder="ABC12345"
                  className="uppercase"
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={loading || !podCode.trim()}
                className="w-full rounded-full border border-[#6E6A62]/30 text-[#6E6A62] py-2.5 text-sm font-medium hover:bg-[#f5f0eb] transition-colors disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Pod'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Active pod view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-light text-[#6E6A62]">{podData.pod.name}</h3>
          <p className="text-sm text-[#6E6A62]/50">
            {podData.isLeader ? 'You are the pod leader' : `Led by ${podData.pod.leader.brand_name}`}
          </p>
        </div>
        {podData.isLeader && (
          <div className="text-right">
            <p className="text-xs text-[#6E6A62]/50 mb-1">Share this code</p>
            <span className="font-mono text-lg px-4 py-1.5 bg-[#f5f0eb] border border-[#6E6A62]/10 rounded-full text-[#6E6A62]">
              {podData.pod.pod_code}
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Stats */}
      {podStats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Members', value: podStats.memberCount },
            { label: 'Pod Sales (this month)', value: `$${(podStats.totalSalesCents / 100).toFixed(0)}` },
            { label: 'Override Earned', value: `$${(podStats.overrideCents / 100).toFixed(2)}` },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-neutral-200/60 p-4 text-center">
              <p className="text-2xl font-light text-[#6E6A62]">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-2xl border border-neutral-200/60">
        <div className="px-6 py-4 border-b border-neutral-200/60">
          <h4 className="text-xs uppercase tracking-[0.15em] text-[#6E6A62]/70 font-medium">Members</h4>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {podData.members.map((m) => {
              const gg = Array.isArray(m.glow_girl) ? m.glow_girl[0] : m.glow_girl
              return (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-neutral-200/60 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f5f0eb] flex items-center justify-center text-xs font-bold text-[#6E6A62]">
                    {gg?.brand_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6E6A62]">{gg?.brand_name}</p>
                    <p className="text-xs text-[#6E6A62]/50">Joined {new Date(m.joined_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${
                  m.role === 'LEADER'
                    ? 'bg-[#6E6A62] text-white'
                    : 'bg-[#f5f0eb] text-[#6E6A62]'
                }`}>
                  {m.role}
                </span>
              </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {podData.isLeader ? (
          <button
            onClick={handleDisband}
            disabled={loading}
            className="rounded-full border border-rose-300 text-rose-500 px-4 py-2 text-sm font-medium hover:bg-rose-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Disbanding...' : 'Disband Pod'}
          </button>
        ) : (
          <button
            onClick={handleLeave}
            disabled={loading}
            className="rounded-full border border-[#6E6A62]/30 text-[#6E6A62] px-4 py-2 text-sm font-medium hover:bg-[#f5f0eb] transition-colors disabled:opacity-50"
          >
            {loading ? 'Leaving...' : 'Leave Pod'}
          </button>
        )}
      </div>
    </div>
  )
}
