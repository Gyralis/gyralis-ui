"use client"

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import Link from "next/link"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

import {
  uncheckedRwagmiChecks,
  type RwagmiChecks,
} from "@/lib/loops/rwagmi-eligibility"
import { createRwagmiTokenStore } from "@/lib/loops/rwagmi-token-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const shorten = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`
const statusLabels: Record<RwagmiChecks["passport"], string> = {
  passed: "Passed",
  failed: "Requirement unmet",
  not_checked: "Not checked",
  unavailable: "Unavailable",
}

export function RwagmiTokenEligibility({
  compact = false,
}: {
  compact?: boolean
}) {
  const { address, isConnected } = useAccount()
  const wallet = isConnected ? address?.toLowerCase() : undefined
  return (
    <WalletTokenEligibility
      key={wallet ?? "disconnected"}
      wallet={wallet}
      compact={compact}
    />
  )
}

function WalletTokenEligibility({
  wallet,
  compact,
}: {
  wallet?: string
  compact: boolean
}) {
  const { openConnectModal } = useConnectModal()
  const store = useMemo(
    () =>
      createRwagmiTokenStore(wallet, { storage: () => window.localStorage }),
    [wallet]
  )
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [inputError, setInputError] = useState<string>()
  const [now, setNow] = useState(Date.now)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    store.hydrate()
    return () => store.dispose()
  }, [store])
  useEffect(() => {
    if (state.retryAt <= Date.now()) return
    setNow(Date.now())
    const timer = setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      if (currentTime >= state.retryAt) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [state.retryAt])
  const retrySeconds = Math.max(0, Math.ceil((state.retryAt - now) / 1000))
  const busy = state.checking || retrySeconds > 0
  const setDialogOpen = (value: boolean) => {
    setOpen(value)
    setDraft(value ? state.token ?? "" : "")
    setInputError(undefined)
  }
  const feedback = (
    <div
      className="space-y-2 text-sm"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {state.checking ? <p>Checking eligibility…</p> : null}
      <dl className="grid gap-2 rounded-xl border border-border bg-muted/20 p-3">
        {(
          [
            ["passport", "Human Passport"],
            ["creator", "Token creator"],
          ] as const
        ).map(([key, label]) => {
          const status = (state.result?.checks ?? uncheckedRwagmiChecks)[key]
          return (
            <div key={key} className="flex items-center justify-between gap-3">
              <dt>{label}</dt>
              <dd
                className={
                  status === "passed"
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                }
              >
                {statusLabels[status]}
              </dd>
            </div>
          )
        })}
      </dl>
      {state.result?.success ? (
        <p className="text-primary">
          Human Passport and token creator checks passed.
        </p>
      ) : state.result ? (
        <p>{state.result.error}</p>
      ) : null}
      {retrySeconds > 0 ? (
        <p className="text-muted-foreground">
          Try again in {retrySeconds}{" "}
          {retrySeconds === 1 ? "second" : "seconds"}.
        </p>
      ) : null}
      {state.storageError ? (
        <p className="text-muted-foreground">{state.storageError}</p>
      ) : null}
      {state.result?.success === false &&
      state.result.code === "PASSPORT_SCORE_REQUIRED" ? (
        <Link
          href="/integration/gitcoin-passport"
          className="inline-block font-semibold text-primary underline underline-offset-4"
        >
          Open GyraHub
        </Link>
      ) : null}
    </div>
  )
  const retryLabel = retrySeconds
    ? `Try again in ${retrySeconds}s`
    : state.result?.success === false
    ? "Try again"
    : "Check eligibility"
  return (
    <div
      aria-label="RWAGMI token eligibility"
      className={compact ? "flex shrink-0 items-center gap-2" : "space-y-3"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!compact && (
          <div className="min-w-0">
            {state.token ? (
              <a
                href={`https://rwagmi.com/token/${state.token}`}
                target="_blank"
                rel="noopener noreferrer"
                title={state.token}
                aria-label={`View token ${state.token} on RWAGMI`}
                className="font-mono text-sm underline underline-offset-4"
              >
                {shorten(state.token)}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add the token you created on RWAGMI.
              </p>
            )}
          </div>
        )}
        <Button
          ref={trigger}
          requireWallet={false}
          variant="secondary"
          className={
            compact
              ? "!h-6 !min-h-0 whitespace-nowrap !rounded-full !px-2 !py-0 text-[11px] leading-4"
              : "min-h-10 rounded-full px-4 text-sm"
          }
          title={state.token}
          onClick={() => (wallet ? setDialogOpen(true) : openConnectModal?.())}
        >
          {!wallet
            ? "Connect wallet"
            : state.token
            ? "Change token"
            : "Add token"}
        </Button>
      </div>
      {compact && (state.checking || state.result) ? (
        <span role="status" className="text-xs text-muted-foreground">
          {state.checking
            ? "Checking…"
            : state.result?.success
            ? "Eligible"
            : "Check needed"}
        </span>
      ) : null}
      {!compact && state.token && !open ? feedback : null}
      {!compact && state.token && !open ? (
        <Button
          disabled={busy}
          isLoading={state.checking}
          className="min-h-10 rounded-full px-4 text-sm"
          onClick={() => void store.check()}
        >
          {state.checking ? "Checking eligibility…" : retryLabel}
        </Button>
      ) : null}
      {!compact && state.token ? (
        <p className="text-xs text-muted-foreground">Launch data from RWAGMI</p>
      ) : null}
      {!compact && !state.token && state.storageError ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.storageError}
        </p>
      ) : null}
      <Dialog open={open} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-2xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            trigger.current?.focus()
          }}
        >
          <DialogHeader>
            <DialogTitle>Your RWAGMI token</DialogTitle>
            <DialogDescription>
              Paste the Base token address you created on RWAGMI.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p title={wallet}>
              Connected wallet:{" "}
              <span className="font-mono" aria-label={wallet}>
                {wallet ? shorten(wallet) : "Disconnected"}
              </span>
            </p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
              Base network
            </span>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              setInputError(store.saveAndCheck(draft))
            }}
          >
            <div className="space-y-2">
              <label htmlFor={`${id}-token`} className="text-sm font-semibold">
                Token address
              </label>
              <Input
                id={`${id}-token`}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value)
                  setInputError(undefined)
                }}
                placeholder="0x…"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={Boolean(inputError)}
                aria-describedby={inputError ? `${id}-error` : undefined}
                className="h-12 font-mono"
              />
              {inputError ? (
                <p
                  id={`${id}-error`}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {inputError}
                </p>
              ) : null}
            </div>
            {draft.trim().toLowerCase() === state.token?.toLowerCase()
              ? feedback
              : null}
            <DialogFooter className="w-full [&>div]:w-full">
              {state.result?.success &&
              draft.trim().toLowerCase() === state.token?.toLowerCase() ? (
                <Button
                  requireWallet={false}
                  variant="primary"
                  onClick={() => setDialogOpen(false)}
                  className="min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Done
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={busy || !draft.trim()}
                  isLoading={state.checking}
                  className="min-h-12 w-full rounded-full px-5 py-3 text-sm font-semibold"
                >
                  {state.checking
                    ? "Checking eligibility…"
                    : retrySeconds
                    ? `Try again in ${retrySeconds}s`
                    : "Check and save"}
                </Button>
              )}
            </DialogFooter>
          </form>
          {compact && state.token ? (
            <p className="text-xs text-muted-foreground">
              Launch data from RWAGMI ·{" "}
              <a
                href={`https://rwagmi.com/token/${state.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                View token
              </a>
            </p>
          ) : null}
          {state.token ? (
            <Button
              requireWallet={false}
              variant="secondary"
              className="min-h-10 px-4 text-sm"
              onClick={() => {
                store.remove()
                setDialogOpen(false)
              }}
            >
              Remove token
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
