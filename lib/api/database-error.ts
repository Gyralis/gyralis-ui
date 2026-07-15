import { NextResponse } from "next/server"

function errorText(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  return String(error)
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  const message = errorText(error)
  return (
    message.includes("Server selection timeout") ||
    message.includes("ReplicaSetNoPrimary") ||
    message.includes("No available servers") ||
    message.includes("received fatal alert")
  )
}

export function databaseUnavailableResponse(
  error: unknown,
  context: string
): NextResponse | undefined {
  if (!isDatabaseUnavailableError(error)) return undefined

  console.error(`[${context}] database unavailable`, error)
  return NextResponse.json(
    {
      success: false,
      error: "Database unavailable",
    },
    { status: 503 }
  )
}
