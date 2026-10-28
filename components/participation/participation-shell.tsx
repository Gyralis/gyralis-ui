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
import { AnimatePresence } from "framer-motion"
import {
  LuBarChart2,
  LuBookOpen,
  LuCompass,
  LuGamepad2,
  LuInfo,
  LuLayers,
  LuLayoutDashboard,
  LuMenu,
  LuSearch,
  LuTrophy,
  LuUser,
  LuX,
} from "react-icons/lu"

import { WalletConnect } from "@/components/blockchain/wallet-connect"

import { useCardMotion } from "./card-motion-preview"
import { RightSide, RightSideToggle } from "./right-side"

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

export function ParticipationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const [rightSideOpen, setRightSideOpen] = useState(true)
  const [rightSideExiting, setRightSideExiting] = useState(false)
  const [rightSideStacked, setRightSideStacked] = useState(false)
  const { mode, reducedMotion } = useCardMotion()
  const rightSideMotion = mode !== "off" && !reducedMotion
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1250px)")
    const update = () => setRightSideStacked(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  function toggleRightSide() {
    setRightSideExiting(rightSideOpen && rightSideMotion)
    setRightSideOpen(!rightSideOpen)
  }

  useEffect(() => {
    setMenuOpen(false)
    setSearch(new URLSearchParams(window.location.search).get("q") ?? "")
  }, [pathname])

  useEffect(() => {
    // Pointer effects cache card positions; refresh after an instant layout change.
    const frame = requestAnimationFrame(() =>
      window.dispatchEvent(new Event("gyralis:layout-change"))
    )
    return () => cancelAnimationFrame(frame)
  }, [rightSideOpen, rightSideStacked])
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
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
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
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
          <div className="p-sidebar-footer">
            <Link href="/dashboard">
              <LuLayoutDashboard aria-hidden="true" />
              Dashboard
            </Link>
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
            <WalletConnect compact className="p-topbar-wallet" />
            <RightSideToggle open={rightSideOpen} onToggle={toggleRightSide} />
          </header>
          <div
            className={`p-app-grid ${
              rightSideOpen || (rightSideExiting && rightSideStacked)
                ? "is-right-side-open"
                : ""
            }`}
            data-right-side-motion={rightSideMotion ? "" : undefined}
            onTransitionEnd={(event) => {
              if (
                event.target === event.currentTarget &&
                event.propertyName === "transform"
              )
                window.dispatchEvent(new Event("gyralis:layout-change"))
            }}
          >
            <main id="participation-content" className="p-page">
              {children}
            </main>
            <AnimatePresence
              initial={false}
              onExitComplete={() => setRightSideExiting(false)}
            >
              {rightSideOpen && (
                <RightSide key="right-side" stacked={rightSideStacked} />
              )}
            </AnimatePresence>
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
