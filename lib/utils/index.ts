import { env } from "@/env.mjs"

import { formatTokenAmount, TOKEN_AMOUNT_FORMATS } from "./token-amount"

export { formatTokenAmount, TOKEN_AMOUNT_FORMATS } from "./token-amount"

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
/** @deprecated Use formatTokenAmount from lib/utils/token-amount for new views. */
export function trimFormattedBalance(
  balance: string | undefined,
  decimals = TOKEN_AMOUNT_FORMATS.details.maximumFractionDigits
): string {
  // Compatibility adapter for older views; new token displays use the formatter.
  return formatTokenAmount(balance, {
    maximumFractionDigits: decimals,
    trimTrailingZeros: false,
    showSmallValues: false,
    missingValue: "0",
  })
}

/* ──────────────── truncateEthAddress ──────────────── */
export function truncateEthAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
