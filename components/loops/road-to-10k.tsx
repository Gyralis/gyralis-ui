"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { LuCheck, LuChevronDown, LuFlag, LuInfo, LuLock } from "react-icons/lu"

import { useRoadTo10k } from "@/lib/hooks/app/use-road-to-10k"
import { ProfileDetails } from "@/components/profile/profile-details"

const GOAL = 10_000
const format = (value: number) => value.toLocaleString("en-US")

function RollingNumber({
  value,
  reduced,
}: {
  value: number
  reduced: boolean
}) {
  const digits = format(value).split("")
  return (
    <span aria-hidden="true" className="inline-flex tabular-nums">
      {digits.map((digit, index) => (
        <span
          key={digits.length - index}
          className="relative inline-block h-[1.15em] overflow-hidden"
        >
          <span className="invisible">{digit}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={digit}
              className="absolute inset-0 text-center"
              initial={{ y: reduced ? 0 : "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduced ? 0 : "-100%", opacity: 0 }}
              transition={{
                duration: reduced ? 0.12 : 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {digit}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function lastChecked(checkedAt: string, now: number) {
  const minutes = Math.max(
    0,
    Math.floor((now - Date.parse(checkedAt)) / 60_000)
  )
  if (minutes < 1) return "Last checked just now"
  if (minutes < 60)
    return `Last checked ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  const hours = Math.floor(minutes / 60)
  return `Last checked ${hours} ${hours === 1 ? "hour" : "hours"} ago`
}

export function RoadTo10k() {
  const model = useRoadTo10k()
  const reduced = Boolean(useReducedMotion())
  const [now, setNow] = useState(Date.now)
  const [bursts, setBursts] = useState<number[]>([])
  const [celebrating, setCelebrating] = useState(false)
  const seenSequence = useRef(model.sequence)
  const previousIndexedTotal = useRef<number>()
  const celebrated = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (model.sequence <= seenSequence.current) return
    const fresh = Array.from(
      { length: model.sequence - seenSequence.current },
      (_, index) => seenSequence.current + index + 1
    )
    seenSequence.current = model.sequence
    setBursts((current) => [...current, ...fresh])
  }, [model.sequence])

  useEffect(() => {
    const next = model.data?.totalClaims
    if (next == null) return
    if (
      previousIndexedTotal.current != null &&
      previousIndexedTotal.current < GOAL &&
      next >= GOAL &&
      !celebrated.current
    ) {
      celebrated.current = true
      try {
        if (sessionStorage.getItem("road-to-10k-celebrated")) return
        sessionStorage.setItem("road-to-10k-celebrated", "true")
      } catch {
        /* Celebration still works if session storage is unavailable. */
      }
      setCelebrating(true)
    }
    previousIndexedTotal.current = next
  }, [model.data?.totalClaims])

  const total = model.total
  const percent = Math.min(100, ((total ?? 0) / GOAL) * 100)
  const complete = (model.data?.totalClaims ?? 0) >= GOAL
  const delayed = model.pendingCount > 0 && !model.syncing
  const status = model.syncing
    ? model.pendingCount > 0
      ? "Your claim is confirmed. Updating the total…"
      : "Updating total…"
    : delayed
    ? "Total update delayed"
    : model.isError
    ? "Couldn’t refresh total"
    : model.data
    ? lastChecked(model.data.checkedAt, now)
    : "Couldn’t load claim total"

  const glass =
    "rounded-3xl border border-border/60 bg-card shadow-[0_12px_32px_-24px_rgba(0,0,0,0.45)] dark:border-border/25 dark:bg-background/50 dark:backdrop-blur-3xl"
  const updated = model.data
    ? lastChecked(model.data.checkedAt, now).replace("Last checked ", "")
    : "—"

  return (
    <section
      id="road-to-10k"
      aria-labelledby="road-to-10k-title"
      className="relative mb-[42px] w-full overflow-hidden bg-slate-950"
      style={{
        backgroundImage: "url('/dashboard-header.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:bg-black/60"
      />
      <AnimatePresence>
        {celebrating && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 border-2 border-primary bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.3 : 1.8 }}
            onAnimationComplete={() => setCelebrating(false)}
          />
        )}
      </AnimatePresence>
      <div className="relative mx-auto max-w-screen-xl p-4 sm:p-7 lg:p-8">
        <div className="relative mb-5 flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-4">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
            <LuFlag className="size-3.5 text-emerald-400" aria-hidden="true" />
            10K Claim Milestone
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <h2
              id="road-to-10k-title"
              className="font-baloo text-lg font-semibold leading-snug text-white sm:text-xl"
            >
              Unlock True Looper SuperLoop — Every claim counts!
            </h2>
            <ProfileDetails
              label="About True Looper rewards and eligibility"
              align="end"
              className="w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-border bg-card p-5 text-card-foreground"
              trigger={
                <button
                  type="button"
                  aria-label="About True Looper rewards and eligibility"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <LuInfo className="size-4" aria-hidden="true" />
                </button>
              }
            >
              <h3 className="font-baloo text-lg font-semibold">
                True Looper rewards
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                At 10,000 claims community reward milestone. A shared $50 USDC
                reward pool unlocks for eligible Loopers.
              </p>
              <p className="mt-4 border-t border-border pt-4 text-sm leading-6">
                <span className="font-semibold">Who qualifies?</span> Every
                Looper with 50+ claims in Gyralis. Eligibility is based on
                claims, not Gyra Points.
              </p>
            </ProfileDetails>
          </div>
        </div>

        <div className="relative grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-5">
          <div className={`${glass} min-w-0 p-[30px] text-foreground`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Total Claims
                </p>
                {total == null ? (
                  model.isPending || model.syncing ? (
                    <div
                      role="status"
                      aria-label="Loading community claim total"
                      className="mt-2 h-12 w-36 rounded-lg bg-muted motion-safe:animate-pulse"
                    />
                  ) : (
                    <p className="mt-1 font-baloo text-4xl text-muted-foreground">
                      —
                    </p>
                  )
                ) : (
                  <div className="mt-1 font-baloo text-4xl font-bold leading-none text-primary sm:text-5xl">
                    <span className="sr-only" role="status">
                      {format(total)} of {format(GOAL)} community claims
                      {model.pendingCount > 0
                        ? `, including ${model.pendingCount} awaiting total update`
                        : ""}
                      .
                    </span>
                    <RollingNumber value={total} reduced={reduced} />
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Goal
                </p>
                <p className="mt-1 font-baloo text-2xl font-semibold sm:text-3xl">
                  10K{" "}
                  <span className="text-xs font-medium uppercase text-foreground">
                    claims
                  </span>
                </p>
              </div>
            </div>
            <div className="min-h-[116px]">
              {total == null ? (
                model.isPending || model.syncing ? (
                  <div className="pt-16">
                    <div className="h-7 rounded-full bg-muted motion-safe:animate-pulse sm:h-9" />
                  </div>
                ) : (
                  <div className="flex min-h-[116px] items-center gap-3 text-sm text-muted-foreground">
                    <p>Couldn’t load claim total.</p>
                    <button
                      type="button"
                      onClick={() => void model.refresh()}
                      className="rounded-md px-2 py-1 font-medium text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Retry
                    </button>
                  </div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative mt-4 pt-12">
                    <motion.div
                      aria-hidden="true"
                      className="absolute top-0 z-10 rounded-xl bg-primary px-3 py-1 font-baloo text-lg font-bold leading-none text-slate-950 shadow-sm sm:text-xl"
                      initial={false}
                      animate={{ left: `${percent}%`, x: `${-percent}%` }}
                      transition={{
                        duration: reduced ? 0 : 0.55,
                        delay: reduced ? 0 : 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <RollingNumber value={total} reduced={reduced} />
                      <LuChevronDown
                        className="absolute -bottom-3 size-4 -translate-x-1/2 text-primary"
                        style={{ left: `${percent}%` }}
                        strokeWidth={4}
                      />
                      <AnimatePresence>
                        {bursts.map((id, index) => (
                          <motion.span
                            key={id}
                            className="pointer-events-none absolute -top-5 right-0 text-lg font-bold text-primary"
                            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                            animate={{
                              opacity: [0, 1, 1, 0],
                              y: reduced ? 0 : -18,
                            }}
                            transition={{ duration: 0.7, delay: index * 0.12 }}
                            onAnimationComplete={() =>
                              setBursts((current) =>
                                current.filter((item) => item !== id)
                              )
                            }
                          >
                            +1
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                    <div
                      role="progressbar"
                      aria-label="Road to 10,000 community claims"
                      aria-valuemin={0}
                      aria-valuemax={GOAL}
                      aria-valuenow={Math.min(total, GOAL)}
                      aria-valuetext={`${format(
                        total
                      )} claims, ${percent.toFixed(2)} percent of goal`}
                      className="h-7 rounded-full border border-border/60 bg-muted/50 p-1 sm:h-9"
                    >
                      <motion.div
                        className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(28,231,131,0.25)]"
                        initial={false}
                        animate={{ width: `${percent}%` }}
                        transition={{
                          duration: reduced ? 0 : 0.55,
                          delay: reduced ? 0 : 0.1,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex min-h-[20px] items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {complete ? (
                        <>
                          <LuCheck className="text-primary" />
                          10,000 claims reached!
                        </>
                      ) : total >= GOAL ? (
                        "Confirming milestone…"
                      ) : (
                        "Progress"
                      )}
                    </span>
                    <span className="tabular-nums">{percent.toFixed(2)}%</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <aside
            aria-label="Milestone reward and claim status"
            className={`${glass} flex flex-col justify-center p-[30px] text-center text-foreground`}
          >
            <p className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <LuLock className="size-4 shrink-0" aria-hidden="true" />
              TRUE LOOPER REWARDS
            </p>
            <p className="mt-2 font-baloo text-5xl font-bold leading-none text-secondary">
              $50 <span className="text-lg font-semibold">USDC</span>
            </p>
            <div className="mt-7 grid grid-cols-2 divide-x-[0.5px] divide-foreground/20 border-t-[0.5px] border-foreground/20 pt-5">
              <div className="pr-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Claims to go
                </p>
                <p className="mt-2 font-baloo text-2xl font-bold tabular-nums">
                  {total == null ? "—" : format(Math.max(0, GOAL - total))}
                </p>
              </div>
              <div className="pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Last checked
                </p>
                <p
                  className="mt-2 text-sm font-medium tabular-nums"
                  title={
                    model.data
                      ? `Subgraph checked ${new Date(
                          model.data.checkedAt
                        ).toLocaleString()}`
                      : undefined
                  }
                >
                  {updated}
                </p>
              </div>
            </div>
            {(model.syncing || delayed || model.isError) && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                {status}
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}
