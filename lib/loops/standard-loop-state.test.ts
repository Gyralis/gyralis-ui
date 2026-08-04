import { describe, expect, it } from "vitest"

import {
  calculateStandardLoopParticipation,
  deriveStandardLoopClaimStatus,
  getStandardLoopActionLabel,
  getStandardLoopTimerTitle,
} from "./standard-loop-state"

describe("standard Loop claim state", () => {
  it.each([
    {
      expected: "error",
      input: {
        hasClaimed: false,
        hasError: true,
        isClaimable: false,
        isEntered: false,
        isLoading: false,
      },
    },
    {
      expected: "claimed",
      input: {
        hasClaimed: true,
        hasError: false,
        isClaimable: false,
        isEntered: false,
        isLoading: true,
      },
    },
    {
      expected: "claimable",
      input: {
        hasClaimed: false,
        hasError: false,
        isClaimable: true,
        isEntered: true,
        isLoading: false,
      },
    },
    {
      expected: "entered",
      input: {
        hasClaimed: false,
        hasError: false,
        isClaimable: false,
        isEntered: true,
        isLoading: false,
      },
    },
    {
      expected: "checking",
      input: {
        hasClaimed: false,
        hasError: false,
        isClaimable: false,
        isEntered: false,
        isLoading: true,
      },
    },
    {
      expected: "enter",
      input: {
        hasClaimed: false,
        hasError: false,
        isClaimable: false,
        isEntered: false,
        isLoading: false,
      },
    },
  ] as const)("returns $expected", ({ expected, input }) => {
    expect(deriveStandardLoopClaimStatus(input)).toBe(expected)
  })

  it("builds claim labels with token amounts", () => {
    expect(
      getStandardLoopActionLabel({
        amountLabel: "12.5 HNY",
        isConfirming: false,
        isSubmitting: false,
        pendingAction: "claim",
        status: "claimable",
      })
    ).toBe("Claim 12.5 HNY")
  })

  it("builds timer titles from claim state", () => {
    expect(getStandardLoopTimerTitle("entered")).toBe("Claim opens in")
    expect(getStandardLoopTimerTitle("claimable")).toBe("Claim period ends in")
    expect(getStandardLoopTimerTitle("claimed")).toBe("Next claim opens in")
    expect(getStandardLoopTimerTitle("enter")).toBe("Entry closes in")
  })
})

describe("standard Loop participation", () => {
  it("deduplicates addresses and matches them case-insensitively", () => {
    expect(
      calculateStandardLoopParticipation({
        registeredUsers: ["0xAbC", "0xabc", "0xDEF"],
        claimedUsers: ["0xABC"],
      })
    ).toEqual({ claimedCount: 1, claimRate: 50, registeredCount: 2 })
  })

  it("does not count claims from wallets that did not register", () => {
    expect(
      calculateStandardLoopParticipation({
        registeredUsers: ["0xabc"],
        claimedUsers: ["0xdef"],
      })
    ).toEqual({ claimedCount: 0, claimRate: 0, registeredCount: 1 })
  })

  it("returns zeroes when there are no registrations", () => {
    expect(
      calculateStandardLoopParticipation({
        registeredUsers: [],
        claimedUsers: ["0xabc"],
      })
    ).toEqual({ claimedCount: 0, claimRate: 0, registeredCount: 0 })
  })
})
