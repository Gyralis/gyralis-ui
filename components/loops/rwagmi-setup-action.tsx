"use client"

import type { ReactNode, Ref } from "react"
import { LuCheck } from "react-icons/lu"

import type { RwagmiTokenState } from "@/lib/loops/rwagmi-token-store"

interface RwagmiSetupActionProps {
  state: RwagmiTokenState
  wallet?: string
  retrySeconds: number
  actionPending?: boolean
  preserveAction?: boolean
  triggerRef?: Ref<HTMLButtonElement>
  onSetup: () => void
  onRetry: () => void
  children?: ReactNode
}

/** The setup step occupies the same primary-action slot as Register/Claim. */
export function RwagmiSetupAction({
  state,
  wallet,
  retrySeconds,
  actionPending = false,
  preserveAction = false,
  triggerRef,
  onSetup,
  onRetry,
  children,
}: RwagmiSetupActionProps) {
  const failed = state.result?.success === false
  const needsSetup = !state.token || failed
  const retryable =
    failed &&
    state.result?.success === false &&
    state.result.code === "VERIFICATION_UNAVAILABLE"
  const showSetup =
    !actionPending &&
    !preserveAction &&
    (!state.hydrated || state.checking || needsSetup)

  if (!showSetup) {
    return (
      <div className="p-loop-token-setup">
        <div className="p-loop-token-saved">
          <span>
            {state.token && <LuCheck aria-hidden="true" />}
            {state.token
              ? state.storageError
                ? "Token added for this session"
                : "Token added"
              : "Token setup"}
          </span>
          <button
            type="button"
            className="p-loop-token-change"
            ref={triggerRef}
            onClick={onSetup}
            disabled={actionPending}
            title={state.token}
          >
            {state.token ? "Change token" : "Set up RWAGMI"}
          </button>
        </div>
        {children}
      </div>
    )
  }

  const loading = !state.hydrated || state.checking
  const label = !wallet
    ? "Connect wallet"
    : !state.hydrated
    ? "Loading setup…"
    : state.checking
    ? "Checking eligibility…"
    : retrySeconds
    ? `Try again in ${retrySeconds}s`
    : retryable
    ? "Retry check"
    : failed
    ? "Review setup"
    : "Set up RWAGMI"
  return (
    <div className="p-loop-token-setup">
      <div className="p-loop-token-intro">
        <span className="p-loop-token-step">One-time setup</span>
        <p>
          {failed
            ? state.result?.success === false
              ? state.result.error
              : "Review your token setup."
            : "Add the token you created to get started."}
        </p>
      </div>
      <button
        type="button"
        className="p-button"
        ref={triggerRef}
        disabled={Boolean(wallet) && (loading || retrySeconds > 0)}
        aria-busy={loading}
        onClick={retryable ? onRetry : onSetup}
      >
        {label}
      </button>
      <p className="p-loop-token-storage">
        {state.storageError ?? "Remembered for this wallet on this browser."}
      </p>
    </div>
  )
}
