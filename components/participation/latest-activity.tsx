"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { useQuery } from "@tanstack/react-query"
import { LuArrowUpRight, LuCheck, LuRefreshCw, LuWallet } from "react-icons/lu"
import { isAddress } from "viem"
import { useAccount } from "wagmi"

import type { LatestActivityData } from "@/lib/activity/types"

function formatAmount(amount: string) {
  const value = Number(amount)
  if (value > 0 && value < 0.000001) return "<0.000001"
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(
    value
  )
}

export function LatestActivity() {
  const { address } = useAccount()
  const pathname = usePathname()
  const { openConnectModal } = useConnectModal()
  const profileAddress = pathname.match(
    /^\/profile\/(0x[a-fA-F0-9]{40})\/?$/
  )?.[1]
  const wallet = (
    profileAddress && isAddress(profileAddress, { strict: false })
      ? profileAddress
      : address
  )?.toLowerCase()
  const activity = useQuery({
    queryKey: ["latest-activity", wallet],
    enabled: Boolean(wallet),
    queryFn: async ({ signal }): Promise<LatestActivityData> => {
      if (!wallet) throw new Error("Connect a wallet to load activity")
      const response = await fetch(`/api/users/${wallet}/activity`, {
        signal,
        cache: "no-store",
      })
      if (!response.ok) throw new Error("Unable to load activity")
      return response.json() as Promise<LatestActivityData>
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
  })
  return (
    <section
      className="p-rail-activity p-latest-activity"
      aria-labelledby="latest-activity-title"
      aria-busy={activity.isFetching}
    >
      <div className="p-section-title">
        <h2 id="latest-activity-title">Latest activity</h2>
        {wallet && (
          <button
            type="button"
            className="p-icon-button"
            aria-label="Refresh latest activity"
            title="Refresh activity"
            disabled={activity.isFetching}
            onClick={() => void activity.refetch()}
          >
            <LuRefreshCw aria-hidden="true" />
          </button>
        )}
      </div>
      {!wallet ? (
        <div className="p-activity-message">
          <LuWallet aria-hidden="true" />
          <p>Connect your wallet to see your latest claims.</p>
          <button
            type="button"
            className="p-button secondary small"
            onClick={openConnectModal}
          >
            Connect wallet
          </button>
        </div>
      ) : (
        <>
          <p className="p-caption">
            {wallet.slice(0, 6)}…{wallet.slice(-4)} · Current period, or
            previous if unclaimed.
          </p>
          {activity.isPending && (
            <p className="p-activity-message" role="status">
              Loading your claims…
            </p>
          )}
          {activity.isError && (
            <p className="p-activity-warning" role="status">
              Couldn’t refresh activity.{" "}
              {activity.data ? "Showing the last update." : "Try refreshing."}
            </p>
          )}
          {activity.data && (
            <>
              {activity.data.unavailableChains.length > 0 && (
                <p className="p-activity-warning" role="status">
                  {activity.data.unavailableChains.join(" and ")} activity is
                  temporarily unavailable.
                </p>
              )}
              {activity.data.items.length === 0 ? (
                <p className="p-activity-message">
                  {activity.data.unavailableChains.length
                    ? "No recent claims found on the available chain."
                    : "No claims in the current or previous period. Your next claim will appear here."}
                </p>
              ) : (
                <>
                  <div className="p-activity-totals">
                    <span>Claimed in shown periods</span>
                    {activity.data.totals.map((total) => (
                      <strong key={`${total.chainId}:${total.tokenSymbol}`}>
                        {formatAmount(total.amount)}{" "}
                        <span>{total.tokenSymbol}</span>
                      </strong>
                    ))}
                  </div>
                  <ul className="p-activity-list">
                    {activity.data.items.map((item) => (
                      <li key={item.id}>
                        <a
                          className="p-latest-activity-row"
                          href={item.transactionUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${item.loopName}: claimed ${item.amount} ${item.tokenSymbol}, period ${item.period}. View transaction`}
                        >
                          <span className="p-activity-logo">
                            <Image
                              src={item.logoSrc}
                              alt=""
                              width={28}
                              height={28}
                            />
                            <LuCheck aria-hidden="true" />
                          </span>
                          <span className="p-activity-details">
                            <strong>{item.loopName}</strong>
                            <span>
                              {item.chainName} · Period {item.period}{" "}
                              <em>
                                {item.periodKind === "current"
                                  ? "Current"
                                  : "Previous"}
                              </em>
                            </span>
                            <time
                              dateTime={new Date(
                                item.timestamp * 1000
                              ).toISOString()}
                            >
                              {new Date(item.timestamp * 1000).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </time>
                            <b>
                              +{formatAmount(item.amount)} {item.tokenSymbol}
                            </b>
                          </span>
                          <LuArrowUpRight
                            className="p-activity-external"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="p-caption p-activity-footer">
                Gnosis & Base · Updated{" "}
                <time dateTime={activity.data.fetchedAt}>
                  {new Date(activity.data.fetchedAt).toLocaleTimeString(
                    undefined,
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </time>
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}
