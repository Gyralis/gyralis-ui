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
  registeredCurrent: boolean
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
    registeredCurrent: false,
    registeredNext: false,
    registeredPrevious: false,
  })
  const ready =
    enabled &&
    Boolean(publicClient && userAddress) &&
    currentPeriod != null &&
    firstPeriodStart != null &&
    periodLength != null
  const previousRegistrationWindow =
    currentPeriod != null && currentPeriod > 1n ? currentPeriod - 2n : 0n

  const previousRange = usePeriodLogBlockRange({
    chainId,
    enabled: ready && currentPeriod != null && currentPeriod > 0n,
    firstPeriodStart,
    periodLength,
    windowPeriod: previousRegistrationWindow,
  })

  const nextRange = usePeriodLogBlockRange({
    chainId,
    enabled: ready,
    firstPeriodStart,
    periodLength,
    windowPeriod: currentPeriod,
  })

  useEffect(() => {
    if (!ready || !publicClient || !userAddress || currentPeriod == null) {
      setResult({
        isLoading: false,
        registeredCurrent: false,
        registeredNext: false,
        registeredPrevious: false,
      })
      return
    }

    if (previousRange.loading || nextRange.loading) {
      setResult((current) => ({
        ...current,
        error: undefined,
        isLoading: true,
      }))
      return
    }

    if (
      nextRange.fromBlock == null ||
      nextRange.toBlock == null ||
      (currentPeriod > 0n &&
        (previousRange.fromBlock == null || previousRange.toBlock == null))
    ) {
      return
    }

    let cancelled = false

    const fetchRegistrations = async () => {
      setResult((current) => ({
        ...current,
        error: undefined,
        isLoading: true,
      }))

      try {
        const fromBlock =
          currentPeriod > 0n ? previousRange.fromBlock! : nextRange.fromBlock!
        const toBlock = nextRange.toBlock!
        const registrationLogs = await getLogsChunked(
          publicClient,
          {
            address: loopAddress,
            event: upgradedRegisterEvent,
            args: { sender: userAddress },
            fromBlock,
            toBlock,
          },
          ALCHEMY_LOG_CHUNK_SIZE
        ).then((logs) => logs as UpgradedRegisterLog[])
        const registrationPeriods = new Set(
          registrationLogs
            .map((log) => log.args.periodNumber)
            .filter((period): period is bigint => typeof period === "bigint")
        )
        const registeredPrevious =
          currentPeriod > 0n && registrationPeriods.has(currentPeriod - 1n)
        const registeredCurrent = registrationPeriods.has(currentPeriod)
        const registeredNext = registrationPeriods.has(currentPeriod + 1n)

        if (!cancelled) {
          setResult({
            isLoading: false,
            registeredCurrent,
            registeredNext,
            registeredPrevious,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setResult((current) => ({
            ...current,
            error:
              error instanceof Error
                ? error
                : new Error("Unable to check period registrations"),
            isLoading: false,
          }))
        }
      }
    }

    void fetchRegistrations()

    return () => {
      cancelled = true
    }
  }, [
    currentPeriod,
    loopAddress,
    nextRange.fromBlock,
    nextRange.loading,
    nextRange.toBlock,
    previousRange.fromBlock,
    previousRange.loading,
    previousRange.toBlock,
    publicClient,
    ready,
    refreshKey,
    userAddress,
  ])

  return result
}
