import { focusManager, QueryClient, QueryObserver } from "@tanstack/react-query"
import { encodeAbiParameters, encodeEventTopics, parseAbiItem } from "viem"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { LoopActionConfirmation } from "@/lib/loops/loop-action-confirmation"

import { mergeActivitySnapshot } from "./activity-data"
import { confirmedClaimActivity } from "./confirmed-claims"
import { confirmedRegistrationActivity } from "./confirmed-registrations"
import {
  fetchLatestActivity,
  latestActivityKey,
  latestActivityQueryOptions,
  refreshLatestActivityAfterAction,
  refreshLatestActivityAfterClaim,
} from "./latest-activity-query"
import { parseActivityScope } from "./scope"
import type {
  ActivityItem,
  ClaimActivityItem,
  LatestActivityData,
} from "./types"

const wallet = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
const otherWallet = "0x1111111111111111111111111111111111111111"
const hive = "0x8995641fb3e452bc1359e79a738a6de556015696"
const blockscout = "0xab25dbafd11b1eb606b2455eecec67e6746e409b"
const rwagmi = "0xe714bc7f58726490a15d2197bcded598223f5319"
const event = parseAbiItem(
  "event Claim(address indexed claimer,uint256 periodNumber,uint256 payout)"
)

function receipt(
  address = hive,
  digit = "a",
  claimer = wallet
): LoopActionConfirmation {
  return {
    action: "claim",
    chainId: address === rwagmi ? 8453 : 100,
    transactionHash: `0x${digit.repeat(64)}`,
    blockNumber: 200n,
    logs: [
      {
        address,
        logIndex: 3,
        topics: encodeEventTopics({
          abi: [event],
          eventName: "Claim",
          args: { claimer: claimer as `0x${string}` },
        }) as `0x${string}`[],
        data: encodeAbiParameters(
          [{ type: "uint256" }, { type: "uint256" }],
          [11n, 1_000_000_000_000_000_000n]
        ),
      },
    ],
  }
}

function registrationReceipt(withClaim = false): LoopActionConfirmation {
  const claim = receipt()
  const registerEvent = parseAbiItem(
    "event Register(address indexed sender,uint256 indexed periodNumber)"
  )
  return {
    ...claim,
    action: withClaim ? "claim" : "enter",
    logs: [
      ...(withClaim ? claim.logs! : []),
      {
        address: hive,
        logIndex: 4,
        topics: encodeEventTopics({
          abi: [registerEvent],
          eventName: "Register",
          args: { sender: wallet as `0x${string}`, periodNumber: 12n },
        }) as `0x${string}`[],
        data: "0x",
      },
    ],
  }
}

function indexed(confirmation = receipt()): ClaimActivityItem {
  return {
    ...confirmedClaimActivity(confirmation)[0].item,
    source: "indexed",
    timestamp: 123,
  }
}

function snapshot(items: ActivityItem[] = [], block = 100): LatestActivityData {
  return {
    address: wallet,
    items,
    totals: [],
    unavailableChains: [],
    fetchedAt: new Date().toISOString(),
    fullSnapshot: true,
    coverage: [hive, blockscout, rwagmi].map((loopAddress) => ({
      chainId: loopAddress === rwagmi ? 8453 : 100,
      loopAddress,
      currentPeriod: "11",
      indexedBlock: block,
    })),
  }
}

