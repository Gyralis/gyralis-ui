import { useEffect, useMemo, useState } from "react"
import { Address } from "viem"
import { useChainId, useReadContract } from "wagmi"

import deployedContracts from "@/lib/generated/deployed-contracts"

interface LoopDetails {
  token: Address
  periodLength: number
  percentPerPeriod: number
  firstPeriodStart: bigint
  currentPeriod: number
}

export const useLoopSettings = (address: Address, chain: number) => {
  const loopAbi = useMemo(() => {
    return (
      deployedContracts?.[chain as keyof typeof deployedContracts]?.loop?.abi ??
      []
    )
  }, [chain])

  const {
    data: readContractData,
    refetch: refetchDetails,
    isLoading: isLoadingDetails,
  } = useReadContract({
    abi: loopAbi,
    address: address,
    functionName: "getLoopDetails",
    chainId: chain,
  })

  const {
    data: currentPeriod,
    refetch: refetchPeriod,
    isLoading: isLoadingCurrentPeriod,
  } = useReadContract({
    abi: loopAbi,
    address: address,
    functionName: "getCurrentPeriod",
    chainId: chain,
  })

  const [loopDetails, setLoopDetails] = useState<LoopDetails | undefined>(
    undefined
  )
  const isLoading = isLoadingDetails || isLoadingCurrentPeriod

  useEffect(() => {
    if (!readContractData || !currentPeriod) return

    // setLoopDetails({
    //   periodLength: Number(readContractData[1]),
    //   percentPerPeriod: Number(readContractData[2]),
    //   firstPeriodStart: readContractData[3],
    //   currentPeriod: Number(currentPeriod),
    // })
  }, [readContractData, currentPeriod])

  // This gives the number of seconds until the next period
  const getSecondsUntilNextPeriod = () => {
    const now = Math.floor(Date.now() / 1000)
    const timeSinceStart = now - Number(loopDetails?.firstPeriodStart)
    const secondsIntoCurrentPeriod =
      loopDetails?.periodLength !== undefined
        ? timeSinceStart % loopDetails.periodLength
        : 0
    return (loopDetails?.periodLength ?? 0) - secondsIntoCurrentPeriod
  }

  // Schedule refetch when the period is about to change
  useEffect(() => {
    if (!loopDetails) return

    const delay = getSecondsUntilNextPeriod() * 1000

    console.log(`[useLoopData] Scheduling next refetch in ${delay / 1000}s`)

    const timeout = setTimeout(async () => {
      console.log("[useLoopData] Period ended. Triggering refetch...")
      await Promise.all([refetchDetails(), refetchPeriod()])
    }, delay)

    return () => clearTimeout(timeout)
  }, [loopDetails])

  //  return { loopDetails, isLoading }
  return { readContractData, isLoading }
}
