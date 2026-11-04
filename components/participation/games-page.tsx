"use client"

import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { LuArrowRight, LuCalendarCheck, LuInfo, LuX } from "react-icons/lu"
import { MdOutlineGames } from "react-icons/md"

import { seasonGames } from "@/lib/participation/season-games"
import { canEnter, canScore } from "@/lib/participation/season-preview"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { useParticipationSearch } from "./participation-shell"
import { EmptyState, FilterTabs } from "./participation-ui"
import { useSeason } from "./season-context"
import { SeasonGameCard, SeasonGameDetails } from "./season-game-card"
import { SeasonControls, SeasonHeader, SeasonRules } from "./season-panels"

function GamesContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { state, dispatch } = useSeason()
  const tab =
    !params.get("game") && params.get("view") === "prizes"
      ? "Prizes & Rules"
      : "Season Games"
  const search = useParticipationSearch().trim().toLowerCase()
  const selected = seasonGames.find((game) => game.id === params.get("game"))
  function changeTab(value: string) {
    const next = new URLSearchParams(params.toString())
    next.delete("game")
    next.set("view", value === "Prizes & Rules" ? "prizes" : "bonus")
    router.replace(`/games?${next.toString()}`, { scroll: false })
  }
  function openGame(id: string | null) {
    const next = new URLSearchParams(params.toString())
    next.set("view", "bonus")
    if (id) next.set("game", id)
    else next.delete("game")
    const destination = `/games?${next.toString()}`
    if (id) router.push(destination, { scroll: false })
    else router.replace(destination, { scroll: false })
  }
  const readyCount =
    state.registered && canScore(state.phase)
      ? state.loops.filter((loop) => !loop.claimedToday).length
      : 0
  const games = seasonGames.filter((game) =>
    `${game.title} ${game.type} ${game.description} ${game.how}`
      .toLowerCase()
      .includes(search)
  )
  return (
    <>
      <SeasonHeader home pageHeader />
      <FilterTabs
        items={["Season Games", "Prizes & Rules"]}
        value={tab}
        onChange={changeTab}
        label="Season sections"
      />
      <SeasonControls />
      {state.message && !selected && (
        <div className="s-status" role="status">
          <LuInfo aria-hidden="true" />
          <span>{state.message}</span>
          <button
            aria-label="Dismiss update"
            onClick={() => dispatch({ type: "message", message: "" })}
          >
            <LuX aria-hidden="true" />
          </button>
        </div>
      )}
      {tab === "Season Games" && (
        <>
          <div className="s-games-intro">
            <div>
              <p className="p-eyebrow">
                <MdOutlineGames aria-hidden="true" />
                Season Games
              </p>
              <h2>Take your claims further.</h2>
              <p>Complete objectives for extra Season points.</p>
            </div>
          </div>
          {!state.registered && (
            <div className="s-callout">
              <LuInfo aria-hidden="true" />
              <p>
                {canEnter(state.phase)
                  ? "Enter the Season to earn game bonuses. Eligible activity since the Season starts counts when you enter; there is no separate join step for each game."
                  : "Season registration is closed. You can explore game rules and continue earning available rewards in live Loops."}
              </p>
            </div>
          )}
          {(state.phase === "review" || state.phase === "prizes") && (
            <div className="s-callout">
              <LuInfo aria-hidden="true" />
              <p>
                The Season has ended. Your confirmed progress stays visible
                while results follow the review process.{" "}
                <button
                  className="p-text-link"
                  onClick={() => changeTab("Prizes & Rules")}
                >
                  Prizes & Rules <LuArrowRight aria-hidden="true" />
                </button>
              </p>
            </div>
          )}
          <MagicBento className="p-games-grid s-season-games-grid">
            {games.map((game) => (
              <SeasonGameCard
                key={game.id}
                game={game}
                onOpen={() => openGame(game.id)}
              />
            ))}
          </MagicBento>
          {!games.length && (
            <EmptyState
              title="No matching Season Games"
              description="Try another game name, objective or participation type."
            />
          )}
          <Link
            className="s-streaks-shortcut p-surface"
            href="/loops?view=streaks"
          >
            <LuCalendarCheck aria-hidden="true" />
            <span>
              <strong>
                {readyCount > 0
                  ? `${readyCount} Loop claims available in preview`
                  : "Keep your regular Loop participation going"}
              </strong>
              <small>
                Independent Loop streaks and milestone bonuses live in My
                Streaks.
              </small>
            </span>
            <span>
              My Streaks <LuArrowRight aria-hidden="true" />
            </span>
          </Link>
        </>
      )}
      {tab === "Prizes & Rules" && <SeasonRules />}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) openGame(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog s-game-dialog dark">
          {selected && (
            <>
              <DialogHeader className="s-game-dialog-header">
                <Image
                  className="s-game-dialog-art"
                  src={selected.art}
                  width={1254}
                  height={1254}
                  sizes="240px"
                  alt=""
                />
                <p className="p-eyebrow">{selected.type}</p>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>{selected.description}</DialogDescription>
              </DialogHeader>
              {state.message && (
                <p className="s-status" role="status">
                  {state.message}
                </p>
              )}
              <SeasonGameDetails game={selected} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function GamesPage() {
  return (
    <Suspense fallback={<p className="p-muted">Loading your Season…</p>}>
      <GamesContent />
    </Suspense>
  )
}
