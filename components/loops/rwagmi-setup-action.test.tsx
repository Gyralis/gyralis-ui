import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { RwagmiTokenState } from "@/lib/loops/rwagmi-token-store"

import { RwagmiSetupAction } from "./rwagmi-setup-action"

const wallet = "0x1111111111111111111111111111111111111111"
const token = "0x2222222222222222222222222222222222222222"
const state: RwagmiTokenState = { hydrated: true, checking: false, retryAt: 0 }
const props = {
  wallet,
  state,
  retrySeconds: 0,
  onSetup: vi.fn(),
  onRetry: vi.fn(),
}
const readyAction = <button>Claim 1.000 RWAGMI</button>

function render(
  overrides: Partial<React.ComponentProps<typeof RwagmiSetupAction>> = {}
) {
  return renderToStaticMarkup(
    <RwagmiSetupAction {...props} {...overrides}>
      {readyAction}
    </RwagmiSetupAction>
  )
}

beforeEach(() => vi.stubGlobal("React", React))
afterEach(() => vi.unstubAllGlobals())

describe("RWAGMI card setup action", () => {
  it("uses one full-width setup action before a token is added", () => {
    const html = render()
    expect(html).toContain("One-time setup")
    expect(html).toContain("Set up RWAGMI")
    expect(html).toContain('class="p-button"')
    expect(html).toContain("Remembered for this wallet on this browser.")
    expect(html).not.toContain("Claim 1.000")
    expect(html.match(/<button/g)).toHaveLength(1)
  })

  it("does not flash a setup action or enable claims before saved state is loaded", () => {
    const html = render({ state: { ...state, hydrated: false } })
    expect(html).toContain("Loading setup…")
    expect(html).toContain("disabled")
    expect(html).not.toContain("Claim 1.000")
  })

  it("replaces setup with the existing claim action and a quiet change link", () => {
    const html = render({ state: { ...state, token } })
    expect(html).toContain("Claim 1.000 RWAGMI")
    expect(html).toContain("Token added")
    expect(html).toContain('class="p-loop-token-change"')
    expect(html).not.toContain("One-time setup")
    // A saved address does not assert that current eligibility checks passed.
    expect(html).not.toContain("Eligible")
  })

  it("shows checking instead of an enabled claim during verification", () => {
    const html = render({ state: { ...state, token, checking: true } })
    expect(html).toContain("Checking eligibility…")
    expect(html).toContain('aria-busy="true"')
    expect(html).not.toContain("Claim 1.000")
  })

  it("provides review or retry actions for failed checks", () => {
    const failed = {
      success: false,
      eligible: false,
      code: "PROVIDER_ELIGIBILITY_REQUIRED",
      error: "Use a token created by this wallet.",
      checks: { passport: "passed", creator: "failed" },
    } as const
    const html = render({ state: { ...state, token, result: failed } })
    expect(html).toContain("Review setup")
    expect(html).toContain(failed.error)
    expect(html).not.toContain("Claim 1.000")
    expect(
      render({
        state: {
          ...state,
          token,
          result: { ...failed, code: "VERIFICATION_UNAVAILABLE" },
        },
      })
    ).toContain("Retry check")
  })

  it("honors the server retry cooldown", () => {
    const html = render({ retrySeconds: 30 })
    expect(html).toContain("Try again in 30s")
    expect(html).toContain("disabled")
  })

  it("does not promise browser persistence when storage is unavailable", () => {
    const html = render({
      state: {
        ...state,
        token,
        storageError: "Browser storage is unavailable.",
      },
    })
    expect(html).toContain("Token added for this session")
    expect(html).not.toContain("Eligible")
    expect(html).toContain("Claim 1.000")
  })

  it("keeps pending and completed Loop states visible rather than interrupting them with setup", () => {
    expect(render({ actionPending: true })).toContain("Claim 1.000")
    expect(render({ actionPending: true })).toContain("disabled")
    const html = renderToStaticMarkup(
      <RwagmiSetupAction {...props} preserveAction>
        <span>Next claim in 06:24:18</span>
      </RwagmiSetupAction>
    )
    expect(html).toContain("Next claim in 06:24:18")
    expect(html).not.toContain("One-time setup")
  })
})
