import { useEffect, useState } from "react"
import MockSuperTokenStreamingABI from "@/abis/MockSuperTokenStreaming.json"
import { Address } from "viem"
import { usePublicClient } from "wagmi"

export function useSuperfluidBalance({
  token,
  account,
  chainId,
  enabled = true,
}: {
  token: Address
  account: Address
  chainId: number
  enabled?: boolean
}) {
  const client = usePublicClient({ chainId })

  const [data, setData] = useState<{
    value: bigint
    decimals: number
  } | null>(null)

  const [isLoading, setLoading] = useState(true)
  const [isError, setError] = useState(false)

  useEffect(() => {
    if (!enabled) {
      console.log("SF Hook disabled → skipping")
      setLoading(false)
      return
    }

    console.log("SF Hook init →", { account, token, chainId, client })

    if (!client) {
      console.log("SF Hook: client not ready yet")
      return
    }

    if (!token || !account) {
      console.log("SF Hook missing inputs → stopping")
      setLoading(false)
      return
    }

    async function fetchBalance() {
      try {
        setLoading(true)
        setError(false)

        const abi = MockSuperTokenStreamingABI.abi as any

        console.log("Calling realtimeBalanceOfNow:", { token, account })

        const sfResult: any = await client.readContract({
          address: token,
          abi,
          functionName: "realtimeBalanceOfNow",
          args: [account],
        })

        console.log("SF raw result:", sfResult)

        const available = BigInt(sfResult?.[0] ?? 0)

        const decimals: any = await client.readContract({
          address: token,
          abi,
          functionName: "decimals",
          args: [],
        })

        console.log("SF decimals:", decimals)
        console.log("SF parsed balance:", available)

        setData({
          value: available,
          decimals: Number(decimals ?? 18),
        })
      } catch (err) {
        console.error("Superfluid balance error:", err)
        setError(true)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [client, token, account, chainId, enabled])

  return { data, isLoading, isError }
}
