import { HtmlHTMLAttributes } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export const WalletConnect = ({
  className,
  ...props
}: HtmlHTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={className} {...props}>
      <ConnectButton
        showBalance={false}
        accountStatus={{
          smallScreen: "address",
          largeScreen: "address",
        }}
        chainStatus={{
          smallScreen: "none",
          largeScreen: "none",
        }}
      />
    </span>
  )
}
