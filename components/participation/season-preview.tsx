"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { demoGames } from "@/data/participation-demo"
import { LuArrowRight, LuClock, LuStar, LuUsers } from "react-icons/lu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { FilterTabs, ProgressBar } from "./participation-ui"

export function SeasonPreview({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState("Overview")
  return (
    <>
      <MagicBento>
        <section
          className={`p-season-hero p-surface ${compact ? "compact" : ""}`}
          data-magic-bento-card=""
        >
          <Image
            className="p-season-art"
            src="/images/img_2.png"
            width={430}
            height={430}
            alt=""
            priority
          />
          <div className="p-season-copy">
            <p className="p-eyebrow">
              Featured Season <span className="p-small-label">Demo</span>
            </p>
            <h2>Gyralis Games — Season 01</h2>
            <p>30 days of claiming, streaks, games and rewards.</p>
            <div className="p-hero-stats">
              <span>
                <LuClock />
                <strong>18 days left</strong>
                <small>of 30 days</small>
              </span>
              <span>
                <LuStar />
                <strong>#38</strong>
                <small>Season rank</small>
              </span>
              <span>
                <LuUsers />
                <strong>1,840</strong>
                <small>Season GP</small>
              </span>
            </div>
            <button
              type="button"
              className="p-button"
              onClick={() => setOpen(true)}
            >
              View Season <LuArrowRight />
            </button>
          </div>
        </section>
      </MagicBento>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">Season preview · Demo</p>
            <DialogTitle>Gyralis Games — Season 01</DialogTitle>
            <DialogDescription>
              30 days of recurring participation. All Season values are sample
              data.
            </DialogDescription>
          </DialogHeader>
          <FilterTabs
            items={["Overview", "Games", "Rules"]}
            value={tab}
            onChange={setTab}
            label="Season preview sections"
          />
          {tab === "Overview" && (
            <>
              <div className="p-stat-grid">
                <div>
                  <span>Your rank</span>
                  <strong>#38</strong>
                </div>
                <div>
                  <span>Season GP</span>
                  <strong>1,840</strong>
                </div>
                <div>
                  <span>Participants</span>
                  <strong>227</strong>
                </div>
                <div>
                  <span>Reward pool</span>
                  <strong>5,000 HNY</strong>
                </div>
              </div>
              <ProgressBar value={40} label="Season elapsed" />
              <p className="p-caption">Day 12 of 30 · 18 days remaining</p>
              <p className="p-muted">
                Season GP starts fresh each Season. Your all-time identity keeps
                growing independently.
              </p>
              <Link
                href="/games"
                onClick={() => setOpen(false)}
                className="p-button"
              >
                Explore games <LuArrowRight />
              </Link>
            </>
          )}
          {tab === "Games" && (
            <div className="p-list">
              {demoGames
                .filter((game) => game.status === "Live")
                .map((game) => (
                  <Link
                    href="/games"
                    onClick={() => setOpen(false)}
                    key={game.id}
                  >
                    <span>
                      <strong>{game.type}</strong>
                      <small>{game.description}</small>
                    </span>
                    <LuArrowRight />
                  </Link>
                ))}
            </div>
          )}
          {tab === "Rules" && (
            <div className="p-prose">
              <h3>Every claim counts</h3>
              <p>
                A successful claim earns +1 GP. Streak bonuses are awarded once
                per user, per Loop, within the Season scoring context.
              </p>
              <ul>
                <li>3 consecutive claims: +2 GP</li>
                <li>7 consecutive claims: +5 GP</li>
                <li>14 consecutive claims: +12 GP</li>
                <li>30 consecutive claims: +30 GP</li>
              </ul>
              <p>
                This preview does not register you for a live Season or award
                onchain rewards.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
