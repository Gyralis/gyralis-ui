"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { type ReactNode } from "react"
import { env } from "@/env.mjs"
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { WagmiProvider } from "wagmi"

import { chains, transports } from "@/config/networks"
import { siteConfig } from "@/config/site"

const wagmiConfig = getDefaultConfig({
  appName: siteConfig.title,
  projectId: env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains,
  transports,
  ssr: true,
})

const queryClient = new QueryClient()

export function RainbowKit({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme()
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            initialChain={1}
            theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  )
}
