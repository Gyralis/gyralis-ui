import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { seasonGames } from "@/lib/participation/season-games"
import {
  createSeasonPreview,
  seasonPreviewReducer,
} from "@/lib/participation/season-preview"

import { SeasonGameCard, SeasonGameDetails } from "./season-game-card"

const mocks = vi.hoisted(() => ({ useSeason: vi.fn() }))
vi.mock("./season-context", () => ({ useSeason: mocks.useSeason }))
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string
    alt: string
    className?: string
  }) => <img src={src} alt={alt} className={className} />,
}))

beforeEach(() => {
  vi.stubGlobal("React", React)
  mocks.useSeason.mockReturnValue({
    state: createSeasonPreview(),
    dispatch: vi.fn(),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe("illustrated Season Games", () => {
  it("displays each game's distinct image, title, reward and details action", () => {
    for (const game of seasonGames) {
      const html = renderToStaticMarkup(
        <SeasonGameCard game={game} onOpen={() => {}} />
      )
      expect(html).toContain(game.title)
      expect(html).toContain(game.art)
      expect(html).toContain(`+${game.bonus}`)
      expect(html).toContain(
        game.id === "race" ? "See planning details" : "View game"
      )
    }
    expect(new Set(seasonGames.map((game) => game.art)).size).toBe(5)
  })
  it("does not pretend the required exploration roster is published", () => {
    const game = seasonGames.find((game) => game.id === "explorer")!
    const html = renderToStaticMarkup(<SeasonGameDetails game={game} />)
    expect(html).toContain("Required Loop list pending")
    expect(html).toContain("three qualifying claims in each required Loop")
    expect(html).not.toContain("0 / 5 Loops completed")
  })
  it("does not show held race points as earned", () => {
    const html = renderToStaticMarkup(
      <SeasonGameCard
        game={seasonGames.find((game) => game.id === "race")!}
        onOpen={() => {}}
      />
    )
    expect(html).toContain("On hold")
    expect(html).toContain("SP reserved")
    expect(html).not.toContain("Bonus earned")
  })
  it("changes the dedicated weekend action from registration to Sunday claiming", () => {
    const game = seasonGames.find((game) => game.id === "weekend")!
    expect(renderToStaticMarkup(<SeasonGameDetails game={game} />)).toContain(
      "Preview registration for Sunday"
    )
    const registered = seasonPreviewReducer(createSeasonPreview(), {
      type: "weekend-register",
      id: 2,
    })
    mocks.useSeason.mockReturnValue({
      state: { ...registered, weekendTime: "2026-12-13T12:00:00Z" },
      dispatch: vi.fn(),
    })
    const html = renderToStaticMarkup(<SeasonGameDetails game={game} />)
    expect(html).toContain("Preview Sunday claim · +4 SP")
    expect(html).toContain("1 claim point + 3 game-bonus points")
  })
})
