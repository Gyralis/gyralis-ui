"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useIsPresent } from "framer-motion"
import {
  LuArrowRight,
  LuCalendarCheck,
  LuLayers,
  LuPanelRightClose,
  LuPanelRightOpen,
  LuSparkles,
} from "react-icons/lu"

import { seasonPhases } from "@/lib/participation/season-preview"

import { useCardMotion } from "./card-motion-preview"
import { ProgressBar } from "./participation-ui"
import { useSeason } from "./season-context"

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
  const { state, score, rank } = useSeason()
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
      <section className="p-surface p-season-summary">
        <div className="p-eyebrow-row">
          <h2 className="p-eyebrow">Season 01</h2>
          <Link href="/games" aria-label="View Season games">
            <LuArrowRight />
          </Link>
        </div>
        <div className="p-season-numbers">
          <div>
            <p>{state.registered ? "Season points" : "Potential points"}</p>
            <strong>{score.total.toLocaleString()}</strong>
          </div>
          <div>
            <p>Season rank</p>
            <strong>
              {state.registered && state.phase !== "registration"
                ? `#${rank ?? "—"}`
                : "—"}
            </strong>
          </div>
        </div>
        <ProgressBar
          value={(seasonPhases[state.phase].day / 30) * 100}
          label="Season elapsed"
        />
        <p className="p-caption">{seasonPhases[state.phase].timing}</p>
      </section>
      <section className="p-rail-activity">
        <div className="p-section-title">
          <h2>Season activity</h2>
          <Link href="/games">
            Your Season <LuArrowRight />
          </Link>
        </div>
        {[
          ...(state.dayClaimed
            ? [
                {
                  icon: LuSparkles,
                  title: "Day Game claim preview",
                  time: "Just now",
                  gp: "+4 points",
                },
              ]
            : []),
          ...state.loops
            .filter((loop) => loop.claimedToday)
            .map((loop) => ({
              icon: LuLayers,
              title: `${loop.name} claim preview`,
              time: "Just now",
              gp: `+${loop.lastAward} points`,
            })),
          ...(state.registered
            ? [
                {
                  icon: LuCalendarCheck,
                  title: state.earlyBird ? "Early Bird entry" : "Season entry",
                  time: "Season 01",
                  gp: "",
                },
              ]
            : []),
        ].map(({ icon: Icon, title, time, gp }) => (
          <div className="p-activity-row" key={title}>
            <span className="p-icon small">
              <Icon />
            </span>
            <div>
              <p>{title}</p>
              <span>{time}</span>
            </div>
            <b>{gp}</b>
          </div>
        ))}
        {!state.registered &&
          !state.loops.some((loop) => loop.claimedToday) && (
            <p className="p-caption">
              Enter the Season to build your participation history.
            </p>
          )}
      </section>
    </motion.aside>
  )
}
