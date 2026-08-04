"use client"

import type { LoopCardData } from "@/data/loops-data"
import { useAccount } from "wagmi"

import { useSuperLoopStatus } from "@/lib/hooks/loops/super/use-super-loop-status"

export function useSuperLoopCardController(loop: LoopCardData) {
  const { address: account } = useAccount()
  const statusReads = useSuperLoopStatus({
    address: loop.address,
    chainId: loop.chainId,
    user: account,
  })

  return {
    error: statusReads.error,
    errors: statusReads.errors,
    isError: statusReads.isError,
    isFetching: statusReads.isFetching,
    isLoading: statusReads.isLoading,
    raw: {
      account,
      ...statusReads.data,
    },
    refresh: statusReads.refetch,
  }
}
