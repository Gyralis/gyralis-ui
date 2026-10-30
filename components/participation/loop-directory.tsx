"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  LoopCardsData,
  SoneiumLoopCardsData,
  type LoopCardData,
} from "@/data/loops-data"
import {
  LuArrowRight,
  LuExternalLink,
  LuLayers,
  LuShieldCheck,
} from "react-icons/lu"
import { useAccount } from "wagmi"

import { seasonMilestones } from "@/lib/participation/season-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"
import LoopCard from "@/components/loops/loop-card"

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

export function LoopOpportunityCard({
  loop,
  demoStatus,
}: {
  loop: LoopCardData
  demoStatus?: string
}) {
  const { state } = useSeason()
  const seasonLoop = state.loops.find((item) => item.id === loop.id)
  const nextBonus =
    seasonLoop &&
    seasonMilestones.find((m) => !seasonLoop.earned.includes(m.streak))
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
        {demoStatus && (
          <span
            className={`p-status ${
              demoStatus === "Ready to claim" ? "ready" : ""
            }`}
          >
            {demoStatus}
          </span>
        )}
        {!demoStatus && (
          <span className="p-status">{loop.super ? "SuperLoop" : "Loop"}</span>
        )}
      </Link>
      <div className="p-loop-card-body">
        <div className="p-loop-title">
          <Image src={loopLogo(loop)} alt="" width={32} height={32} />
          <div>
            <h3>{loop.title}</h3>
            <p>
              {loop.chainName} · {loop.by}
            </p>
          </div>
        </div>
        {seasonLoop && (
          <p className="s-loop-season-note">
            Season preview · {seasonLoop.streak}-day streak
            {nextBonus
              ? ` · +${nextBonus.points} at ${nextBonus.streak}`
              : " · all bonuses earned"}
          </p>
        )}
        <div className="p-loop-card-bottom">
          <span>
            {loop.chainId === 100
              ? "HNY"
              : loop.id === 6
              ? "USDC"
              : loop.rewardsSummary ?? "Rewards"}
          </span>
          <Link
            className="p-button secondary small"
            href={`/loops?loop=${loop.id}`}
          >
            View Loop <LuArrowRight />
          </Link>
        </div>
      </div>
    </article>
  )
}

function LoopDirectoryContent() {
  const { chainId } = useAccount()
  const router = useRouter()
  const params = useSearchParams()
  const search = useParticipationSearch().toLowerCase()
  const [filter, setFilter] = useState("All")
  const cards = chainId === 1868 ? SoneiumLoopCardsData : LoopCardsData
  const selectedId = params.get("loop")
  const selectedLoop = [...LoopCardsData, ...SoneiumLoopCardsData].find(
    (loop) => String(loop.id) === selectedId
  )
  const filtered = cards.filter(
    (loop) =>
      (!search ||
        `${loop.title} ${loop.by} ${loop.chainName} ${loop.description}`
          .toLowerCase()
          .includes(search)) &&
      (filter !== "SuperLoops" || loop.super) &&
      (filter !== "Standard Loops" || !loop.super) &&
      (filter !== "Active" || loop.enabled)
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
          <h2>Find your rhythm. Stay in the Loop.</h2>
          <p>Join a community, check eligibility, and return each period.</p>
        </div>
        <Link className="p-text-link" href="/eligibilities">
          Check eligibilities <LuArrowRight />
        </Link>
      </div>
      <div className="p-filter-row">
        <FilterTabs
          items={["All", "Active", "Standard Loops", "SuperLoops"]}
          value={filter}
          onChange={setFilter}
          label="Loop type"
        />
      </div>
      <div className="p-section-title">
        <h2>
          {filtered.length} {filtered.length === 1 ? "Loop" : "Loops"} to
          explore
        </h2>
      </div>
      {filtered.length ? (
        <MagicBento className="p-loop-grid directory">
          {filtered.map((loop) => (
            <LoopOpportunityCard key={loop.id} loop={loop} />
          ))}
        </MagicBento>
      ) : (
        <EmptyState
          title="No Loops found"
          description="Try another Loop type or search."
          onReset={() => {
            setFilter("All")
          }}
        />
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
