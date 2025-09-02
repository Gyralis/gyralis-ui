import { parseUnits } from "viem"

import { Asset, Chain } from "./types"

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12

  return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`
}


export function findChain(
  chains: Chain[],
  domainId: string
): Chain | undefined {
  return chains.find((chain) => chain.domain_id === domainId)
}

export function findAsset(
  assets: Asset[],
  transactingAsset: string
): Asset | undefined {
  return assets.find((asset) =>
    asset.contracts.some((contract) => {
      const contractAddress = contract.contract_address?.toLowerCase()
      const nextContractAddress =
        contract.next_asset?.contract_address?.toLowerCase()
      return (
        contractAddress === transactingAsset?.toLowerCase() ||
        nextContractAddress === transactingAsset?.toLowerCase()
      )
    })
  )
}

export function findDecimals(
  asset: Asset,
  transactingAsset: string
): number | undefined {
  const contract = asset?.contracts.find((contract) => {
    const contractAddress = contract.contract_address?.toLowerCase()
    const nextContractAddress =
      contract.next_asset?.contract_address?.toLowerCase()
    return (
      contractAddress === transactingAsset?.toLowerCase() ||
      nextContractAddress === transactingAsset?.toLowerCase()
    )
  })

  return contract?.decimals ?? contract?.next_asset?.decimals
}

export function calculateAmount(amount: string, decimals: number): string {
  const amountBigInt = BigInt(amount)
  const divisor = parseUnits("10", decimals)
  const result = Number(amountBigInt) / Number(divisor)
  const formattedResult = result.toFixed(2)
  return formattedResult === "0.00" ? "0.00" : formattedResult
}
