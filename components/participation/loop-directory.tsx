"use client"

import { Suspense, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { getLoopRewardExample } from "@/data/loop-reward-examples"
import {
  LoopCardsData,
  SoneiumLoopCardsData,
  type LoopCardData,
} from "@/data/loops-data"
import {
  LuArrowRight,
  LuCoins,
  LuExternalLink,
  LuHelpCircle,
  LuLayers,
  LuShieldCheck,
} from "react-icons/lu"
import { useAccount } from "wagmi"

import { seasonMilestones } from "@/lib/participation/season-preview"
import {
  formatTokenAmount,
  TOKEN_AMOUNT_FORMATS,
} from "@/lib/utils/token-amount"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import LoopCard from "@/components/loops/loop-card"

import { LoopClaimPanel } from "./loop-claim-panel"
import { LoopStreaks } from "./loop-streaks"
import { useParticipationSearch } from "./participation-shell"
import { EmptyState, FilterTabs, PageIntro } from "./participation-ui"
import { useSeason } from "./season-context"

export const loopArtwork = (loop: LoopCardData) =>
  loop.eligibilityProvider === "blockscout"
    ? "/discover/merits.png"
    : loop.gardensCommunity === "1hive"
    ? "/discover/gardens.png"
    : loop.eligibilityProvider === "rwagmi"
    ? "/rwagmi-cover.png"
    : "/images/img_2.png"
export const loopLogo = (loop: LoopCardData) =>
  loop.communityLogoUrl ?? loop.eligibilityLogoUrl ?? "/gyralis-logo.svg"

const chainIcons: Record<number, string> = {
  100: "/icons/NetworkGnosis.svg",
  8453: "/icons/NetworkBaseTest.svg",
  1868: "/icons/NetworkSoneium.webp",
}

export function LoopOpportunityCard({
  loop,
  demoStatus,
  compact = false,
  large = false,
}: {
  loop: LoopCardData
  demoStatus?: string
  compact?: boolean
  large?: boolean
}) {
  const { state } = useSeason()
  const seasonLoop = state.loops.find((item) => item.id === loop.id)
  const nextBonus =
    seasonLoop &&
    seasonMilestones.find((m) => !seasonLoop.earned.includes(m.streak))
  const rewardToken =
    loop.currency ??
    (loop.chainId === 100
      ? "HNY"
      : loop.eligibilityProvider === "rwagmi"
      ? "RWAGMI"
      : loop.id === 6
      ? "USDC"
      : "Rewards")
  const reward = getLoopRewardExample(loop)
  const checkedLabel = reward
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "America/Montevideo",
      }).format(new Date(reward.checkedAt))
    : null
  const rewardDescription = reward
    ? `Daily reward example per eligible wallet, based on contract period ${
        reward.period
      }, checked ${new Date(
        reward.checkedAt
      ).toUTCString()}. Rewards can change. ${reward.note ?? ""}`
    : "No current reward example is available."
  const rewardAmount = reward
    ? formatTokenAmount(reward.dailyAmount, {
        ...TOKEN_AMOUNT_FORMATS.dailyReward,
        symbol: reward.symbol,
      })
    : `— ${rewardToken}`

  if (compact || large) {
    return (
      <article
        className={`p-loop-card ${
          large ? "p-loop-card-large" : "p-loop-card-compact"
        } p-surface`}
        data-magic-bento-card=""
      >
        <Link
          href={`/loops?loop=${loop.id}`}
          className="p-mini-loop-link"
          aria-label={`View ${loop.title}`}
        >
          <div className="p-loop-art p-mini-loop-art">
            <Image
              src={loopArtwork(loop)}
              alt=""
              fill
              sizes="(max-width: 640px) 90vw, 320px"
              className={
                loopArtwork(loop).includes("images/") ? "is-orbit" : ""
              }
            />
          </div>
          <span className="p-mini-loop-logo">
            <Image src={loopLogo(loop)} alt="" width={36} height={36} />
          </span>
          <div className="p-mini-loop-body">
            <h3>{loop.title}</h3>
            {!large && (
              <div className="p-mini-loop-reward" title={rewardDescription}>
                <span>Daily example / wallet</span>
                <strong>{rewardAmount}</strong>
              </div>
            )}
          </div>
        </Link>
        {large && <LoopClaimPanel loop={loop} />}
        <LoopAccessHelp loop={loop} />
      </article>
    )
  }

  return (
    <article className="p-loop-card p-surface" data-magic-bento-card="">
      <Link
        href={`/loops?loop=${loop.id}`}
        className="p-loop-art"
        aria-label={`View ${loop.title}`}
      >
        <Image
          src={loopArtwork(loop)}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 320px"
          className={loopArtwork(loop).includes("images/") ? "is-orbit" : ""}
        />
        <div className="p-loop-art-heading">
          <span
            className="p-loop-kind"
            title={`${loop.chainName} · ${loop.super ? "SuperLoop" : "Loop"}`}
          >
            {chainIcons[loop.chainId] && (
              <Image
                src={chainIcons[loop.chainId]}
                alt={loop.chainName}
                width={14}
                height={14}
              />
            )}
            {loop.super ? "SuperLoop" : "Loop"}
          </span>
        </div>
        {demoStatus && (
          <span
            className={`p-status p-loop-preview-status ${
              demoStatus === "Ready to claim" ? "ready" : ""
            }`}
          >
            {demoStatus}
          </span>
        )}
      </Link>
      <div className="p-loop-card-body">
        <div className="p-loop-title">
          <Image src={loopLogo(loop)} alt="" width={40} height={40} />
          <div>
            <h3>{loop.title}</h3>
            <p>by {loop.by}</p>
          </div>
        </div>
        <p className="p-loop-eligibility">
          <LuShieldCheck aria-hidden="true" />
          <span>{loop.eligibility}</span>
        </p>
        {seasonLoop && (
          <p className="s-loop-season-note">
            Season preview · {seasonLoop.streak}-claim streak
            {nextBonus
              ? ` · +${nextBonus.points} SP at ${nextBonus.streak}`
              : " · all bonuses earned"}
          </p>
        )}
        <div className="p-loop-card-bottom">
          <span className="p-loop-reward" title={rewardDescription}>
            <span className="p-loop-reward-label">Daily example / wallet</span>
            <strong>
              <LuCoins aria-hidden="true" />
              {rewardAmount}
            </strong>
            <small>
              {reward
                ? `Example · ${checkedLabel ?? ""}`
                : "Example unavailable"}
            </small>
          </span>
          <Link
            className="p-button small p-loop-cta"
            href={`/loops?loop=${loop.id}`}
            aria-label={`View ${loop.title}`}
          >
            View Loop <LuArrowRight />
          </Link>
        </div>
      </div>
    </article>
  )
}

