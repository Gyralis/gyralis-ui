"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardsData } from "@/data/loops-data"
import { LuArrowRight } from "react-icons/lu"

import { gameView, seasonGames } from "@/lib/participation/season-games"
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
      loop.enabled &&
      matches(
        `${loop.title} ${loop.by} ${loop.chainName} ${loop.description}`
      ) &&
      (!ecosystem ||
        `${loop.title} ${loop.by} ${loop.chainName}`.includes(ecosystem))
  )
  const activeLoops = [...loops].sort(
    (a, b) => [3, 4, 6, 9].indexOf(a.id) - [3, 4, 6, 9].indexOf(b.id)
  )
  const games = seasonGames.filter((game) =>
    matches(`${game.title} ${game.type} ${game.description}`)
  )
  const eco = ecosystems.filter((item) => matches(`${item.name} ${item.type}`))
  const showForYou = tab === "For You" && !search && !ecosystem
  const showLoops = ["For You", "Loops"].includes(tab)
  const showGames = ["For You", "Season Games"].includes(tab)
  const showEcosystems = ["For You", "Ecosystems"].includes(tab) && !ecosystem
  const noResults =
    !(showLoops && activeLoops.length) &&
    !(showGames && games.length) &&
    !(showEcosystems && eco.length)
  return (
    <>
      <SeasonPreview
        pageHeader
        title="Gyralis Season"
        seasonLabel="SEASON 1: BETA EDITION"
        variant="explore"
      />
      <FilterTabs
        items={["For You", "Loops", "Season Games", "Ecosystems"]}
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
      {showLoops && activeLoops.length > 0 && (
        <section>
          <SectionTitle
            title={showForYou ? "Your active Loops" : "Explore Loops"}
          />
          <MagicBento className="p-loop-grid">
            {(showForYou ? activeLoops.slice(0, 3) : activeLoops).map(
              (loop) => (
                <LoopOpportunityCard
                  key={loop.id}
                  loop={loop}
                  compact={tab === "Loops" || tab === "For You"}
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
            title="Go further this Season"
            subtitle="Complete Season Games. Earn extra SP."
          />
          <MagicBento className="p-featured-grid">
            {games
              .slice(0, tab === "Season Games" ? games.length : 2)
              .map((game) => {
                const view = gameView(game, state)
                return (
                  <Link
                    className="p-featured-card p-surface"
                    data-magic-bento-card=""
                    key={game.id}
                    href={`/games?game=${game.id}`}
                  >
                    <Image
                      className="s-featured-game-art"
                      src={game.art}
                      width={1254}
                      height={1254}
                      sizes="150px"
                      alt=""
                    />
                    <div>
                      <h3>{game.title}</h3>
                      <p>{game.description}</p>
                      <span className="p-caption">
                        +{game.bonus}{" "}
                        {game.id === "race"
                          ? "SP reserved · On hold"
                          : game.id === "weekend"
                          ? "bonus SP per Sunday claim"
                          : "bonus SP once"}
                      </span>
                      {view.target > 0 && game.id !== "race" ? (
                        <ProgressBar
                          value={(view.progress / view.target) * 100}
                          label={`${game.title} progress`}
                        />
                      ) : (
                        <small className="p-caption">{view.status}</small>
                      )}
                    </div>
                    <LuArrowRight />
                  </Link>
                )
              })}
          </MagicBento>
        </section>
      )}
      {noResults && (
        <EmptyState
          title="Nothing in this orbit yet"
          description="Try a different category or search for a Loop, Season Game, or ecosystem."
          onReset={() => {
            setTab("For You")
            setEcosystem(null)
          }}
        />
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
