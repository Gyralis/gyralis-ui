import { HTMLAttributes } from "react"
import { useAccount, useBalance } from "wagmi"

import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

interface WalletBalanceProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  decimals?: number
}

export const WalletBalance = ({
  className,
  decimals = TOKEN_AMOUNT_FORMATS.details.maximumFractionDigits,
  ...props
}: WalletBalanceProps) => {
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address,
  })

  if (!address || !balance) return null

  return (
    <span className={className} {...props}>
      {formatTokenAmount(balance.value, {
        decimals: balance.decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}