function LoopAccessHelp({ loop }: { loop: LoopCardData }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-mini-loop-help"
          aria-label={`How to access ${loop.title}`}
          title="How to access"
        >
          <LuHelpCircle aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="participation-theme dark p-loop-access-popover"
        aria-label={`How to access ${loop.title}`}
      >
        <p className="p-eyebrow">How to access</p>
        <h3>{loop.title}</h3>
        <p>{loop.eligibility}</p>
        {loop.passportMinScore > 0 && (
          <p>Human Passport score: {loop.passportMinScore}+.</p>
        )}
        <p>
          Connect your wallet on {loop.chainName}, then open the Loop to check
          your eligibility.
        </p>
        {loop.eligibilityUrl && (
          <a
            href={loop.eligibilityUrl}
            target="_blank"
            rel="noreferrer"
            className="p-text-link"
          >
            How to qualify <LuExternalLink aria-hidden="true" />
          </a>
        )}
        <Link
          href={`/loops?loop=${loop.id}`}
          className="p-button small p-loop-access-check"
        >
          Check eligibility <LuArrowRight aria-hidden="true" />
        </Link>
      </PopoverContent>
    </Popover>
  )
}

function LoopDirectoryContent() {
  const { chainId } = useAccount()
  const router = useRouter()
  const params = useSearchParams()
  const search = useParticipationSearch().toLowerCase()
  const tab = params.get("view") === "streaks" ? "Season streaks" : "Claim"
  const cards = chainId === 1868 ? SoneiumLoopCardsData : LoopCardsData
  const selectedId = params.get("loop")
  const selectedLoop = [...LoopCardsData, ...SoneiumLoopCardsData].find(
    (loop) => String(loop.id) === selectedId
  )
  const filtered = cards.filter(
    (loop) =>
      !search ||
      `${loop.title} ${loop.by} ${loop.chainName} ${loop.description}`
        .toLowerCase()
        .includes(search)
  )
  useEffect(() => {
    const id = window.location.hash.replace("#loop-card-", "")
    if (/^\d+$/.test(id) && !selectedId)
      router.replace(`/loops?loop=${id}`, { scroll: false })
  }, [router, selectedId])
  function closeLoop() {
    const next = new URLSearchParams(params.toString())
    next.delete("loop")
    router.replace(`/loops${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    })
  }
  return (
    <>
      <PageIntro
        title="Loops"
        description="Recurring participation opportunities across the Gyralis ecosystem."
      />
      <div className="p-directory-intro p-surface">
        <LuLayers />
        <div>
          <h2>Make participation a habit.</h2>
          <p>
            Your daily routine starts here. Be eligible and stay in the Loop.
          </p>
        </div>
        <Link className="p-text-link" href="/eligibilities">
          Check eligibilities <LuArrowRight />
        </Link>
      </div>
      <FilterTabs
        items={["Claim", "Season streaks"]}
        value={tab}
        onChange={(value) => {
          const next = new URLSearchParams(params.toString())
          next.delete("loop")
          if (value === "Season streaks") next.set("view", "streaks")
          else next.delete("view")
          router.replace(`/loops${next.size ? `?${next.toString()}` : ""}`, {
            scroll: false,
          })
        }}
        label="Loop sections"
      />
      {tab === "Season streaks" ? (
        <LoopStreaks />
      ) : (
        <>
          <div className="p-section-title">
            <h2>
              {filtered.length} Active{" "}
              {filtered.length === 1 ? "Loop" : "Loops"} · Claim every day
            </h2>
          </div>
          {filtered.length ? (
            <MagicBento className="p-loop-grid directory">
              {filtered.map((loop) => (
                <LoopOpportunityCard key={loop.id} loop={loop} large />
              ))}
            </MagicBento>
          ) : (
            <EmptyState
              title="No Loops found"
              description="Try another search."
            />
          )}
        </>
      )}

      <Dialog
        open={Boolean(selectedLoop)}
        onOpenChange={(open) => {
          if (!open) closeLoop()
        }}
      >
        <DialogContent className="participation-theme participation-dialog p-live-loop-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">
              <LuShieldCheck /> Live Loop
            </p>
            <DialogTitle>{selectedLoop?.title}</DialogTitle>
            <DialogDescription>
              Eligibility, amounts, registration, and claims come from the
              existing live Loop experience.
            </DialogDescription>
          </DialogHeader>
          {selectedLoop && (
            <LoopCard loop={selectedLoop} onBalanceUpdate={() => {}} />
          )}
          {selectedLoop?.address && (
            <a
              className="p-text-link"
              href={`${
                selectedLoop.chainId === 100
                  ? "https://gnosisscan.io"
                  : selectedLoop.chainId === 1868
                  ? "https://soneium.blockscout.com"
                  : "https://basescan.org"
              }/address/${selectedLoop.address}`}
              target="_blank"
              rel="noreferrer"
            >
              View contract <LuExternalLink />
            </a>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function LoopDirectory() {
  return (
    <Suspense fallback={<p className="p-muted">Loading Loops…</p>}>
      <LoopDirectoryContent />
    </Suspense>
  )
}
