import type { GetLogsParameters, Log, PublicClient } from "viem"

const DEFAULT_LOG_CHUNK_SIZE = 9_999n
const ALCHEMY_FREE_TIER_LOG_CHUNK_SIZE = 9n

type TransportValueWithUrl = {
  url?: unknown
}

function getDefaultLogChunkSize(publicClient: PublicClient) {
  const transportValue =
    typeof publicClient.transport === "object" &&
    publicClient.transport !== null &&
    "value" in publicClient.transport
      ? publicClient.transport.value
      : undefined
  const transportUrl =
    typeof transportValue === "object" && transportValue !== null
      ? (transportValue as TransportValueWithUrl).url
      : undefined
  const url = typeof transportUrl === "string" ? transportUrl : undefined

  return url?.includes("alchemy.com")
    ? ALCHEMY_FREE_TIER_LOG_CHUNK_SIZE
    : DEFAULT_LOG_CHUNK_SIZE
}

type ChunkedGetLogsParams = Omit<GetLogsParameters, "event" | "args"> & {
  args?: unknown
  event?: unknown
  fromBlock: bigint
  toBlock: bigint | "latest"
}

export async function getLogsChunked(
  publicClient: PublicClient,
  params: ChunkedGetLogsParams,
  chunkSize = getDefaultLogChunkSize(publicClient)
): Promise<Log[]> {
  const toBlock =
    params.toBlock === "latest"
      ? await publicClient.getBlockNumber()
      : params.toBlock
  const logs: Log[] = []

  for (
    let fromBlock = params.fromBlock;
    fromBlock <= toBlock;
    fromBlock += chunkSize + 1n
  ) {
    const chunkToBlock =
      fromBlock + chunkSize > toBlock ? toBlock : fromBlock + chunkSize

    const chunkLogs = await publicClient.getLogs({
      ...params,
      fromBlock,
      toBlock: chunkToBlock,
    } as GetLogsParameters)

    logs.push(...chunkLogs)
  }

  return logs
}
