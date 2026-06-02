import { useCallback, useMemo } from "react"
import { zeroAddress, type Address } from "viem"
import { useBalance, useReadContracts } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  getLoopContractAbi,
  getLoopContractMethods,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { erc20Abi } from "@/lib/generated/blockchain"

const SEC_TO_DAY = 60n * 60n * 24n
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
  flowRatePerDay?: bigint
  flowRatePerPeriod?: bigint
  flowRatePerSecond?: bigint
  periodLengthSeconds?: bigint
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
  const queryEnabled = enabled && Boolean(token)
  const isSuperLoop = contractType === "superLoop"
  const loopAbi = useMemo(
    () => getLoopContractAbi(chainId, contractType),
    [chainId, contractType]
  )
  const loopMethods = useMemo(
    () => getLoopContractMethods(contractType),
    [contractType]
  )
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
    isError: isSuperLoopDataError,
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
        address: address ?? zeroAddress,
        abi: loopAbi,
        functionName: loopMethods.getDetails,
        chainId,
      },
      {
        address: address ?? zeroAddress,
        abi: loopAbi,
        functionName: "realtimeAvailableNow",
        chainId,
      },
      {
        address: cfaV1ForwarderAddress ?? zeroAddress,
        abi: cfaV1ForwarderAbi,
        functionName: "getAccountFlowrate",
        args: [token ?? zeroAddress, address ?? zeroAddress],
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

      const [decimals, symbol, loopDetails, realtimeAvailableNow, flowRateRaw] =
        superLoopData as readonly [
          number,
          string,
          readonly [Address, bigint, bigint, bigint],
          bigint,
          bigint,
        ]
      const periodLengthSeconds = loopDetails[1]
      const flowRatePerSecond = flowRateRaw
      const flowRatePerPeriod = flowRatePerSecond * periodLengthSeconds
      const flowRatePerDay = flowRatePerSecond * SEC_TO_DAY

      return {
        value: realtimeAvailableNow,
        flowRatePerSecond,
        flowRatePerPeriod,
        flowRatePerDay,
        periodLengthSeconds,
        flowRateError: false,
        decimals,
        symbol,
      }
    }

    if (!tokenBalance.data) return undefined

    return {
      value: tokenBalance.data.value,
      flowRatePerSecond: undefined,
      flowRatePerDay: undefined,
      flowRateError: false,
      decimals: tokenBalance.data.decimals,
      symbol: tokenBalance.data.symbol,
    }
  }, [isSuperLoop, superLoopData, tokenBalance.data])

  const refetch = useCallback(async () => {
    await (isSuperLoop ? refetchSuperLoopData() : refetchTokenBalance())
  }, [isSuperLoop, refetchSuperLoopData, refetchTokenBalance])

  return {
    data,
    isError: isSuperLoop ? isSuperLoopDataError : tokenBalance.isError,
    isLoading: isSuperLoop ? isSuperLoopDataLoading : tokenBalance.isLoading,
    refetch,
  }
}