let client: QueryClient
beforeEach(() => {
  vi.useFakeTimers()
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryDefaults(
    latestActivityKey(wallet),
    latestActivityQueryOptions(wallet)
  )
})
afterEach(() => {
  client.clear()
  client.unmount()
  focusManager.setFocused(undefined)
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("event-driven latest activity", () => {
  it.each([false, true])(
    "reconciles registration receipts withClaim=%s without losing claim rows",
    async (withClaim) => {
      const confirmation = registrationReceipt(withClaim)
      const registered = confirmedRegistrationActivity(confirmation)[0].item
      const indexedItems: ActivityItem[] = [
        { ...registered, source: "indexed" },
        ...(withClaim
          ? [{ ...indexed(confirmation), kind: "claim" as const }]
          : []),
      ]
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(Response.json(snapshot(indexedItems, 200)))
      )
      const work = refreshLatestActivityAfterAction(client, confirmation)
      const immediate = client.getQueryData<LatestActivityData>(
        latestActivityKey(wallet)
      )!
      expect(
        immediate.items.find((item) => item.kind === "registration")
      ).toMatchObject({ period: "12", source: "receipt" })
      expect(immediate.items).toHaveLength(withClaim ? 2 : 1)
      expect(immediate.totals).toHaveLength(withClaim ? 1 : 0)
      await vi.advanceTimersByTimeAsync(250)
      await work
      expect(fetch).toHaveBeenCalledTimes(1)
      const url = new URL(
        vi.mocked(fetch).mock.calls[0][0] as string,
        "https://app.test"
      )
      const scope = parseActivityScope(url.searchParams.get("scope"))!
      expect(scope.map((entry) => entry.period)).toEqual(
        withClaim ? ["11", "12"] : ["12"]
      )
      const result = client.getQueryData<LatestActivityData>(
        latestActivityKey(wallet)
      )!
      expect(result.items).toHaveLength(withClaim ? 2 : 1)
      expect(result.items.every((item) => item.source === "indexed")).toBe(true)
      expect(result.indexingStatus).toBeUndefined()
      await vi.advanceTimersByTimeAsync(120_000)
      expect(fetch).toHaveBeenCalledTimes(1)
    }
  )

  it("decodes the token-indexed registration version and ignores unrelated contracts", () => {
    const event = parseAbiItem(
      "event Register(address indexed sender,address indexed token,uint256 indexed periodNumber)"
    )
    const confirmation: LoopActionConfirmation = {
      ...registrationReceipt(),
      chainId: 8453,
      logs: [
        {
          address: rwagmi,
          logIndex: 2,
          data: "0x",
          topics: encodeEventTopics({
            abi: [event],
            eventName: "Register",
            args: { sender: wallet, token: otherWallet, periodNumber: 22n },
          }) as `0x${string}`[],
        },
      ],
    }
    expect(confirmedRegistrationActivity(confirmation)).toMatchObject([
      {
        wallet,
        item: {
          kind: "registration",
          period: "22",
          loopAddress: rwagmi,
          chainId: 8453,
        },
      },
    ])
    expect(
      confirmedRegistrationActivity({
        ...confirmation,
        logs: [{ ...confirmation.logs![0], address: otherWallet }],
      })
    ).toEqual([])
  })

  it("adds a receipt immediately, fetches its scope once and stops after indexing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(snapshot([indexed()], 200)))
    )
    const work = refreshLatestActivityAfterClaim(client, receipt())
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
        ?.items[0]
    ).toMatchObject({ amount: "1", period: "11", source: "receipt" })
    expect(fetch).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(250)
    await work
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(
      new URL(
        vi.mocked(fetch).mock.calls[0][0] as string,
        "https://app.test"
      ).searchParams.get("scope")
    ).toBe(`100:${hive}:11`)
    const data = client.getQueryData<LatestActivityData>(
      latestActivityKey(wallet)
    )!
    expect(data.items).toHaveLength(1)
    expect(data.items[0].source).toBe("indexed")
    expect(data.indexingStatus).toBeUndefined()
    await vi.advanceTimersByTimeAsync(120_000)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("combines simultaneous Loop claims into one wallet request", async () => {
    const second = receipt(blockscout, "b")
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(snapshot([indexed(), indexed(second)], 200))
        )
    )
    const firstWork = refreshLatestActivityAfterClaim(client, receipt())
    const secondWork = refreshLatestActivityAfterClaim(client, second)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))?.items
    ).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(250)
    await Promise.all([firstWork, secondWork])
    expect(fetch).toHaveBeenCalledTimes(1)
    const scope = new URL(
      vi.mocked(fetch).mock.calls[0][0] as string,
      "https://app.test"
    ).searchParams.get("scope")
    expect(scope).toContain(hive)
    expect(scope).toContain(blockscout)
  })

  it("reuses a full wallet refresh already in flight", async () => {
    let complete!: (response: Response) => void
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            complete = resolve
          })
      )
    )
    const full = client.fetchQuery(latestActivityQueryOptions(wallet))
    const work = refreshLatestActivityAfterClaim(client, receipt())
    await vi.advanceTimersByTimeAsync(250)
    expect(fetch).toHaveBeenCalledTimes(1)
    complete(Response.json(snapshot([indexed()], 200)))
    await full
    await work
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
        ?.items[0].source
    ).toBe("indexed")
  })

  it("retains confirmed data through stale responses and stops after five failed attempts", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")))
    const work = refreshLatestActivityAfterClaim(client, receipt())
    // A full request started before the claim may finish after it.
    client.setQueryData(latestActivityKey(wallet), snapshot([], 100))
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
        ?.items[0].source
    ).toBe("receipt")
    await vi.advanceTimersByTimeAsync(31_000)
    await work
    expect(fetch).toHaveBeenCalledTimes(5)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
    ).toMatchObject({
      indexingStatus: "delayed",
      items: [{ source: "receipt" }],
    })
    await vi.advanceTimersByTimeAsync(120_000)
    expect(fetch).toHaveBeenCalledTimes(5)
  })

  it("keeps retrying a healthy but lagging subgraph until the actual event appears", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json(snapshot([], 200)))
        .mockResolvedValueOnce(Response.json(snapshot([indexed()], 201)))
    )
    const work = refreshLatestActivityAfterClaim(client, receipt())
    await vi.advanceTimersByTimeAsync(250)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
        ?.items[0].source
    ).toBe("receipt")
    await vi.advanceTimersByTimeAsync(2_000)
    await work
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))?.items
    ).toHaveLength(1)
  })

  it("stores the receipt under its actual claimer rather than another connected wallet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          ...snapshot([indexed(receipt(hive, "c", otherWallet))], 200),
          address: otherWallet,
        })
      )
    )
    const work = refreshLatestActivityAfterClaim(
      client,
      receipt(hive, "c", otherWallet)
    )
    expect(client.getQueryData(latestActivityKey(wallet))).toBeUndefined()
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(otherWallet))
        ?.items
    ).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(250)
    await work
  })

  it("does not invent registrations from entries without registration logs", async () => {
    vi.stubGlobal("fetch", vi.fn())
    await refreshLatestActivityAfterClaim(client, {
      ...receipt(),
      action: "enter",
    })
    await refreshLatestActivityAfterClaim(client, {
      ...receipt(),
      logs: [{ ...receipt().logs![0], address: otherWallet }],
    })
    expect(client.getQueryData(latestActivityKey(wallet))).toBeUndefined()
    await vi.advanceTimersByTimeAsync(120_000)
    expect(fetch).not.toHaveBeenCalled()
  })

  it("still loads the full wallet history when opening after a hidden-rail scoped refresh", async () => {
    const partial = {
      ...snapshot([indexed()], 200),
      fullSnapshot: false,
      coverage: [snapshot([], 200).coverage![0]],
    }
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation((url: string) =>
          Promise.resolve(
            Response.json(
              url.includes("?scope=")
                ? partial
                : snapshot([indexed(), indexed(receipt(rwagmi))], 200)
            )
          )
        )
    )
    const work = refreshLatestActivityAfterClaim(client, receipt())
    await vi.advanceTimersByTimeAsync(250)
    await work
    expect(fetch).toHaveBeenCalledTimes(1)
    const observer = new QueryObserver(
      client,
      latestActivityQueryOptions(wallet)
    )
    const unsubscribe = observer.subscribe(() => {})
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))
        ?.fullSnapshot
    ).toBe(true)
    expect(
      client.getQueryData<LatestActivityData>(latestActivityKey(wallet))?.items
    ).toHaveLength(2)
    unsubscribe()
  })

  it("does not poll while idle and refreshes stale activity on focus", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(() => Promise.resolve(Response.json(snapshot())))
    )
    client.mount()
    const observer = new QueryObserver(
      client,
      latestActivityQueryOptions(wallet)
    )
    const unsubscribe = observer.subscribe(() => {})
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(180_000)
    expect(fetch).toHaveBeenCalledTimes(1)
    focusManager.setFocused(false)
    focusManager.setFocused(true)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetch).toHaveBeenCalledTimes(2)
    unsubscribe()
  })
})

