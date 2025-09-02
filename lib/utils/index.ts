import { env } from "@/env.mjs"

/* ──────────────── cn (clsx + twMerge simplificado) ──────────────── */
/**
 * Combina clases condicionales en un solo string.
 * - Acepta strings, arrays y objetos { className: boolean }
 * - Elimina falsy values
 * - Última ocurrencia de una clase sobreescribe anteriores
 */
export function cn(...inputs: any[]): string {
  const classes: string[] = []

  for (const input of inputs) {
    if (!input) continue
    if (typeof input === "string") {
      classes.push(input)
    } else if (Array.isArray(input)) {
      classes.push(cn(...input))
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) classes.push(key)
      }
    }
  }

  // si hay clases duplicadas (ej: "p-2 p-4"), se queda con la última
  const seen: Record<string, string> = {}
  for (const c of classes) {
    const [prefix] = c.split("-") // heurística simple
    seen[prefix] = c
  }

  return Object.values(seen).join(" ")
}

/* ──────────────── formatDate ──────────────── */
export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/* ──────────────── absoluteUrl ──────────────── */
export function absoluteUrl(path: string) {
  return `${env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${path}`
}

/* ──────────────── trimFormattedBalance ──────────────── */
export function trimFormattedBalance(
  balance: string | undefined,
  decimals = 4
): string {
  if (!balance) return "0"
  const [integer, decimal] = balance.split(".")
  if (!decimal) return integer
  return `${integer}.${decimal.slice(0, decimals)}`
}

/* ──────────────── truncateEthAddress ──────────────── */
export function truncateEthAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
