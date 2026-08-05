import { describe, expect, it } from "vitest"

import {
  deriveSuperLoopClaimStatus,
  deriveSuperLoopIsClaimable,
  getPreviousSuperLoopPeriod,
  getSuperLoopActionLabel,
  getSuperLoopTimerTitle,
  normalizeSuperLoopStatusReads,
  reconcileSuperLoopConfirmedStatus,
  SuperLoopPhase,
} from "./super-loop-status"

describe("SuperLoop status reads", () => {
  it("normalizes all five contract reads into named values", () => {
    expect(
      normalizeSuperLoopStatusReads({
        claimerStatus: [true, false],
        currentPeriod: 12n,
        owedAmounts: [3n, 5n, 8n],
        previousPeriodPayout: 4n,
        userPhase: 2,
      })
    ).toEqual({
      claimerStatus: { hasClaimed: false, isRegistered: true },
      currentPeriod: 12n,
      isClaimable: false,
      owed: { currentAmount: 5n, pendingAmount: 3n, total: 8n },
      previousPeriod: 11n,
      previousPeriodPayout: 4n,
      userPhase: 2,
    })
  })

  it("does not request a previous-period value during period zero", () => {
    expect(getPreviousSuperLoopPeriod(0n)).toBeUndefined()
    expect(
      normalizeSuperLoopStatusReads({
        currentPeriod: 0n,
        previousPeriodPayout: 4n,
      }).previousPeriodPayout
    ).toBeUndefined()
  })

  it("supports partial data while independent reads are loading", () => {
    expect(normalizeSuperLoopStatusReads({ currentPeriod: 7n })).toMatchObject({
      currentPeriod: 7n,
      isClaimable: undefined,
      previousPeriod: 6n,
    })
  })

  it("marks the observed onchain state as claimable", () => {
    const observedReads = {
      claimerStatus: [true, false] as const,
      owedAmounts: [
        0n,
        11_415_525_114_155_100n,
        11_415_525_114_155_100n,
      ] as const,
      userPhase: SuperLoopPhase.Claimable,
    }

    expect(deriveSuperLoopIsClaimable(observedReads)).toBe(true)
    expect(normalizeSuperLoopStatusReads(observedReads).isClaimable).toBe(true)
  })

  it.each([
    {
      claimerStatus: [false, false] as const,
      owedAmounts: [0n, 1n, 1n] as const,
      userPhase: SuperLoopPhase.Claimable,
    },
    {
      claimerStatus: [true, true] as const,
      owedAmounts: [0n, 1n, 1n] as const,
      userPhase: SuperLoopPhase.Claimable,
    },
    {
      claimerStatus: [true, false] as const,
      owedAmounts: [0n, 0n, 0n] as const,
      userPhase: SuperLoopPhase.Claimable,
    },
    {
      claimerStatus: [true, false] as const,
      owedAmounts: [0n, 1n, 1n] as const,
      userPhase: SuperLoopPhase.Accumulating,
    },
  ])("does not mark a non-claimable combination as claimable", (input) => {
    expect(deriveSuperLoopIsClaimable(input)).toBe(false)
  })

  it("keeps claimability unresolved while required reads are loading", () => {
    expect(
      deriveSuperLoopIsClaimable({
        claimerStatus: [true, false],
        owedAmounts: undefined,
        userPhase: SuperLoopPhase.Claimable,
      })
    ).toBeUndefined()
  })
})

describe("SuperLoop claim state", () => {
  it.each([
    {
      expected: "claimable",
      input: {
        accountConnected: true,
        claimerStatus: { hasClaimed: false, isRegistered: true },
        hasError: false,
        isClaimable: true,
        isLoading: false,
        userPhase: SuperLoopPhase.Claimable,
      },
    },
    {
      expected: "claimed",
      input: {
        accountConnected: true,
        claimerStatus: { hasClaimed: true, isRegistered: true },
        hasError: false,
        isClaimable: false,
        isLoading: false,
        userPhase: SuperLoopPhase.Claimed,
      },
    },
    {
      expected: "active",
      input: {
        accountConnected: true,
        claimerStatus: { hasClaimed: false, isRegistered: true },
        hasError: false,
        isClaimable: false,
        isLoading: false,
        userPhase: SuperLoopPhase.Accumulating,
      },
    },
    {
      expected: "entered",
      input: {
        accountConnected: true,
        claimerStatus: { hasClaimed: false, isRegistered: true },
        hasError: false,
        isClaimable: false,
        isLoading: false,
        userPhase: SuperLoopPhase.Cooldown,
      },
    },
    {
      expected: "enter",
      input: {
        accountConnected: true,
        claimerStatus: { hasClaimed: false, isRegistered: false },
        hasError: false,
        isClaimable: false,
        isLoading: false,
        userPhase: SuperLoopPhase.NotRegistered,
      },
    },
    {
      expected: "checking",
      input: {
        accountConnected: true,
        claimerStatus: undefined,
        hasError: false,
        isClaimable: undefined,
        isLoading: true,
        userPhase: undefined,
      },
    },
    {
      expected: "error",
      input: {
        accountConnected: true,
        claimerStatus: undefined,
        hasError: true,
        isClaimable: undefined,
        isLoading: false,
        userPhase: undefined,
      },
    },
  ] as const)("derives $expected", ({ expected, input }) => {
    expect(deriveSuperLoopClaimStatus(input)).toBe(expected)
  })

  it.each([
    SuperLoopPhase.Cooldown,
    SuperLoopPhase.Accumulating,
    SuperLoopPhase.Claimable,
    SuperLoopPhase.Claimed,
  ])(
    "resolves an unregistered user to enter regardless of phase %s",
    (phase) => {
      expect(
        deriveSuperLoopClaimStatus({
          accountConnected: true,
          claimerStatus: { hasClaimed: true, isRegistered: false },
          hasError: false,
          isClaimable: true,
          isLoading: false,
          userPhase: phase,
        })
      ).toBe("enter")
    }
  )

  it("builds the claim label and timer from the derived state", () => {
    expect(
      getSuperLoopActionLabel({
        amountLabel: "0.0114 MARK",
        isConfirming: false,
        isSubmitting: false,
        pendingAction: "claim",
        status: "claimable",
      })
    ).toBe("Claim 0.0114 MARK")
    expect(getSuperLoopTimerTitle("claimable")).toBe("Claim period ends in")
    expect(getSuperLoopTimerTitle("claimed")).toBe("Accumulation starts in")
    expect(
      getSuperLoopActionLabel({
        isConfirming: false,
        isSubmitting: false,
        pendingAction: "enter",
        status: "entered",
      })
    ).toBe("You are in the Loop")
  })

  it("shows a confirmed claim while refreshed contract reads catch up", () => {
    expect(
      reconcileSuperLoopConfirmedStatus({
        confirmedAction: { action: "claim", period: 12n },
        currentPeriod: 12n,
        status: "claimable",
      })
    ).toBe("claimed")
  })

  it("expires the local confirmation when the period advances", () => {
    expect(
      reconcileSuperLoopConfirmedStatus({
        confirmedAction: { action: "claim", period: 12n },
        currentPeriod: 13n,
        status: "entered",
      })
    ).toBe("entered")
  })

  it("shows a confirmed entry while refreshed contract reads catch up", () => {
    expect(
      reconcileSuperLoopConfirmedStatus({
        confirmedAction: { action: "enter", period: 12n },
        currentPeriod: 12n,
        status: "enter",
      })
    ).toBe("entered")
  })
})
