"use client"

import { useTheme } from "next-themes"
import { Toaster as SileoToaster } from "sileo"

export function Toaster() {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === "dark" ? "dark" : "light"

  return (
    <SileoToaster
      position="bottom-right"
      theme={theme}
      options={{
        fill: theme === "dark" ? "#171717" : "#FFFFFF",
        duration: 5000,
        roundness: 16,
        styles: {
          title: "!text-foreground",
          description: "!text-foreground",
          badge: theme === "dark" ? "!bg-white/10" : undefined,
          button:
            theme === "dark" ? "!bg-white/10 hover:!bg-white/15" : undefined,
        },
      }}
    />
  )
}
