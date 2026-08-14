"use client"

import {
  clearNotifications,
  dismissNotification,
  notify,
  type NotificationLink,
  type NotificationOptions,
} from "@/lib/notifications"

export type ToastLink = NotificationLink
export type ToastOptions = NotificationOptions

export function useToast() {
  return {
    toast: notify,
    dismiss: dismissNotification,
    clear: clearNotifications,
  }
}

export { notify as toast }
