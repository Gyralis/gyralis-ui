"use client"

import { ReactNode } from "react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "next-themes"
import { Provider as RWBProvider } from "react-wrap-balancer"

import { useIsMounted } from "@/lib/hooks/use-is-mounted"
import HandleWalletEvents from "@/components/blockchain/handle-wallet-events"
import { RainbowKit as ServerRainbowKit } from "@/components/providers/rainbow-kit"

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
  const pathname = usePathname()
  // The public leaderboard has server-fetched initial data. Keep legacy routes
  // behind their existing mount gate while allowing this route to render HTML.
  const serverRendered = pathname === "/leaderboard"
  const WalletProvider = serverRendered ? ServerRainbowKit : RainbowKit
  return isMounted || serverRendered ? (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* <RWBProvider> */}
      <WalletProvider>
        {children}
        {/* <HandleWalletEvents></HandleWalletEvents> */}
      </WalletProvider>
      {/* </RWBProvider> */}
    </ThemeProvider>
  ) : null
}
