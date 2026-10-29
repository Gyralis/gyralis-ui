"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { demoGames } from "@/data/participation-demo"
import { LuArrowRight, LuCheck, LuClock, LuUsers } from "react-icons/lu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { useParticipationSearch } from "./participation-shell"
import {
  EmptyState,
  FilterTabs,
  PageIntro,
  ProgressBar,
} from "./participation-ui"
import { SeasonPreview } from "./season-preview"

const JOINED_KEY = "gyralis-demo-joined-games-v1"

function GamesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const search = useParticipationSearch().toLowerCase()
  const [tab, setTab] = useState("Explore")
  const [status, setStatus] = useState("Live")
  const [joined, setJoined] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)
  const [message, setMessage] = useState("")
  const selected = demoGames.find((game) => game.id === params.get("game"))
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem(JOINED_KEY) ?? "[]"
      )
      if (Array.isArray(stored))
        setJoined(
          stored.filter(
            (item): item is string =>
              typeof item === "string" &&
              demoGames.some((game) => game.id === item)
          )
        )
    } catch {
      /* Unavailable storage still supports in-memory demos. */
    }
    setStorageReady(true)
  }, [])
  function updateJoined(id: string) {
    const next = joined.includes(id)
      ? joined.filter((item) => item !== id)
      : [...joined, id]
    setJoined(next)
    try {
      localStorage.setItem(JOINED_KEY, JSON.stringify(next))
    } catch {
      /* Local persistence is optional for this demo. */
    }
    setMessage(
      next.includes(id)
        ? "Joined the game. Explore live Loops to continue participating."
        : "Left the game."
    )
  }
  function openGame(id: string | null) {
    router.push(id ? `/games?game=${id}` : "/games", { scroll: false })
    setMessage("")
  }
  const games = demoGames.filter(
    (game) =>
      game.status === status &&
      (tab !== "My Games" || joined.includes(game.id)) &&
      `${game.title} ${game.type} ${game.description}`
        .toLowerCase()
        .includes(search)
  )
  return (
    <>
      <PageIntro
        title="Gyralis Games"
        description="One participation layer. Many ways to earn"
      />
      <FilterTabs
        items={["Explore", "My Games"]}
        value={tab}
        onChange={setTab}
        label="Game collection"
      />
      {tab === "Explore" && !search && status === "Live" && (
        <SeasonPreview compact />
      )}
      <div className="p-filter-row">
        <FilterTabs
          items={["Live", "Upcoming", "Completed"]}
          value={status}
          onChange={setStatus}
          label="Game status"
        />
        <span className="p-caption">
          {games.length} {games.length === 1 ? "game" : "games"}
        </span>
      </div>
      {games.length ? (
        <MagicBento className="p-games-grid">
          {games.map((game) => (
            <article
              key={game.id}
              className="p-game-card p-surface"
              data-magic-bento-card=""
            >
              <button
                type="button"
                className="p-game-art"
                onClick={() => openGame(game.id)}
                aria-label={`View ${game.title}`}
              >
                <Image
                  src={game.art}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, 440px"
                />
                <span className="p-status">{game.type}</span>
                {joined.includes(game.id) && (
                  <span className="p-game-joined">
                    <LuCheck />
                    Joined
                  </span>
                )}
              </button>
              <div className="p-game-content">
                <p className="p-eyebrow">{game.status}</p>
                <h2>{game.title}</h2>
                <p>{game.description}</p>
                <div className="p-game-meta">
                  <span>
                    <LuUsers />
                    {game.participants} participants
                  </span>
                  <span>
                    <LuClock />
                    {game.status === "Live"
                      ? "18 days left"
                      : game.status === "Upcoming"
                      ? "Coming next"
                      : "Finished"}
                  </span>
                </div>
                <div className="p-game-progress">
                  <span>
                    {game.current} / {game.target} {game.unit}
                  </span>
                  <ProgressBar
                    value={(game.current / game.target) * 100}
                    label={`${game.title} progress`}
                  />
                </div>
                <button
                  className="p-button secondary"
                  type="button"
                  onClick={() => openGame(game.id)}
                >
                  View game <LuArrowRight />
                </button>
              </div>
            </article>
          ))}
        </MagicBento>
      ) : (
        <EmptyState
          title={
            tab === "My Games" ? "Your next game is waiting" : "No games found"
          }
          description={
            tab === "My Games"
              ? "Join a game from Explore to see it here. Try other status filters for past games."
              : "Try another status or search."
          }
          onReset={() => {
            setTab("Explore")
            setStatus("Live")
          }}
        />
      )}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) openGame(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">{selected?.type}</p>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.description}</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="p-stat-grid">
                <div>
                  <span>Participants</span>
                  <strong>{selected.participants}</strong>
                </div>
                <div>
                  <span>Progress</span>
                  <strong>
                    {selected.current} / {selected.target}
                  </strong>
                </div>
              </div>
              <ProgressBar
                value={(selected.current / selected.target) * 100}
                label="Game progress"
              />
              <p className="p-muted">
                This preview uses sample progress. Live Loop claims do not
                update these game scores or award game rewards.
              </p>
              {selected.status === "Live" ? (
                <div className="p-dialog-actions">
                  <button
                    type="button"
                    disabled={!storageReady}
                    className="p-button"
                    onClick={() => updateJoined(selected.id)}
                  >
                    {joined.includes(selected.id) ? "Leave game" : "Join game"}
                  </button>
                  <Link className="p-button secondary" href="/loops">
                    Explore live Loops <LuArrowRight />
                  </Link>
                </div>
              ) : (
                <p className="p-caption">
                  {selected.status === "Upcoming"
                    ? "Registration will be available when this challenge opens."
                    : "This preview game has finished."}
                </p>
              )}
              <p role="status" className="p-success">
                {message}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function GamesPage() {
  return (
    <Suspense fallback={<p className="p-muted">Loading games…</p>}>
      <GamesContent />
    </Suspense>
  )
}
