"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardsData } from "@/data/loops-data"
import { LuArrowRight, LuCompass } from "react-icons/lu"

import {
  seasonGameProgress,
  seasonGames,
} from "@/lib/participation/season-games"
import MagicBento from "@/components/ui/magic-bento"

import { LoopOpportunityCard } from "./loop-directory"
import { useParticipationSearch } from "./participation-shell"
import {
  EmptyState,
  FilterTabs,
  ProgressBar,
  SectionTitle,
} from "./participation-ui"
import { useSeason } from "./season-context"
import { SeasonPreview } from "./season-preview"

const ecosystems = [
  {
    name: "Gnosis",
    image: "/icons/NetworkGnosis.svg",
    type: "Network",
    match: "Gnosis",
  },
  {
    name: "Base",
    image: "/icons/NetworkBaseTest.svg",
    type: "Network",
    match: "Base",
  },
  {
    name: "1Hive",
    image: "/1Hive-logo.png",
    type: "Community",
    match: "1Hive",
  },
  {
    name: "Blockscout",
    image: "/blockscout-logo.png",
    type: "Protocol",
    match: "Blockscout",
  },
  {
    name: "Superfluid",
    image: "/superfluid-logo.png",
    type: "Protocol",
    match: "True Loopers",
  },
]

function DiscoverContent() {
  const { state } = useSeason()
  const [tab, setTab] = useState("For You")
  const [ecosystem, setEcosystem] = useState<string | null>(null)
  const inputSearch = useParticipationSearch()
  const search = inputSearch.trim().toLowerCase()
  useEffect(() => {
    if (search) setEcosystem(null)
  }, [search])
  const matches = (text: string) =>
    !search || text.toLowerCase().includes(search)
  const loops = LoopCardsData.filter(
    (loop) =>
      matches(
        `${loop.title} ${loop.by} ${loop.chainName} ${loop.description}`
      ) &&
      (!ecosystem ||
        `${loop.title} ${loop.by} ${loop.chainName}`.includes(ecosystem))
  )
  const activeLoops = [...loops].sort(
    (a, b) => [3, 4, 6, 9].indexOf(a.id) - [3, 4, 6, 9].indexOf(b.id)
  )
  const displayedLoops =
    tab === "New" ? activeLoops.filter((loop) => loop.id === 9) : activeLoops
  const games = seasonGames.filter((game) =>
    matches(`${game.title} ${game.type} ${game.description}`)
  )
  const eco = ecosystems.filter((item) => matches(`${item.name} ${item.type}`))
  const showForYou = tab === "For You" && !search && !ecosystem
  const showLoops = ["For You", "Loops", "New"].includes(tab)
  const showGames = ["For You", "Games", "New", "Ending Soon"].includes(tab)
  const showEcosystems = ["For You", "Ecosystems"].includes(tab) && !ecosystem
  const noResults =
    !(showLoops && displayedLoops.length) &&
    !(showGames && games.length) &&
    !(showEcosystems && eco.length)
  return (
    <>
      <SeasonPreview pageHeader />
      <FilterTabs
        items={[
          "For You",
          "New",
          "Loops",
          "Games",
          "Ecosystems",
          "Ending Soon",
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value)
          setEcosystem(null)
        }}
        label="Discover categories"
      />
      {search && <p className="p-muted">Search results for “{inputSearch}”</p>}
      {ecosystem && (
        <div className="p-section-title">
          <h2>
            {ecosystems.find((item) => item.match === ecosystem)?.name}{" "}
            opportunities
          </h2>
          <button className="p-text-link" onClick={() => setEcosystem(null)}>
            All ecosystems <LuArrowRight />
          </button>
        </div>
      )}
      {showLoops && displayedLoops.length > 0 && (
        <section>
          <SectionTitle
            title={
              showForYou
                ? "Your active Loops"
                : tab === "New"
                ? "Recently added Loops"
                : "Explore Loops"
            }
            href="/loops"
          />
          <MagicBento className="p-loop-grid">
            {(showForYou ? displayedLoops.slice(0, 3) : displayedLoops).map(
              (loop) => (
                <LoopOpportunityCard
                  key={loop.id}
                  loop={loop}
                  demoStatus={
                    showForYou
                      ? state.loops.find((item) => item.id === loop.id)
                          ?.claimedToday
                        ? "Claimed in Season preview"
                        : "View live claim state"
                      : undefined
                  }
                />
              )
            )}
          </MagicBento>
        </section>
      )}
      {showEcosystems && eco.length > 0 && (
        <section>
          <SectionTitle title="Explore ecosystems" />
          <MagicBento className="p-ecosystem-grid">
            {eco.map((item) => (
              <button
                type="button"
                key={item.name}
                className="p-ecosystem p-surface"
                data-magic-bento-card=""
                onClick={() => {
                  setEcosystem(item.match)
                  setTab("For You")
                }}
              >
                <Image src={item.image} width={34} height={34} alt="" />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.type}</small>
                </span>
                <LuArrowRight />
              </button>
            ))}
          </MagicBento>
        </section>
      )}
      {showGames && games.length > 0 && (
        <section>
          <SectionTitle
            title="Season Games · your claims go further"
            href="/games?view=bonus"
          />
          <MagicBento className="p-featured-grid">
            {games.slice(0, tab === "Games" ? 4 : 2).map((game) => (
              <Link
                className="p-featured-card p-surface"
                data-magic-bento-card=""
                key={game.id}
                href={`/games?game=${game.id}`}
              >
                <Image src={game.art} width={220} height={180} alt="" />
                <div>
                  <p className="p-eyebrow">{game.type}</p>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <span className="p-caption">
                    {Math.min(game.target, seasonGameProgress(game.id, state))}{" "}
                    / {game.target} {game.unit}
                  </span>
                  <ProgressBar
                    value={
                      (seasonGameProgress(game.id, state) / game.target) * 100
                    }
                    label={`${game.title} progress`}
                  />
                </div>
                <LuArrowRight />
              </Link>
            ))}
          </MagicBento>
        </section>
      )}
      {noResults && (
        <EmptyState
          title="Nothing in this orbit yet"
          description="Try a different category or search for a Loop, game, or ecosystem."
          onReset={() => {
            setTab("For You")
            setEcosystem(null)
          }}
        />
      )}
      {!showForYou && tab === "New" && (
        <p className="p-muted">
          <LuCompass className="inline" /> New features and opportunities will
          appear here as the ecosystem grows.
        </p>
      )}
    </>
  )
}

export function DiscoverPage() {
  return (
    <Suspense fallback={<p className="p-muted">Loading Explore…</p>}>
      <DiscoverContent />
    </Suspense>
  )
}
