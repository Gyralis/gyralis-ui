"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Footer } from "@/components/layout/footer"
import { SiteHeader } from "@/components/layout/site-header"

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        {!isLandingPage ? <Footer /> : null}
      </div>
      {/* <NetworkStatus /> */}
      <div className="fixed bottom-6 right-6">{/* <WalletConnect /> */}</div>
    </>
  )
}
