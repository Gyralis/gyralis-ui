const BLOCKSCOUT_TRANSACTION_BASE_URLS: Record<number, string> = {
  100: "https://gnosis.blockscout.com/tx",
  10200: "https://gnosis-chiado.blockscout.com/tx",
  8453: "https://base.blockscout.com/tx",
}

export const BLOCKSCOUT_TRANSACTION_LABEL = "View on Blockscout"

export function getBlockscoutTransactionUrl(
  chainId: number,
  transactionHash?: `0x${string}`
) {
  const baseUrl = BLOCKSCOUT_TRANSACTION_BASE_URLS[chainId]

  return baseUrl && transactionHash
    ? `${baseUrl}/${transactionHash}`
    : undefined
}
