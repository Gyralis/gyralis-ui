import { notFound } from "next/navigation"
import { isAddress } from "viem"

import { getSeasonUserLoopStatsForUser } from "@/lib/db/clients/season-scoring.client"
import { publicSeasonLoopStats } from "@/lib/scoring/season-api"
import { activeSeasons, getSeasonById } from "@/lib/scoring/seasons"
import { StoredSeasonStreaks } from "@/components/participation/stored-season-streaks"

export const dynamic = "force-dynamic"

export default async function SeasonTestPage({
  searchParams,
}: {
  searchParams: { address?: string; seasonId?: string }
}) {
  if (process.env.NODE_ENV !== "development") notFound()
  const address =
    searchParams.address ?? "0xE9dC34B67006Db0910a9761CB031D4bDE67dCE23"
  const seasonId = searchParams.seasonId ?? "test-2026-08-10-oct-10"
  const season = getSeasonById(seasonId)
  if (!season || !isAddress(address)) notFound()

  // Explicit development view of saved projections. Do not replace the live
  // endpoints' config-hash readiness checks or write to scoring tables here.
  let data
  try {
    const loops = await getSeasonUserLoopStatsForUser(seasonId, address)
    data = {
      loops: loops.map(publicSeasonLoopStats),
      updatedAt: loops.length
        ? new Date(
            Math.max(...loops.map((loop) => loop.updatedAt.getTime()))
          ).toISOString()
        : null,
    }
  } catch {
    data = null
  }

  return (
    <div className="p-page">
      <header className="p-surface s-panel">
        <p className="p-eyebrow">Local UI test · Database streaks</p>
        <h1>{season.name}</h1>
        <p style={{ overflowWrap: "anywhere" }}>{address}</p>
        <p>
          {season.startsAt.toISOString().slice(0, 10)} through{" "}
          {new Date(season.endsAt.getTime() - 1).toISOString().slice(0, 10)} ·
          UTC
        </p>
        <p>
          Streak cards use this wallet’s saved season records from the database.
        </p>
        {data?.updatedAt && <p>Records last updated: {data.updatedAt}</p>}
        <form method="get">
          <label>
            Wallet address{" "}
            <input name="address" defaultValue={address} required />
          </label>{" "}
          <label>
            Season{" "}
            <select name="seasonId" defaultValue={seasonId}>
              {activeSeasons.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>{" "}
          <button type="submit" className="p-button secondary small">
            Load streak cards
          </button>
        </form>
      </header>
      {!data ? (
        <div className="p-surface s-panel" role="status">
          The database couldn’t be reached. Reload to try again.
        </div>
      ) : !data.loops.length ? (
        <div className="p-surface s-panel" role="status">
          No stored streaks for this wallet and season.
        </div>
      ) : (
        <StoredSeasonStreaks loops={data.loops} />
      )}
    </div>
  )
}
