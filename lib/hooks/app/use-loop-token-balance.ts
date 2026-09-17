import { useCallback, useMemo } from "react"
import { zeroAddress, type Address } from "viem"
import { useBalance, useReadContracts } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { erc20Abi } from "@/lib/generated/blockchain"

const cfaV1ForwarderAddresses: Partial<Record<number, Address>> = {
  8453: "0xcfA132E353cB4E398080B9700609bb008eceB125",
}

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
  payoutSymbol: string
  value?: bigint
  decimals: number
  symbol: string
}

type UseLoopTokenBalanceParams = {
  address?: Address
  chainId: number
  contractType?: LoopContractType
  enabled?: boolean
  payoutToken?: Address
  token?: Address
}

export function useLoopTokenBalance({
  address,
  chainId,
  contractType = DEFAULT_LOOP_CONTRACT_TYPE,
  enabled = true,
  payoutToken,
  token,
}: UseLoopTokenBalanceParams) {
  const queryEnabled = enabled && Boolean(token)
  const isSuperLoop = contractType === "superLoop"
  const cfaV1ForwarderAddress = cfaV1ForwarderAddresses[chainId]

  const tokenBalance = useBalance({
    address: address ?? zeroAddress,
    token,
    chainId,
    query: {
      enabled: queryEnabled && !isSuperLoop && Boolean(address),
    },
  })

  const {
    data: superLoopData,
    error: superLoopDataError,
    isError: isSuperLoopDataError,
    isFetching: isSuperLoopDataFetching,
    isLoading: isSuperLoopDataLoading,
    refetch: refetchSuperLoopData,
  } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: token ?? zeroAddress,
        abi: erc20Abi,
        functionName: "decimals",
        chainId,
      },
      {
        address: token ?? zeroAddress,
        abi: erc20Abi,
        functionName: "symbol",
        chainId,
      },
      {
        address: cfaV1ForwarderAddress ?? zeroAddress,
        abi: cfaV1ForwarderAbi,
        functionName: "getAccountFlowrate",
        args: [token ?? zeroAddress, address ?? zeroAddress],
        chainId,
      },
      {
        address: payoutToken ?? token ?? zeroAddress,
        abi: erc20Abi,
        functionName: "symbol",
        chainId,
      },
    ],
    query: {
      enabled:
        queryEnabled &&
        isSuperLoop &&
        Boolean(address) &&
        Boolean(cfaV1ForwarderAddress),
    },
  })

  const { refetch: refetchTokenBalance } = tokenBalance

  const data = useMemo<LoopTokenBalanceData | undefined>(() => {
    if (isSuperLoop) {
      if (!superLoopData) return undefined

      const [decimals, symbol, flowRateRaw, payoutSymbol] =
        superLoopData as unknown as readonly [number, string, bigint, string]
      const flowRatePerSecond = flowRateRaw

      return {
        flowRatePerSecond,
        flowRateError: false,
        decimals,
        payoutSymbol: payoutSymbol ?? symbol,
        symbol,
      }
    }

    if (!tokenBalance.data) return undefined

    return {
      value: tokenBalance.data.value,
      flowRatePerSecond: undefined,
      flowRateError: false,
      decimals: tokenBalance.data.decimals,
      payoutSymbol: tokenBalance.data.symbol,
      symbol: tokenBalance.data.symbol,
    }
  }, [isSuperLoop, superLoopData, tokenBalance.data])

  const refetch = useCallback(async () => {
    await (isSuperLoop ? refetchSuperLoopData() : refetchTokenBalance())
  }, [isSuperLoop, refetchSuperLoopData, refetchTokenBalance])

  return {
    data,
    error: isSuperLoop ? superLoopDataError : tokenBalance.error,
    isError: isSuperLoop ? isSuperLoopDataError : tokenBalance.isError,
    isFetching: isSuperLoop ? isSuperLoopDataFetching : tokenBalance.isFetching,
    isLoading: isSuperLoop ? isSuperLoopDataLoading : tokenBalance.isLoading,
    refetch,
  }
}
