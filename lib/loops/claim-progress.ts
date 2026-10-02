import type { QueryClient } from "@tanstack/react-query"

import type { LoopActionConfirmation } from "./loop-action-confirmation"
import type { TotalClaimsSnapshot } from "./total-claims"

export interface ClaimProgressState {
  pending: LoopActionConfirmation[]
  syncing: boolean
  lastClaim: LoopActionConfirmation | null
  sequence: number
}

export const emptyClaimProgress: ClaimProgressState = {
  pending: [],
  syncing: false,
  lastClaim: null,
  sequence: 0,
}

export function outstandingClaims(
  pending: LoopActionConfirmation[],
  snapshot?: TotalClaimsSnapshot
) {
  return pending.filter(
    (claim) => !snapshot || claim.blockNumber > BigInt(snapshot.indexedBlock)
  )
}

function createClaimProgress() {
  let state = emptyClaimProgress
  const seen = new Set<string>()
  const listeners = new Set<() => void>()
  const update = (next: Partial<ClaimProgressState>) => {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
  }
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    add(claim: LoopActionConfirmation) {
      const key = `${claim.chainId}:${claim.transactionHash.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      update({
        pending: [...state.pending, claim],
        lastClaim: claim,
        sequence: state.sequence + 1,
      })
      return true
    },
    reconcile(snapshot: TotalClaimsSnapshot) {
      const pending = outstandingClaims(state.pending, snapshot)
      if (pending.length !== state.pending.length) update({ pending })
    },
    setSyncing: (syncing: boolean) => update({ syncing }),
  }
}

const stores = new WeakMap<
  QueryClient,
  ReturnType<typeof createClaimProgress>
>()
export function getClaimProgress(queryClient: QueryClient) {
  let store = stores.get(queryClient)
  if (!store) {
    store = createClaimProgress()
    stores.set(queryClient, store)
  }
  return store
}
