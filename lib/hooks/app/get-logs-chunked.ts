import type { GetLogsParameters, Log, PublicClient } from "viem"

const DEFAULT_LOG_CHUNK_SIZE = 9_999n

type ChunkedGetLogsParams = Omit<GetLogsParameters, "event" | "args"> & {
  args?: unknown
  event?: unknown
  fromBlock: bigint
  toBlock: bigint | "latest"
}

export async function getLogsChunked(
  publicClient: PublicClient,
  params: ChunkedGetLogsParams,
  chunkSize = DEFAULT_LOG_CHUNK_SIZE
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
