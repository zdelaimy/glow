'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SignOutButton } from '@/components/sign-out-button'
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  Megaphone,
  Users,
  DollarSign,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { href: '/glow-girl/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/glow-girl/checklist', label: '10-Week Checklist', icon: <ClipboardCheck className="w-4 h-4" /> },
  { href: '/glow-girl/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { href: '/glow-girl/ai-studio', label: 'Marketing', icon: <Megaphone className="w-4 h-4" /> },
  { href: '/glow-girl/compensation', label: 'Compensation', icon: <DollarSign className="w-4 h-4" /> },
  { href: '/glow-girl/team', label: 'My Team', icon: <Users className="w-4 h-4" /> },
]

interface GlowGirlSidebarProps {
  brandName: string
}

export function GlowGirlSidebar({ brandName }: GlowGirlSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/glow-girl/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo & Brand */}
      <div className="px-5 py-6 border-b border-[#6E6A62]/10">
        <Link href="/" className="text-2xl tracking-tight text-[#6E6A62] font-serif">
          Glow
        </Link>
        <p className="text-sm text-[#6E6A62]/60 mt-1 truncate">{brandName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-[#6E6A62] text-white'
                  : 'text-[#6E6A62]/70 hover:bg-[#f5f0eb] hover:text-[#6E6A62]'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-4 pb-6 border-t border-[#6E6A62]/10 pt-4">
        <SignOutButton />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-[#6E6A62]/10 z-30">
        {sidebar}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-[#6E6A62]/10 z-40 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl tracking-tight text-[#6E6A62] font-serif">
          Glow
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[#6E6A62] hover:bg-[#f5f0eb]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-xl">
            {sidebar}
          </aside>
        </>
      )}
    </>
  )
}
