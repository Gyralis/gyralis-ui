"use client"

import type { ReactNode } from "react"
import { sileo } from "sileo"

export type NotificationType = "error" | "info" | "success" | "warning"

export interface NotificationLink {
  href: string
  label: string
}

export interface NotificationOptions {
  title: string
  description?: ReactNode
  type: NotificationType
  duration?: number
  link?: NotificationLink
}

function getDuration(options: NotificationOptions) {
  if (options.duration != null) return options.duration
  if (options.link) return 8_000
  if (options.type === "error") return 7_000
  if (options.type === "success") return 4_000
  return 5_000
}

export function notify(options: NotificationOptions) {
  const isExternalLink = options.link?.href.startsWith("http") === true

  return sileo.show({
    title: options.title,
    description: options.description,
    type: options.type,
    duration: getDuration(options),
    styles: isExternalLink
      ? { button: "sileo-external-link-button" }
      : undefined,
    button: options.link
      ? {
          title: options.link.label,
          onClick: () => {
            if (isExternalLink && options.link) {
              window.open(options.link.href, "_blank", "noopener,noreferrer")
              return
            }

            if (options.link) window.location.assign(options.link.href)
          },
        }
      : undefined,
  })
}

export function dismissNotification(id: string) {
  sileo.dismiss(id)
}

export function clearNotifications() {
  sileo.clear()
}
