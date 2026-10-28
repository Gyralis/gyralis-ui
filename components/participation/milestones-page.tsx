"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { demoMilestones } from "@/data/participation-demo"
import { LuArrowRight, LuCheck, LuTrophy } from "react-icons/lu"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MagicBento from "@/components/ui/magic-bento"

import { CardMotionPreview } from "./card-motion-preview"
import { FilterTabs, PageIntro, ProgressBar } from "./participation-ui"

export function MilestonesPage() {
  const [tab, setTab] = useState("In progress")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = demoMilestones.find((item) => item.id === selectedId)
  const items = demoMilestones.filter((item) =>
    tab === "In progress"
      ? item.status === "Active"
      : tab === "Completed"
      ? item.status === "Completed"
      : item.status === "Upcoming"
  )
  return (
    <>
      <PageIntro
        title="Milestones"
        description="Track the collective progress of the Gyralis ecosystem."
      />
      <CardMotionPreview />
      <MagicBento>
        <section
          className="p-milestone-hero p-surface"
          data-magic-bento-card=""
        >
          <Image src="/images/img_1.png" width={360} height={360} alt="" />
          <div>
            <p className="p-eyebrow">LOOP TOGETHER</p>
            <h2>Road to 25K claims</h2>
            <p>Every return moves the whole ecosystem forward.</p>
            <div className="p-milestone-total">
              <strong>22,481</strong>
              <span>/ 25,000 claims</span>
            </div>
            <ProgressBar
              value={(22481 / 25000) * 100}
              label="25K claims milestone"
            />
            <div className="p-section-title">
              <span>89.9% complete</span>
              <span>2,519 claims to go</span>
            </div>
            <button
              type="button"
              className="p-button"
              onClick={() => setSelectedId("25k")}
            >
              View milestone <LuArrowRight />
            </button>
          </div>
        </section>
      </MagicBento>
      <FilterTabs
        items={["In progress", "Completed", "Upcoming"]}
        value={tab}
        onChange={setTab}
        label="Milestone status"
      />
      <MagicBento className="p-milestones-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="p-milestone-card p-surface"
            data-magic-bento-card=""
            onClick={() => setSelectedId(item.id)}
          >
            <div className="p-section-title">
              <span className="p-icon">
                {item.status === "Completed" ? <LuCheck /> : <LuTrophy />}
              </span>
              <span className="p-small-label">{item.status}</span>
            </div>
            <h2>{item.title}</h2>
            <p>{item.unlock}</p>
            <ProgressBar
              value={(item.current / item.target) * 100}
              label={`${item.title} progress`}
            />
            <div className="p-section-title">
              <span>
                {item.current.toLocaleString()} / {item.target.toLocaleString()}
              </span>
              <strong>{Math.round((item.current / item.target) * 100)}%</strong>
            </div>
            <span className="p-text-link">
              View milestone <LuArrowRight />
            </span>
          </button>
        ))}
      </MagicBento>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        <DialogContent className="participation-theme participation-dialog dark">
          <DialogHeader>
            <p className="p-eyebrow">Collective progress</p>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>{selected?.unlock}</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <p className="p-large-number">
                {selected.current.toLocaleString()}{" "}
                <span>
                  / {selected.target.toLocaleString()} {selected.unit}
                </span>
              </p>
              <ProgressBar
                value={(selected.current / selected.target) * 100}
                label="Milestone progress"
              />
              <p className="p-muted">
                This is a preview of collective ecosystem progress. No reward
                unlock or distribution is triggered by these sample totals.
              </p>
              <Link href="/loops" className="p-button">
                Explore participating Loops <LuArrowRight />
              </Link>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
