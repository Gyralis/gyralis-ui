"use client"

import dynamic from "next/dynamic"
import { ReactNode } from "react"
import { ThemeProvider } from "next-themes"
import { Provider as RWBProvider } from "react-wrap-balancer"

import { useIsMounted } from "@/lib/hooks/use-is-mounted"
import HandleWalletEvents from "@/components/blockchain/handle-wallet-events"

const RainbowKit = dynamic(
  () =>
    import("@/components/providers/rainbow-kit").then(
      ({ RainbowKit }) => RainbowKit
    ),
  { ssr: false }
)

interface RootProviderProps {
  children: ReactNode
}

export default function RootProvider({ children }: RootProviderProps) {
  const isMounted = useIsMounted()
  return isMounted ? (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* <RWBProvider> */}
      <RainbowKit>
        {children}
        {/* <HandleWalletEvents></HandleWalletEvents> */}
      </RainbowKit>
      {/* </RWBProvider> */}
    </ThemeProvider>
  ) : null
}
