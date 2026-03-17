'use client'

import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/cart-context'
import { cn } from '@/lib/utils'

export function CartButton({ solid }: { solid: boolean }) {
  const { openCart, totalItems } = useCart()

  return (
    <button
      onClick={openCart}
      className={cn(
        'relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300',
        solid
          ? 'text-[#6E6A62] hover:bg-[#6E6A62]/10'
          : 'text-white/90 hover:bg-white/10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]'
      )}
    >
      <ShoppingBag className="w-[18px] h-[18px]" />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key={totalItems}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-[#6E6A62] text-white text-[10px] font-inter font-bold rounded-full flex items-center justify-center leading-none"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
