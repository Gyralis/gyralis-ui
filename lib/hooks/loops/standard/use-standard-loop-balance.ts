import { zeroAddress, type Address } from "viem"
import { useBalance } from "wagmi"

interface UseStandardLoopBalanceParams {
  address?: Address
  chainId: number
  enabled?: boolean
  token?: Address
}

export function useStandardLoopBalance({
  address,
  chainId,
  enabled = true,
  token,
}: UseStandardLoopBalanceParams) {
  const query = useBalance({
    address: address ?? zeroAddress,
    token,
    chainId,
    query: {
      enabled: enabled && Boolean(address && token),
    },
  })

  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
