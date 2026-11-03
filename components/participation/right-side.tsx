"use client"

import { useEffect, useRef } from "react"
import { motion, useIsPresent } from "framer-motion"
import { LuPanelRightClose, LuPanelRightOpen } from "react-icons/lu"

import { useCardMotion } from "./card-motion-preview"
import { LatestActivity } from "./latest-activity"
import { SeasonPoints } from "./season-points"

export function RightSideToggle({
  open,
  onToggle,
}: {
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="p-icon-button p-right-side-toggle"
      aria-label={open ? "Hide right side" : "Show right side"}
      aria-controls="participation-right-side"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      title={open ? "Hide right side" : "Show right side"}
      onClick={onToggle}
    >
      {open ? (
        <LuPanelRightClose aria-hidden="true" />
      ) : (
        <LuPanelRightOpen aria-hidden="true" />
      )}
    </button>
  )
}

export function RightSide({ stacked = false }: { stacked?: boolean }) {
  const { mode, reducedMotion } = useCardMotion()
  const motionEnabled = mode !== "off" && !reducedMotion
  const isPresent = useIsPresent()
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    if (panel.current) panel.current.inert = !isPresent
  }, [isPresent])

  return (
    <motion.aside
      ref={panel}
      id="participation-right-side"
      className="p-rail p-right-side"
      aria-hidden={!isPresent}
      aria-label="Right side: Season 01 and latest activity"
      initial={
        motionEnabled
          ? {
              opacity: 0,
              x: stacked ? 0 : 12,
              y: stacked ? -6 : 0,
              height: stacked ? 0 : "auto",
              marginBottom: 0,
            }
          : false
      }
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        height: "auto",
        marginBottom: stacked ? 24 : 0,
      }}
      exit={{
        opacity: 0,
        x: motionEnabled && !stacked ? 12 : 0,
        y: motionEnabled && stacked ? -6 : 0,
        height: stacked ? 0 : "auto",
        marginBottom: 0,
      }}
      transition={{
        duration: motionEnabled ? 0.24 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <SeasonPoints compact />
      <LatestActivity />
    </motion.aside>
  )
}
