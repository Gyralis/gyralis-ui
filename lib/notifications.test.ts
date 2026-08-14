import { sileo } from "sileo"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearNotifications,
  dismissNotification,
  notify,
} from "./notifications"

vi.mock("sileo", () => ({
  sileo: {
    clear: vi.fn(),
    dismiss: vi.fn(),
    show: vi.fn(() => "notification-id"),
  },
}))

describe("notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("uses explicit notification types and success duration", () => {
    notify({
      title: "Entered the Loop",
      description: "Your rewards start next period.",
      type: "success",
    })

    expect(sileo.show).toHaveBeenCalledWith({
      title: "Entered the Loop",
      description: "Your rewards start next period.",
      type: "success",
      duration: 4_000,
      styles: undefined,
      button: undefined,
    })
  })

  it("uses a native action button and extended action duration", () => {
    notify({
      title: "Rewards claimed",
      description: "Your claim was confirmed.",
      type: "success",
      link: {
        href: "https://gnosis.blockscout.com/tx/0x123",
        label: "View on Blockscout",
      },
    })

    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        duration: 8_000,
        styles: { button: "sileo-external-link-button" },
        button: expect.objectContaining({ title: "View on Blockscout" }),
      })
    )
  })

  it("uses the longer error duration", () => {
    notify({
      title: "Claim failed",
      description: "No rewards were claimed. Try again.",
      type: "error",
    })

    expect(sileo.show).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 7_000, type: "error" })
    )
  })

  it("delegates dismiss and clear operations", () => {
    dismissNotification("notification-id")
    clearNotifications()

    expect(sileo.dismiss).toHaveBeenCalledWith("notification-id")
    expect(sileo.clear).toHaveBeenCalledOnce()
  })
})
