'use client'

import { signOut } from '@/lib/actions/auth'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="rounded-full border border-[#6E6A62]/30 px-4 py-1.5 text-xs font-medium text-[#6E6A62] hover:bg-[#f5f0eb] transition-colors"
    >
      Sign out
    </button>
  )
}
