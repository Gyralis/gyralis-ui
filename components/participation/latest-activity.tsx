"use client"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { LuCheck, LuRefreshCw } from "react-icons/lu"
import { isAddress } from "viem"
import { useAccount } from "wagmi"

import { latestActivityQueryOptions } from "@/lib/activity/latest-activity-query"
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"

export function LatestActivity() {
  const { address } = useAccount()
  const pathname = usePathname()
  const profileAddress = pathname.match(
    /^\/profile\/(0x[a-fA-F0-9]{40})\/?$/
  )?.[1]
  const wallet = (
    profileAddress && isAddress(profileAddress, { strict: false })
      ? profileAddress
      : address
  )?.toLowerCase()
  const activity = useQuery(latestActivityQueryOptions(wallet))
  // Personal activity belongs to a connected wallet or an explicitly viewed profile.
  if (!wallet) return null
  return (
    <section
      className="p-rail-activity p-latest-activity"
      aria-labelledby="latest-activity-title"
      aria-busy={activity.isFetching}
    >
      <div className="p-section-title">
        <h2 id="latest-activity-title">Latest Claims</h2>
        {wallet && (
          <button
            type="button"
            className="p-icon-button"
            aria-label="Refresh latest claims"
            title="Refresh claims"
            disabled={activity.isFetching}
            onClick={() => void activity.refetch()}
          >
            <LuRefreshCw aria-hidden="true" />
          </button>
        )}
      </div>
      <>
        {activity.data?.indexingStatus && (
          <p className="p-activity-message" role="status">
            {activity.data.indexingStatus === "syncing"
              ? "Claim confirmed. Updating history…"
              : "Your claim is confirmed. History update delayed; refresh to check again."}
          </p>
        )}
        {activity.isPending && (
          <p className="p-activity-message" role="status">
            Loading your claims…
          </p>
        )}
        {activity.isError && (
          <p className="p-activity-warning" role="status">
            Couldn’t refresh claims.{" "}
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
                          <strong title={item.loopName}>{item.loopName}</strong>
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
                        </span>
                        <span
                          className="p-activity-amount"
                          title={`${item.amount} ${item.tokenSymbol}`}
                        >
                          +
                          {formatTokenAmount(item.amount, {
                            ...TOKEN_AMOUNT_FORMATS.claim,
                          })}{" "}
                          {item.tokenSymbol}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </>
    </section>
  )
}
