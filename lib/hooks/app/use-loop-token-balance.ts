import { useCallback, useMemo } from "react"
import { zeroAddress, type Address } from "viem"
import { useBalance, useReadContract } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"

const superTokenRealtimeBalanceAbi = [
  {
    type: "function",
    name: "realtimeBalanceOfNow",
    inputs: [{ name: "account", type: "address" }],
    outputs: [
      { name: "availableBalance", type: "int256" },
      { name: "deposit", type: "uint256" },
      { name: "owedDeposit", type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const

const cfaV1ForwarderAddress =
  "0xcfA132E353cB4E398080B9700609bb008eceB125" as const

const cfaV1ForwarderAbi = [
  {
    type: "function",
    name: "getAccountFlowrate",
    inputs: [
      { name: "token", type: "address" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "flowrate", type: "int96" }],
    stateMutability: "view",
  },
] as const

type LoopTokenBalanceData = {
  flowRateError?: boolean
  flowRatePerSecond?: bigint
  value: bigint
  decimals: number
  symbol: string
}

type UseLoopTokenBalanceParams = {
  address?: Address
  chainId: number
  contractType?: LoopContractType
  enabled?: boolean
  token?: Address
}

export function useLoopTokenBalance({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  enabled = true,
  token,
}: UseLoopTokenBalanceParams) {
  const queryEnabled = enabled && Boolean(address && token)
  const isSuperLoop = contractType === "superLoop"

  const tokenBalance = useBalance({
    address: address ?? zeroAddress,
    token,
    chainId,
    query: {
      enabled: queryEnabled,
    },
  })

  const realtimeBalance = useReadContract({
    address: token,
    abi: superTokenRealtimeBalanceAbi,
    functionName: "realtimeBalanceOfNow",
    args: [address ?? zeroAddress],
    chainId,
    query: {
      enabled: queryEnabled && isSuperLoop,
    },
  })

  const realtimeBalanceData = realtimeBalance.data
  const accountFlowRate = useReadContract({
    address: cfaV1ForwarderAddress,
    abi: cfaV1ForwarderAbi,
    functionName: "getAccountFlowrate",
    args: [token ?? zeroAddress, address ?? zeroAddress],
    chainId,
    query: {
      enabled: queryEnabled && isSuperLoop,
    },
  })
  const { refetch: refetchTokenBalance } = tokenBalance
  const { refetch: refetchRealtimeBalance } = realtimeBalance
  const { refetch: refetchAccountFlowRate } = accountFlowRate

  const data = useMemo<LoopTokenBalanceData | undefined>(() => {
    if (!tokenBalance.data) return undefined

    return {
      value:
        isSuperLoop && typeof realtimeBalanceData?.[0] === "bigint"
          ? realtimeBalanceData[0]
          : tokenBalance.data.value,
      flowRatePerSecond:
        isSuperLoop && typeof accountFlowRate.data === "bigint"
          ? accountFlowRate.data
          : undefined,
      flowRateError: isSuperLoop ? accountFlowRate.isError : false,
      decimals: tokenBalance.data.decimals,
      symbol: tokenBalance.data.symbol,
    }
  }, [
    accountFlowRate.data,
    accountFlowRate.isError,
    isSuperLoop,
    realtimeBalanceData,
    tokenBalance.data,
  ])

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchTokenBalance(),
      isSuperLoop ? refetchRealtimeBalance() : Promise.resolve(),
      isSuperLoop ? refetchAccountFlowRate() : Promise.resolve(),
    ])
  }, [
    isSuperLoop,
    refetchAccountFlowRate,
    refetchRealtimeBalance,
    refetchTokenBalance,
  ])

  return {
    data,
    isError: tokenBalance.isError || (isSuperLoop && realtimeBalance.isError),
    isLoading:
      tokenBalance.isLoading ||
      (isSuperLoop &&
        (realtimeBalance.isLoading || accountFlowRate.isLoading)),
    refetch,
  }
}
