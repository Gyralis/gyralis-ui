"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LoopCardsData } from "@/data/loops-data"
import { demoGames } from "@/data/participation-demo"
import { LuArrowRight, LuCalendarCheck, LuCompass } from "react-icons/lu"

import MagicBento from "@/components/ui/magic-bento"

import { CardMotionPreview } from "./card-motion-preview"
import { LoopOpportunityCard } from "./loop-directory"
import { useParticipationSearch } from "./participation-shell"
import {
  DemoNotice,
  EmptyState,
  FilterTabs,
  PageIntro,
  ProgressBar,
  SectionTitle,
} from "./participation-ui"
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
  const games = demoGames.filter(
    (game) =>
      game.status === "Live" &&
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
      <PageIntro
        title="Discover"
        description="Find your next Loop, game or ecosystem. Keep showing up."
      />
      <CardMotionPreview />
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
      {showForYou && (
        <>
          <section className="p-continue p-surface">
            <span className="p-icon">
              <LuCalendarCheck />
            </span>
            <div>
              <p className="p-eyebrow">
                Keep your streak <span className="p-small-label">Demo</span>
              </p>
              <h2>11 days. Every claim counts.</h2>
              <p>Your next participation starts with a Loop.</p>
            </div>
            <Link href="/loops?loop=3" className="p-button">
              View ready Loops <LuArrowRight />
            </Link>
          </section>
          <SeasonPreview />
        </>
      )}
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
                      ? loop.id === 4
                        ? "Next claim in 5h 12m"
                        : "Ready to claim"
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
            title={
              tab === "Ending Soon"
                ? "Season games · 18 days left"
                : "Keep playing. Keep progressing."
            }
            href="/games"
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
                  <p className="p-eyebrow">{game.type} · Demo</p>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <span className="p-caption">
                    {game.current} / {game.target} {game.unit}
                  </span>
                  <ProgressBar
                    value={(game.current / game.target) * 100}
                    label={`${game.title} demo progress`}
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
      <DemoNotice />
    </>
  )
}

export function DiscoverPage() {
  return (
    <Suspense fallback={<p className="p-muted">Loading Discover…</p>}>
      <DiscoverContent />
    </Suspense>
  )
}
