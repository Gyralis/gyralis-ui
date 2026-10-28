"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { demoParticipation as user } from "@/data/participation-demo"
import {
  LuArrowRight,
  LuAward,
  LuCalendarCheck,
  LuLayers,
  LuStar,
} from "react-icons/lu"

import type { ProfilePageData } from "@/lib/profile/get-profile-page-data"
import { WalletConnect } from "@/components/blockchain/wallet-connect"

import { FilterTabs, PageIntro } from "./participation-ui"
import { SeasonPreview } from "./season-preview"

export function ProfileSections({
  data,
  children,
  achievements,
  loops,
}: {
  data?: ProfilePageData
  children?: ReactNode
  achievements?: ReactNode
  loops?: ReactNode
}) {
  const [tab, setTab] = useState("Overview")
  const preview = !data
  return (
    <>
      <PageIntro
        title="Profile"
        description="Your permanent participation identity. Built one return at a time."
      />
      {preview && (
        <>
          <section className="p-profile-hero p-surface">
            <Image src="/images/img_2.png" width={90} height={90} alt="" />
            <div>
              <p className="p-eyebrow">Participation profile</p>
              <h2>{user.name}</h2>
              <p>Level {user.level} · True Looper</p>
            </div>
            <WalletConnect />
          </section>
        </>
      )}
      <FilterTabs
        items={["Overview", "Activity", "Achievements", "Seasons", "Loops"]}
        value={tab}
        onChange={setTab}
        label="Profile sections"
      />
      {tab === "Overview" &&
        (preview ? (
          <>
            <div className="p-stat-grid p-surface">
              <div>
                <span>Total claims</span>
                <strong>151</strong>
              </div>
              <div>
                <span>Longest streak</span>
                <strong>
                  17 <small>days</small>
                </strong>
              </div>
              <div>
                <span>All-time GP</span>
                <strong>196</strong>
              </div>
              <div>
                <span>Active Loops</span>
                <strong>3</strong>
              </div>
            </div>
            <section className="p-profile-next p-surface">
              <LuCalendarCheck />
              <div>
                <h2>11 days of showing up.</h2>
                <p>Come back. Keep participating. Every claim counts.</p>
              </div>
              <Link href="/loops" className="p-button">
                Find your next Loop <LuArrowRight />
              </Link>
            </section>
            <PreviewAchievements />
          </>
        ) : (
          <div className="p-legacy-view p-live-profile">{children}</div>
        ))}
      {tab === "Activity" && (
        <section className="p-surface p-profile-activity">
          <h2>{preview ? "Latest activity" : "Participation summary"}</h2>
          {preview ? (
            [
              "Claimed 1Hive Gardens · +1 GP",
              "Completed 7-day streak · +5 GP",
              "Joined True Loopers",
            ].map((text, i) => (
              <div className="p-activity-row" key={text}>
                <span className="p-icon small">
                  <LuLayers />
                </span>
                <p>{text}</p>
                <span>{["2h ago", "6h ago", "1d ago"][i]}</span>
              </div>
            ))
          ) : data.loopStats.length ? (
            data.loopStats.map((loop) => (
              <div className="p-activity-row" key={loop.id}>
                <span className="p-icon small">
                  <LuLayers />
                </span>
                <div>
                  <p>{loop.metadata.title}</p>
                  <span>
                    {loop.totalClaims} claims · {loop.currentStreak} current
                    streak
                  </span>
                </div>
                <b>{loop.totalPoints} GP</b>
              </div>
            ))
          ) : (
            <p className="p-muted">
              No recorded participation yet. Your claims will build your history
              here.
            </p>
          )}
          <p className="p-caption">
            {preview
              ? "Sample events, separate from your wallet history."
              : "All-time totals from indexed Loop participation. This summary is not a transaction timeline."}
          </p>
        </section>
      )}
      {tab === "Achievements" &&
        (preview ? (
          <PreviewAchievements />
        ) : (
          <div className="p-legacy-view">{achievements}</div>
        ))}
      {tab === "Seasons" && (
        <>
          <SeasonPreview />
        </>
      )}
      {tab === "Loops" &&
        (preview ? (
          <div className="p-surface p-list">
            {[
              { id: 3, title: "1Hive Gardens", streak: "11-claim streak" },
              { id: 4, title: "Blockscout Merits", streak: "5-claim streak" },
              { id: 6, title: "True Loopers", streak: "3-claim streak" },
            ].map((loop) => (
              <Link key={loop.id} href={`/loops?loop=${loop.id}`}>
                <span>
                  <strong>{loop.title}</strong>
                  <small>{loop.streak}</small>
                </span>
                <LuArrowRight />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-legacy-view">{loops}</div>
        ))}
    </>
  )
}

function PreviewAchievements() {
  return (
    <section>
      <div className="p-section-title">
        <h2>Achievements</h2>
      </div>
      <div className="p-achievement-grid">
        {[
          {
            icon: LuAward,
            title: "True Looper",
            description: "50 lifetime claims",
          },
          {
            icon: LuCalendarCheck,
            title: "Perfect Week",
            description: "7 consecutive claims",
          },
          {
            icon: LuStar,
            title: "Explorer",
            description: "5 different Loops · In progress",
          },
        ].map(({ icon: Icon, title, description }) => (
          <div className="p-surface p-achievement" key={title}>
            <span className="p-icon">
              <Icon />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
