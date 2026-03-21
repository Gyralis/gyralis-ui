import { useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"

import { AddressScoreResponse } from "../utils/types"

type UseGetScoreOptions = {
  enabled?: boolean
}

export const useGetScore = (options: UseGetScoreOptions = {}) => {
  const { address } = useAccount()
  const enabled = options.enabled ?? true

  const {
    isLoading,
    isError,
    data,
    error,
    isRefetching,
    refetch: refetchQuery,
  } = useQuery({
    refetchOnWindowFocus: false,

    queryKey: ["score", address],
    enabled: enabled && Boolean(address),
    queryFn: async () => {
      if (!address) throw new Error("No address provided.")
      const response = await fetch(`/api/gitcoin-passport/${address}/score`)
      const data = await response.json()
      if (response.status === 200) {
        return data as AddressScoreResponse
      }
      if (data.detail) throw data.detail
      throw new Error(response.statusText)
    },
  })

  const refetch = useCallback(() => void refetchQuery(), [refetchQuery])

  return {
    isLoading: isLoading || isRefetching,
    isRefetching,
    isError,
    error,
    data,
    refetch,
  }
}
