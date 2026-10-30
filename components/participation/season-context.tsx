"use client"

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react"

import {
  createSeasonPreview,
  previewScore,
  previewStandings,
  seasonPreviewReducer,
} from "@/lib/participation/season-preview"

type Operation = "register" | "refund" | "prize"
function useSeasonModel() {
  const [state, dispatch] = useReducer(seasonPreviewReducer, undefined, () =>
    createSeasonPreview()
  )
  const [pending, setPending] = useState<Operation | null>(null)
  const [failNext, setFailNext] = useState(false)
  useEffect(() => {
    if (!pending) return
    const timer = window.setTimeout(() => {
      if (failNext) {
        dispatch({
          type: "message",
          message:
            "Preview action failed. Nothing changed. You can safely retry.",
        })
        setFailNext(false)
      } else if (pending === "prize") dispatch({ type: "prize" })
      else
        dispatch({ type: "registration", registered: pending === "register" })
      setPending(null)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [pending, failNext])
  const standings = previewStandings(state)
  return {
    state,
    dispatch,
    score: previewScore(state),
    standings,
    rank: standings.find((p) => p.current)?.rank,
    entries:
      state.phase === "registration"
        ? 196 + Number(state.registered)
        : state.phase === "late"
        ? standings.length
        : 227,
    pending,
    transact: setPending,
    failNext,
    setFailNext,
    reset: (phase: typeof state.phase) => {
      setPending(null)
      setFailNext(false)
      dispatch({ type: "scenario", phase })
    },
  }
}
const SeasonContext = createContext<ReturnType<typeof useSeasonModel> | null>(
  null
)
export function SeasonProvider({ children }: { children: ReactNode }) {
  const model = useSeasonModel()
  return (
    <SeasonContext.Provider value={model}>{children}</SeasonContext.Provider>
  )
}
export function useSeason() {
  const context = useContext(SeasonContext)
  if (!context) throw new Error("useSeason requires SeasonProvider")
  return context
}
