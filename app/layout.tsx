import "@/styles/app.css"
import "@/styles/globals.css"

import { ReactNode } from "react"
import { env } from "@/env.mjs"

import { siteConfig } from "@/config/site"
import { fontBaloo, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import RootProvider from "@/components/providers/root-provider"

const url = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(url),
  title: `${siteConfig.name} - ${siteConfig.description}`,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#feefc4",
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: url?.toString(),
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-gradient-to-br from-[hsl(150,81%,51%,0.06)] via-[hsl(5,100%,69%,0.07)] to-[hsl(150,81%,51%,0.10)] font-sans antialiased",
            fontSans.variable,
            fontBaloo.variable
          )}
        >
          <RootProvider>{children}</RootProvider>
          <Toaster />
        </body>
      </html>
    </>
  )
}
