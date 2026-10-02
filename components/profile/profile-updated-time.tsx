"use client"

import { useEffect, useState } from "react"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function ProfileUpdatedTime({
  updatedAt,
}: {
  updatedAt: string | null
}) {
  const [now, setNow] = useState<number | null>(null)
  const timestamp = updatedAt ? Date.parse(updatedAt) : NaN

  useEffect(() => {
    if (!Number.isFinite(timestamp)) return
    let timer: ReturnType<typeof setTimeout> | undefined

    function refresh() {
      clearTimeout(timer)
      const currentTime = Date.now()
      setNow(currentTime)
      const elapsed = Math.max(0, currentTime - timestamp)
      // Wake at the next displayed unit boundary, not on every second.
      if (elapsed < DAY) {
        const unit = elapsed < HOUR ? MINUTE : HOUR
        timer = setTimeout(refresh, unit - (elapsed % unit))
      }
    }

    function onVisible() {
      if (document.visibilityState === "visible") refresh()
    }

    refresh()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [timestamp])

  if (!Number.isFinite(timestamp)) return <>—</>

  const date = new Date(timestamp)
  // Start with the same date on server and client to avoid hydration mismatch.
  let label = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date)

  if (now !== null) {
    const elapsed = Math.max(0, now - timestamp)
    if (elapsed < MINUTE) {
      label = "a few seconds ago"
    } else if (elapsed < HOUR) {
      const minutes = Math.floor(elapsed / MINUTE)
      label = `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (elapsed < DAY) {
      const hours = Math.floor(elapsed / HOUR)
      label = `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    }
  }

  return (
    <time dateTime={date.toISOString()} title={date.toUTCString()}>
      {label}
    </time>
  )
}