describe("activity snapshot merging", () => {
  it("decodes the token-indexed receipt used by SuperLoops without guessing its period", () => {
    const tokenEvent = parseAbiItem(
      "event Claim(address indexed claimer,address indexed token,uint256 indexed periodNumber,uint256 payout)"
    )
    const confirmation = receipt(rwagmi)
    confirmation.logs = [
      {
        address: rwagmi,
        logIndex: 4,
        topics: encodeEventTopics({
          abi: [tokenEvent],
          eventName: "Claim",
          args: { claimer: wallet, token: otherWallet, periodNumber: 64n },
        }) as `0x${string}`[],
        data: encodeAbiParameters([{ type: "uint256" }], [1_250_000n]),
      },
    ]
    const [claim] = confirmedClaimActivity(confirmation, 6)
    expect(claim.wallet).toBe(wallet)
    expect(claim.item).toMatchObject({
      period: "64",
      amount: "1.25",
      logIndex: 4,
      source: "receipt",
    })
  })

  it("preserves other Loops and failed chains when a scoped snapshot arrives", () => {
    const baseClaim = indexed(receipt(rwagmi))
    const previous = snapshot([indexed(), baseClaim], 200)
    const incoming = {
      ...snapshot([], 201),
      coverage: [
        {
          chainId: 100,
          loopAddress: blockscout,
          currentPeriod: "11",
          indexedBlock: 201,
        },
      ],
      unavailableChains: ["Base"],
    }
    const merged = mergeActivitySnapshot(previous, incoming)
    expect(merged.items).toHaveLength(2)
    expect(merged.items).toContainEqual(baseClaim)
    expect(merged.unavailableChains).toEqual(["Base"])
  })

  it("does not regress to an older indexed block or duplicate receipt notifications", () => {
    const previous = snapshot([indexed()], 201)
    const older = mergeActivitySnapshot(previous, snapshot([], 100))
    expect(older.items).toHaveLength(1)
    const duplicate = mergeActivitySnapshot(previous, {
      ...snapshot([confirmedClaimActivity(receipt())[0].item]),
      coverage: [],
    })
    expect(duplicate.items).toHaveLength(1)
    expect(duplicate.items[0].source).toBe("indexed")
  })

  it("requires the indexed watermark to cover the receipt before acknowledging its event", () => {
    const previous = {
      ...snapshot([confirmedClaimActivity(receipt())[0].item]),
      coverage: [],
    }
    const merged = mergeActivitySnapshot(previous, snapshot([indexed()], 199))
    expect(merged.items[0].source).toBe("receipt")
  })

  it("does not reset full-history freshness when a receipt changes the cache", () => {
    const previous = mergeActivitySnapshot(undefined, snapshot())
    const originalTime = Date.parse(previous.fetchedAt)
    const next = mergeActivitySnapshot(previous, {
      ...snapshot([confirmedClaimActivity(receipt())[0].item]),
      fullSnapshot: false,
      coverage: [],
      fetchedAt: new Date(originalTime + 20_000).toISOString(),
    })
    const staleTime = latestActivityQueryOptions(wallet).staleTime({
      state: { data: next, dataUpdatedAt: originalTime + 20_000 },
    })
    expect(staleTime).toBe(10_000)
    expect(next.fullFetchedAt).toBe(previous.fetchedAt)
    // QueryClient can merge an already-composed cache update again.
    expect(mergeActivitySnapshot(previous, next).fullFetchedAt).toBe(
      previous.fetchedAt
    )
  })

  it("shows the new current-period receipt instead of the previous-period row", () => {
    const previous = snapshot([
      {
        ...indexed(),
        id: "old",
        transactionHash: `0x${"d".repeat(64)}`,
        period: "10",
      },
    ])
    const merged = mergeActivitySnapshot(previous, {
      ...snapshot([confirmedClaimActivity(receipt())[0].item]),
      coverage: [],
    })
    expect(merged.items).toHaveLength(1)
    expect(merged.items[0].period).toBe("11")
    expect(merged.totals[0].amount).toBe("1")
  })

  it("expires an old receipt after its period leaves the displayed window", () => {
    const old = snapshot([confirmedClaimActivity(receipt())[0].item])
    const incoming = snapshot([], 300)
    incoming.coverage![0].currentPeriod = "13"
    expect(mergeActivitySnapshot(old, incoming).items).toHaveLength(0)
  })

  it("validates the response wallet and rejects unsupported scopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ ...snapshot(), address: otherWallet })
        )
    )
    await expect(fetchLatestActivity(wallet)).rejects.toThrow("wallet mismatch")
    expect(parseActivityScope(`100:${hive},100:${hive}`)).toHaveLength(1)
    expect(() => parseActivityScope(`100:${otherWallet}`)).toThrow(
      "Invalid activity scope"
    )
    expect(() => parseActivityScope("")).toThrow("Invalid activity scope")
  })
})
