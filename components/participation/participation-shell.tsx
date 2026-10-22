"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { demoParticipation as user } from "@/data/participation-demo"
import {
  LuArrowRight,
  LuBarChart2,
  LuBell,
  LuBookOpen,
  LuCalendarCheck,
  LuChevronDown,
  LuCompass,
  LuGamepad2,
  LuInfo,
  LuLayers,
  LuMenu,
  LuSearch,
  LuSparkles,
  LuStar,
  LuTrophy,
  LuUser,
  LuX,
} from "react-icons/lu"

import { WalletConnect } from "@/components/blockchain/wallet-connect"
import { IdentityHubDrawer } from "@/components/identity-hub/identity-hub-drawer"

import { ProgressBar } from "./participation-ui"

const SearchContext = createContext("")
export const useParticipationSearch = () => useContext(SearchContext)

const links = [
  { href: "/discover", label: "Explore", icon: LuCompass },
  { href: "/loops", label: "Loops", icon: LuLayers },
  { href: "/games", label: "Games", icon: LuGamepad2 },
  { href: "/milestones", label: "Milestones", icon: LuTrophy },
  { href: "/leaderboard", label: "Leaderboard", icon: LuBarChart2 },
  { href: "/profile", label: "Profile", icon: LuUser },
]

export function ParticipationRail() {
  return (
    <aside className="p-rail" aria-label="Demo participation summary">
      <section className="p-surface p-identity">
        <div className="p-eyebrow-row">
          <h2 className="p-eyebrow">Your participation</h2>
          <span className="p-small-label">Demo</span>
        </div>
        <div className="p-rail-stat">
          <span className="p-icon">
            <LuCalendarCheck />
          </span>
          <div>
            <p>Current streak</p>
            <strong>{user.currentStreak} days</strong>
          </div>
        </div>
        <div className="p-rail-stat">
          <span className="p-icon">
            <LuStar />
          </span>
          <div>
            <p>All-time GP</p>
            <strong>{user.totalGP}</strong>
          </div>
        </div>
        <div className="p-rail-stat">
          <span className="p-icon">
            <LuBarChart2 />
          </span>
          <div>
            <p>Level</p>
            <strong>{user.level}</strong>
          </div>
        </div>
        <Link className="p-text-link" href="/profile">
          Your participation profile <LuArrowRight />
        </Link>
      </section>
      <section className="p-surface p-season-summary">
        <div className="p-eyebrow-row">
          <h2 className="p-eyebrow">Season 01</h2>
          <Link href="/games" aria-label="View Season games">
            <LuArrowRight />
          </Link>
        </div>
        <div className="p-season-numbers">
          <div>
            <p>Season GP</p>
            <strong>{user.seasonGP.toLocaleString()}</strong>
          </div>
          <div>
            <p>Season rank</p>
            <strong>#{user.seasonRank}</strong>
          </div>
        </div>
        <ProgressBar value={40} label="Demo Season elapsed" />
        <p className="p-caption">Day 12 of 30 · 18 days left</p>
      </section>
      <section className="p-rail-activity">
        <div className="p-section-title">
          <h2>Latest activity</h2>
          <Link href="/profile">
            View all <LuArrowRight />
          </Link>
        </div>
        {[
          {
            icon: LuLayers,
            title: "Claimed 1Hive Gardens",
            time: "2h ago",
            gp: "+1 GP",
          },
          {
            icon: LuCalendarCheck,
            title: "Completed 7-day streak",
            time: "6h ago",
            gp: "+5 GP",
          },
          {
            icon: LuSparkles,
            title: "Joined True Loopers",
            time: "1d ago",
            gp: "",
          },
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
      </section>
    </aside>
  )
}

export function ParticipationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const notificationBox = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setNotifications(false)
    setSearch(new URLSearchParams(window.location.search).get("q") ?? "")
  }, [pathname])
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
        setNotifications(false)
      }
      if (
        event.key === "/" &&
        !(
          event.target instanceof HTMLElement &&
          (event.target.matches("input,textarea") ||
            event.target.isContentEditable)
        )
      ) {
        event.preventDefault()
        input.current?.focus()
      }
    }
    function onPointer(event: PointerEvent) {
      if (
        notificationBox.current &&
        !notificationBox.current.contains(event.target as Node)
      )
        setNotifications(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer)
    }
  }, [])

  return (
    <SearchContext.Provider value={search}>
      <div className="participation-app participation-theme dark">
        <a href="#participation-content" className="p-skip-link">
          Skip to content
        </a>
        {menuOpen && (
          <button
            className="p-nav-scrim"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <aside
          id="participation-sidebar"
          className={`p-sidebar ${menuOpen ? "is-open" : ""}`}
          aria-label="App sidebar"
        >
          <Link href="/discover" className="p-brand">
            <Image src="/gyralis-logo.svg" width={34} height={34} alt="" />
            <span>GYRALIS</span>
          </Link>
          <nav aria-label="Main navigation">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                href={href}
                key={href}
                aria-label={label}
                onClick={() => setSearch("")}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-sidebar-season">
            <span className="p-small-label">Gyralis Games · Demo</span>
            <Link href="/games">
              <LuSparkles /> Season 01 <LuArrowRight />
            </Link>
            <p>Every claim counts.</p>
          </div>
          <div className="p-sidebar-footer">
            <a
              href="https://github.com/orgs/Gyralis/repositories"
              target="_blank"
              rel="noreferrer"
            >
              <LuBookOpen />
              Docs
            </a>
            <Link href="/">
              <LuInfo />
              About Gyralis
            </Link>
          </div>
        </aside>
        <div className="p-app-main">
          <header className="p-topbar">
            <button
              type="button"
              className="p-icon-button p-menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="participation-sidebar"
            >
              {menuOpen ? <LuX /> : <LuMenu />}
            </button>
            <form
              className="p-global-search"
              onSubmit={(event) => {
                event.preventDefault()
                if (!["/discover", "/loops", "/games"].includes(pathname))
                  router.push(`/discover?q=${encodeURIComponent(search)}`)
              }}
              role="search"
            >
              <LuSearch aria-hidden="true" />
              <input
                ref={input}
                aria-label="Search Loops, games, ecosystems"
                placeholder="Search Loops, games, ecosystems..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <kbd>/</kbd>
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <LuX />
                </button>
              )}
            </form>
            <span className="p-demo-chip">Demo preview</span>
            <div className="p-notifications" ref={notificationBox}>
              <button
                type="button"
                className="p-icon-button"
                aria-label="Notifications"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <LuBell />
              </button>
              {notifications && (
                <div className="p-notification-panel p-surface">
                  <h2>You’re in the Loop</h2>
                  <p>No notifications in this preview.</p>
                  <span className="p-caption">
                    Season and game previews use demo data.
                  </span>
                </div>
              )}
            </div>
            <div className="p-identity-control">
              <IdentityHubDrawer compact />
            </div>
            <WalletConnect compact />
          </header>
          <details className="p-inline-participation">
            <summary>
              <span>Your participation</span>
              <span>
                11-day streak · Demo <LuChevronDown />
              </span>
            </summary>
            <ParticipationRail />
          </details>
          <div className="p-app-grid">
            <main id="participation-content" className="p-page">
              {children}
            </main>
            <ParticipationRail />
          </div>
        </div>
        <nav className="p-bottom-nav" aria-label="Mobile navigation">
          {links
            .filter((item) => item.href !== "/milestones")
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
              >
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
        </nav>
      </div>
    </SearchContext.Provider>
  )
}
