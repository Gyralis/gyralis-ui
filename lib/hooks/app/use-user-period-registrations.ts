"use client"

import { useEffect, useState } from "react"
import { parseAbiItem, type Address, type Log } from "viem"
import { usePublicClient } from "wagmi"

import { getLogsChunked } from "./get-logs-chunked"
import { usePeriodLogBlockRange } from "./use-period-log-block-range"

const upgradedRegisterEvent = parseAbiItem(
  "event Register(address indexed sender, address indexed token, uint256 indexed periodNumber)"
)
const ALCHEMY_LOG_CHUNK_SIZE = 9n
type UpgradedRegisterLog = Log<
  bigint,
  number,
  false,
  typeof upgradedRegisterEvent
>

interface UseUserPeriodRegistrationsOptions {
  chainId: number
  currentPeriod?: bigint
  enabled?: boolean
  firstPeriodStart?: bigint
  loopAddress: Address
  periodLength?: bigint
  refreshKey?: number
  userAddress?: Address
}

interface UserPeriodRegistrations {
  error?: Error
  isLoading: boolean
  registeredNext: boolean
  registeredPrevious: boolean
}

export function useUserPeriodRegistrations({
  chainId,
  currentPeriod,
  enabled = true,
  firstPeriodStart,
  loopAddress,
  periodLength,
  refreshKey = 0,
  userAddress,
}: UseUserPeriodRegistrationsOptions): UserPeriodRegistrations {
  const publicClient = usePublicClient({ chainId })
  const [result, setResult] = useState<UserPeriodRegistrations>({
    isLoading: false,
    registeredNext: false,
    registeredPrevious: false,
  })
  const ready =
    enabled &&
    Boolean(publicClient && userAddress) &&
    currentPeriod != null &&
    firstPeriodStart != null &&
    periodLength != null
  const nextRegistrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: ready,
    firstPeriodStart,
    periodLength,
    windowPeriod: currentPeriod,
  })
  const previousRegistrationRange = usePeriodLogBlockRange({
    chainId,
    enabled: ready && currentPeriod != null && currentPeriod > 0n,
    firstPeriodStart,
    periodLength,
    windowPeriod:
      currentPeriod != null && currentPeriod > 1n ? currentPeriod - 2n : 0n,
  })

  useEffect(() => {
    setResult({
      isLoading: ready,
      registeredNext: false,
      registeredPrevious: false,
    })
  }, [currentPeriod, ready, userAddress])

  useEffect(() => {
    if (!ready || !publicClient || !userAddress || currentPeriod == null) return
    if (nextRegistrationRange.loading || previousRegistrationRange.loading) {
      return
    }
    if (
      nextRegistrationRange.fromBlock == null ||
      nextRegistrationRange.toBlock == null ||
      (currentPeriod > 0n &&
        (previousRegistrationRange.fromBlock == null ||
          previousRegistrationRange.toBlock == null))
    ) {
      return
    }

    let cancelled = false

    const fetchNextRegistration = async () => {
      try {
        const getRegistration = async (
          periodNumber: bigint,
          fromBlock: bigint,
          toBlock: bigint
        ) => {
          const logs = await getLogsChunked(
            publicClient,
            {
              address: loopAddress,
              event: upgradedRegisterEvent,
              args: { sender: userAddress, periodNumber },
              fromBlock,
              toBlock,
            },
            ALCHEMY_LOG_CHUNK_SIZE
          ).then((value) => value as UpgradedRegisterLog[])

          return logs.length > 0
        }
        const [registeredPrevious, registeredNext] = await Promise.all([
          currentPeriod > 0n
            ? getRegistration(
                currentPeriod - 1n,
                previousRegistrationRange.fromBlock!,
                previousRegistrationRange.toBlock!
              )
            : Promise.resolve(false),
          getRegistration(
            currentPeriod + 1n,
            nextRegistrationRange.fromBlock!,
            nextRegistrationRange.toBlock!
          ),
        ])

        if (!cancelled) {
          setResult({ isLoading: false, registeredNext, registeredPrevious })
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            error:
              error instanceof Error
                ? error
                : new Error("Unable to check next-period registration"),
            isLoading: false,
            registeredNext: false,
            registeredPrevious: false,
          })
        }
      }
    }

    void fetchNextRegistration()

    return () => {
      cancelled = true
    }
  }, [
    currentPeriod,
    loopAddress,
    nextRegistrationRange.fromBlock,
    nextRegistrationRange.loading,
    nextRegistrationRange.toBlock,
    previousRegistrationRange.fromBlock,
    previousRegistrationRange.loading,
    previousRegistrationRange.toBlock,
    publicClient,
    ready,
    refreshKey,
    userAddress,
  ])

  return result
}
