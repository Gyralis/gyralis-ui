"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { LuRotateCcw, LuSparkles } from "react-icons/lu"

export type CardMotionMode = "off" | "subtle"

const MotionContext = createContext({
  mode: "subtle" as CardMotionMode,
  setMode: (_mode: CardMotionMode) => {},
  replay: 0,
  replayIntro: () => {},
  reducedMotion: true,
  finePointer: false,
})

export const useCardMotion = () => useContext(MotionContext)

export function CardMotionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<CardMotionMode>("subtle")
  const [replay, setReplay] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(true)
  const [finePointer, setFinePointer] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => {
      setReducedMotion(reduced.matches)
      setFinePointer(pointer.matches)
    }
    update()
    reduced.addEventListener("change", update)
    pointer.addEventListener("change", update)
    return () => {
      reduced.removeEventListener("change", update)
      pointer.removeEventListener("change", update)
    }
  }, [])

  return (
    <MotionContext.Provider
      value={{
        mode,
        setMode,
        replay,
        replayIntro: () => setReplay((value) => value + 1),
        reducedMotion,
        finePointer,
      }}
    >
      {children}
    </MotionContext.Provider>
  )
}

export function CardMotionPreview() {
  const { mode, setMode, replayIntro, reducedMotion } = useCardMotion()
  return (
    <section className="p-motion-preview" aria-label="Card motion preview">
      <div>
        <LuSparkles aria-hidden="true" />
        <span>Card motion</span>
      </div>
      <div className="p-motion-options" role="group" aria-label="Card motion">
        {(
          [
            { value: "subtle", label: "On" },
            { value: "off", label: "Off" },
          ] as const
        ).map((item) => (
          <button
            type="button"
            key={item.value}
            aria-pressed={mode === item.value}
            onClick={() => setMode(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="p-motion-replay"
        disabled={mode === "off" || reducedMotion}
        onClick={replayIntro}
      >
        <LuRotateCcw aria-hidden="true" />
        Replay entrance
      </button>
      <p>
        {reducedMotion
          ? "Your reduced-motion preference is active."
          : mode === "off"
          ? "Motion is off."
          : "Glow, spotlight, click waves, and a gentle entrance."}
      </p>
    </section>
  )
}
