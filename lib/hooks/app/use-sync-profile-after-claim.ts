"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { isAddress, type Address } from "viem"
import { useAccount } from "wagmi"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

const syncRequests = new Map<string, Promise<void>>()

export async function requestProfileClaimSync(input: {
  chainId: number
  contractAddress: Address
  loopId: number
  periodNumber?: bigint
  transactionHash: `0x${string}`
  wallet: Address
}) {
  const response = await fetch(`/api/scoring/${input.wallet.toLowerCase()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      txHash: input.transactionHash,
      chainId: input.chainId,
      loopId: input.loopId,
      contractAddress: input.contractAddress,
      periodNumber:
        input.periodNumber == null ? undefined : Number(input.periodNumber),
    }),
  })
  if (!response.ok) throw new Error("Profile claim sync failed")
}

export function useSyncProfileAfterClaim({
  contractAddress,
  loopId,
  periodNumber,
}: {
  contractAddress?: Address
  loopId: number
  periodNumber?: bigint
}) {
  const { address: connectedAccount } = useAccount()
  const queryClient = useQueryClient()

  return useCallback(
    async (confirmation: LoopActionConfirmation) => {
      if (
        confirmation.action !== "claim" ||
        confirmation.chainId !== 100 ||
        !connectedAccount ||
        !contractAddress ||
        !isAddress(contractAddress)
      ) {
        return
      }

      const wallet = connectedAccount.toLowerCase()
      const transactionHash = confirmation.transactionHash.toLowerCase()
      const existing = syncRequests.get(transactionHash)
      if (existing) return existing

      const request = (async () => {
        try {
          await requestProfileClaimSync({
            chainId: confirmation.chainId,
            contractAddress,
            loopId,
            periodNumber,
            transactionHash: confirmation.transactionHash,
            wallet: connectedAccount,
          })

          await queryClient.invalidateQueries({
            queryKey: ["profile-summary", wallet],
          })
        } catch (error) {
          console.error("[profile-claim-sync] failed", error)
        }
      })()

      syncRequests.set(transactionHash, request)
      await request
    },
    [connectedAccount, contractAddress, loopId, periodNumber, queryClient]
  )
}
