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
              {loop.chainName}
              {demoStatus ? " · Demo status" : ` · ${loop.by}`}
            </p>
          </div>
        </div>
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
  const [network, setNetwork] = useState("All networks")
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
      (filter !== "Active" || loop.enabled) &&
      (network === "All networks" || loop.chainName === network)
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
        <label className="p-select">
          <span className="sr-only">Filter by network</span>
          <select
            value={network}
            onChange={(event) => setNetwork(event.target.value)}
          >
            {[
              "All networks",
              ...Array.from(new Set(cards.map((loop) => loop.chainName))),
            ].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="p-section-title">
        <h2>
          {filtered.length} {filtered.length === 1 ? "Loop" : "Loops"} to
          explore
        </h2>
        <span className="p-caption">Live Loop directory</span>
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
          description="Try another network, Loop type, or search."
          onReset={() => {
            setFilter("All")
            setNetwork("All networks")
          }}
        />
      )}
      <section className="p-how-it-works">
        <h2>Every claim is a reason to return.</h2>
        <div>
          {[
            {
              title: "Join",
              text: "Meet the community’s eligibility requirements.",
            },
            {
              title: "Claim",
              text: "Open a Loop to see its live claim or registration state.",
            },
            {
              title: "Return",
              text: "Participate again next period and build your streak.",
            },
          ].map(({ title, text }, i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
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
