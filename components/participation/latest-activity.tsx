"use client"

import type { CSSProperties } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { LuCheck, LuRefreshCw } from "react-icons/lu"
import { isAddress } from "viem"
import { useAccount } from "wagmi"

import { visibleActivityItems } from "@/lib/activity/activity-data"
import { latestActivityQueryOptions } from "@/lib/activity/latest-activity-query"
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"
import { InfoNotice } from "@/components/ui/info-notice"

import { useCardMotion } from "./card-motion-preview"

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
  const motion = useCardMotion()
  const items = visibleActivityItems(activity.data?.items ?? [])
  // Personal activity belongs to a connected wallet or an explicitly viewed profile.
  if (!wallet) return null
  return (
    <section
      className="p-rail-activity p-latest-activity"
      aria-labelledby="latest-activity-title"
      aria-busy={activity.isPending}
      data-claim-motion={
        motion.mode !== "off" && !motion.reducedMotion ? "" : undefined
      }
    >
      <div className="p-section-title">
        <h2 id="latest-activity-title">Latest Activity</h2>
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
      <>
        {activity.isPending && (
          <p className="p-activity-message" role="status">
            Loading your activity…
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
            {items.length === 0 ? (
              <InfoNotice>
                {activity.data.unavailableChains.length
                  ? "No recent activity found on the available chain."
                  : "No recent activity. Your registrations and claims will appear here."}
              </InfoNotice>
            ) : (
              <>
                <ul className="p-activity-list">
                  {items.map((item, index) => (
                    <li
                      key={item.id}
                      style={
                        {
                          "--activity-delay": `${Math.min(index, 6) * 45}ms`,
                        } as CSSProperties
                      }
                      className={
                        item.source === "receipt"
                          ? "p-activity-new-claim"
                          : undefined
                      }
                    >
                      {item.source === "receipt" && (
                        <span className="sr-only" role="status">
                          {item.kind === "registration" ? (
                            `Registration confirmed for ${item.loopName}.`
                          ) : (
                            <>
                              Claim confirmed for {item.loopName}.{" "}
                              {formatTokenAmount(
                                item.amount,
                                TOKEN_AMOUNT_FORMATS.claim
                              )}{" "}
                              {item.tokenSymbol} received.
                            </>
                          )}
                        </span>
                      )}
                      <a
                        className="p-latest-activity-row"
                        href={item.transactionUrl}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={
                          item.kind === "registration"
                            ? `${item.loopName}: registered. View transaction`
                            : `${item.loopName}: claimed ${item.amount} ${item.tokenSymbol}. View transaction`
                        }
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
                        {item.kind === "registration" ? (
                          <span className="p-activity-badge p-activity-registration">
                            <span className="p-activity-badge-text">
                              Registered
                            </span>
                          </span>
                        ) : (
                          <span
                            className="p-activity-badge p-activity-amount"
                            title={`${item.amount} ${item.tokenSymbol}`}
                          >
                            <span className="p-activity-badge-text">
                              Claimed:{" "}
                              {formatTokenAmount(item.amount, {
                                ...TOKEN_AMOUNT_FORMATS.claim,
                              })}{" "}
                              {item.tokenSymbol}
                            </span>
                          </span>
                        )}
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
