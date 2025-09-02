import { useState, useEffect, useCallback } from "react"

export type ColorMode = "light" | "dark" | "system"

export const useColorMode = () => {
  const [mode, setMode] = useState<ColorMode>("system")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as ColorMode | null
      if (saved) setMode(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", mode)

      const root = document.documentElement
      if (mode === "dark") {
        root.classList.add("dark")
      } else if (mode === "light") {
        root.classList.remove("dark")
      } else {
        // system → sigue lo que dice prefers-color-scheme
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark")
        } else {
          root.classList.remove("dark")
        }
      }
    }
  }, [mode])

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  return [mode, toggleMode, setMode] as const
}
