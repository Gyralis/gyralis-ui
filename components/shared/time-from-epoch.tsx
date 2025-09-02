import { HTMLAttributes, useEffect, useState } from "react"

interface TimeFromEpochProps extends HTMLAttributes<HTMLSpanElement> {
  epoch?: number | string
  locale?: string
}

/**
 * Muestra un timestamp legible a partir de un epoch (segundos).
 * - Usa Intl.DateTimeFormat en vez de luxon.
 * - Locale default: en-US
 */
export const TimeFromEpoch = ({
  className,
  epoch,
  locale = "en-US",
  ...props
}: TimeFromEpochProps) => {
  const [timestamp, setTimestamp] = useState<string>()

  useEffect(() => {
    if (epoch) {
      const date = new Date(Number(epoch) * 1000) // epoch → ms
      const formatter = new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short", // Jan, Feb...
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      setTimestamp(formatter.format(date))
    }
  }, [epoch, locale])

  return (
    <span className={className} {...props}>
      {timestamp}
    </span>
  )
}

export default TimeFromEpoch
