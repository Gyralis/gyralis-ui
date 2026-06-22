"use client"

import { FiEye } from "react-icons/fi"

interface LoopsMarkeeProps {
  message?: string
  viewCount?: string
  changePrice?: string
}

export function LoopsMarkee({
  message = "Pay to be seen",
  viewCount = "4,550",
  changePrice = "0.502 ETH to change",
}: LoopsMarkeeProps) {
  return (
    <div className="relative flex h-[90px] w-full max-w-[339px] items-center justify-center rounded-xl border border-primary/35 bg-[#1a1d1c] px-8 pt-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_22px_55px_-34px_rgba(28,231,131,0.65)]">
      <span className="absolute right-3 top-2 inline-flex items-center gap-1.5 font-mono text-[9px] tabular-nums text-primary/[0.45]">
        <FiEye className="size-3" aria-hidden="true" />
        {viewCount}
      </span>

      <p className="font-mono text-base font-semibold tracking-widest text-[#65c69b] drop-shadow-[0_0_12px_rgba(101,198,155,0.18)] sm:text-lg">
        {message}
      </p>

      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-primary/35 bg-[#1a1d1c] px-4 py-1 font-mono text-[10px] text-primary/[0.55] shadow-[0_8px_20px_-14px_rgba(28,231,131,0.8)]">
        {changePrice}
      </span>
    </div>
  )
}
