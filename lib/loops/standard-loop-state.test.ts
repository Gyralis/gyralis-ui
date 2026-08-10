import { describe, expect, it } from "vitest"

import {
  calculateStandardLoopParticipation,
  deriveStandardLoopClaimStatus,
  getStandardLoopActionLabel,
  getStandardLoopActionPresentation,
  getStandardLoopActionTooltip,
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
        pendingAction: "claim",
        status: "claimable",
        submissionStage: "idle",
      })
    ).toBe("Claim 12.5 HNY")
  })

  it.each([
    ["checkingEligibility", "Checking eligibility..."],
    ["awaitingWallet", "Confirm in wallet..."],
  ] as const)("labels the %s stage", (submissionStage, expected) => {
    expect(
      getStandardLoopActionLabel({
        isConfirming: false,
        pendingAction: "enter",
        status: "enter",
        submissionStage,
      })
    ).toBe(expected)
  })

  it("uses informational surfaces for entered and claimed states", () => {
    expect(
      getStandardLoopActionPresentation({
        isPending: false,
        status: "entered",
        wrongNetwork: false,
      })
    ).toBe("neutral")
    expect(
      getStandardLoopActionPresentation({
        isPending: false,
        status: "claimed",
        wrongNetwork: false,
      })
    ).toBe("success")
    expect(
      getStandardLoopActionPresentation({
        isPending: false,
        status: "claimable",
        wrongNetwork: false,
      })
    ).toBe("button")
  })

  it("provides state-specific action tooltips", () => {
    expect(getStandardLoopActionTooltip("entered")).toEqual({
      title: "You’re registered for the next claim period.",
      description: "Your rewards will be available when it opens.",
    })
    expect(getStandardLoopActionTooltip("claimable")).toBeUndefined()
    expect(getStandardLoopActionTooltip("claimed")).toEqual({
      title: "Your rewards were claimed successfully.",
      description: "You’re registered for the next claim period.",
    })
    expect(getStandardLoopActionTooltip("error")).toEqual({
      title: "We couldn’t load your Loop status.",
      description: "Try checking again.",
    })
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
