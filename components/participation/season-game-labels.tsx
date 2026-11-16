import Image from "next/image"
import { LoopCardsData } from "@/data/loops-data"
import { LuGoal } from "react-icons/lu"

import { loopLogo } from "@/lib/participation/loop-artwork"
import { claimRace, type SeasonGame } from "@/lib/participation/season-games"

export function SeasonGameTitle({ game }: { game: SeasonGame }) {
  if (game.id !== "race") return <>{game.title}</>

  return (
    <span className="s-race-title">
      <LuGoal aria-hidden="true" />
      {game.title}
    </span>
  )
}

export function SeasonGameDescription({ game }: { game: SeasonGame }) {
  if (game.id !== "race") return <>{game.description}</>

  const loop = LoopCardsData.find(
    (item) => item.id === claimRace.loopId && item.enabled
  )

  return (
    <>
      Be one of the first {claimRace.winners} to reach {game.target} claims in{" "}
      {loop ? (
        <span
          className="s-race-loop-badge"
          aria-label={`Racing Loop: ${loop.title}`}
          title={`Racing Loop: ${loop.title}`}
        >
          <Image src={loopLogo(loop)} alt="" width={18} height={18} />
          <span>{loop.title}</span>
        </span>
      ) : (
        "the Gardens Loop"
      )}
      . No streak required.
    </>
  )
}
