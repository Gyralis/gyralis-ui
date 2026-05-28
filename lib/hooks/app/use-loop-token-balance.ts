import { useCallback, useMemo } from "react"
import { parseUnits, zeroAddress, type Address } from "viem"
import { useBalance, useReadContracts } from "wagmi"

import {
  DEFAULT_LOOP_CONTRACT_TYPE,
  type LoopContractType,
} from "@/lib/contracts/loop-contracts"
import { erc20Abi } from "@/lib/generated/blockchain"

const SEC_TO_DAY = 60n * 60n * 24n
const SUPER_LOOP_TEST_FLOW_RATE_PER_SECOND = "1"
const SUPER_LOOP_TEST_PERIOD_SECONDS = 120n

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

  const tokenBalance = useBalance({
    address: address ?? zeroAddress,
    token,
    chainId,
    query: {
      enabled: queryEnabled && !isSuperLoop && Boolean(address),
    },
  })

  const {
    data: superLoopTokenMetadata,
    isError: isSuperLoopTokenMetadataError,
    isLoading: isSuperLoopTokenMetadataLoading,
    refetch: refetchSuperLoopTokenMetadata,
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
    ],
    query: {
      enabled: queryEnabled && isSuperLoop,
    },
  })

  const { refetch: refetchTokenBalance } = tokenBalance

  const data = useMemo<LoopTokenBalanceData | undefined>(() => {
    if (isSuperLoop) {
      if (!superLoopTokenMetadata) return undefined

      const [decimals, symbol] = superLoopTokenMetadata as readonly [
        number,
        string,
      ]
      const flowRatePerSecond = parseUnits(
        SUPER_LOOP_TEST_FLOW_RATE_PER_SECOND,
        decimals
      )
      const flowRatePerPeriod =
        flowRatePerSecond * SUPER_LOOP_TEST_PERIOD_SECONDS
      const flowRatePerDay = flowRatePerSecond * SEC_TO_DAY

      return {
        // Keep `value` aligned with the meaningful super loop distribution unit:
        // how many tokens are released per claim period.
        value: flowRatePerPeriod,
        flowRatePerSecond,
        flowRatePerPeriod,
        flowRatePerDay,
        periodLengthSeconds: SUPER_LOOP_TEST_PERIOD_SECONDS,
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
  }, [
    isSuperLoop,
    superLoopTokenMetadata,
    tokenBalance.data,
  ])

  const refetch = useCallback(async () => {
    await (isSuperLoop ? refetchSuperLoopTokenMetadata() : refetchTokenBalance())
  }, [isSuperLoop, refetchSuperLoopTokenMetadata, refetchTokenBalance])

  return {
    data,
    isError: isSuperLoop ? isSuperLoopTokenMetadataError : tokenBalance.isError,
    isLoading: isSuperLoop
      ? isSuperLoopTokenMetadataLoading
      : tokenBalance.isLoading,
    refetch,
  }
}
