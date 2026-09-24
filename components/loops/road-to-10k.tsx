"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { LuCheck, LuFlag, LuRefreshCw } from "react-icons/lu"

import { useRoadTo10k } from "@/lib/hooks/app/use-road-to-10k"

const GOAL = 10_000
const milestones = [2500, 5000, 7500, GOAL]
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
          className={`relative inline-block h-[1.15em] overflow-hidden ${
            digit === "," ? "w-[0.28em]" : "w-[0.64em]"
          }`}
        >
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
    ? "Updating total…"
    : delayed
    ? "Total update delayed"
    : model.isError
    ? "Couldn’t refresh total"
    : model.data
    ? lastChecked(model.data.checkedAt, now)
    : "Couldn’t load claim total"

  return (
    <section
      aria-labelledby="road-to-10k-title"
      className="relative mx-auto mb-6 max-w-[560px] overflow-hidden rounded-3xl border border-border bg-card p-5 text-card-foreground sm:px-7 xl:max-w-[calc(1120px+1.5rem)]"
    >
      <AnimatePresence>
        {celebrating && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-primary bg-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.3 : 1.8 }}
            onAnimationComplete={() => setCelebrating(false)}
          />
        )}
      </AnimatePresence>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            id="road-to-10k-title"
            className="font-baloo text-lg font-bold uppercase tracking-[0.08em]"
          >
            Road to 10K
          </h2>
          <p className="text-sm text-muted-foreground">Every Claim Counts</p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Gnosis
        </span>
      </div>

      <div className="mt-4 min-h-[136px]">
        {total == null ? (
          model.isPending || model.syncing ? (
            <div
              role="status"
              aria-label="Loading community claim total"
              className="space-y-5 motion-safe:animate-pulse"
            >
              <div className="h-11 w-56 max-w-full rounded-lg bg-muted" />
              <div className="h-3 rounded-full bg-muted" />
              <div className="h-3 w-32 rounded bg-muted" />
            </div>
          ) : (
            <div className="flex min-h-[136px] items-center gap-3 text-sm text-muted-foreground">
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
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="sr-only" role="status">
                {format(total)} of {format(GOAL)} community claims
                {model.pendingCount > 0
                  ? `, including ${model.pendingCount} awaiting total update`
                  : ""}
                .
              </span>
              <div className="relative font-baloo text-[42px] font-bold leading-none sm:text-5xl">
                <RollingNumber value={total} reduced={reduced} />
                <AnimatePresence>
                  {bursts.map((id, index) => (
                    <motion.span
                      key={id}
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-8 -top-3 text-xl font-bold text-primary"
                      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                      animate={{ opacity: [0, 1, 1, 0], y: reduced ? 0 : -26 }}
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
              </div>
              <span
                aria-hidden="true"
                className="text-sm text-muted-foreground"
              >
                / 10,000 claims
              </span>
            </div>
            <div className="relative mt-3">
              <div
                role="progressbar"
                aria-label="Road to 10,000 community claims"
                aria-valuemin={0}
                aria-valuemax={GOAL}
                aria-valuenow={Math.min(total, GOAL)}
                aria-valuetext={`${format(total)} claims, ${percent.toFixed(
                  2
                )} percent of goal`}
                className="h-3 rounded-full bg-muted"
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
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-3"
              >
                {milestones.map((milestone) => (
                  <span
                    key={milestone}
                    className={`absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card ${
                      total >= milestone
                        ? "bg-primary"
                        : "bg-muted-foreground/40"
                    }`}
                    style={{
                      left: `${
                        milestone === GOAL ? 99.5 : (milestone / GOAL) * 100
                      }%`,
                    }}
                  />
                ))}
              </div>
              <div
                aria-hidden="true"
                className="relative mt-2 h-5 text-[10px] tabular-nums text-muted-foreground sm:text-xs"
              >
                {milestones.map((milestone) => (
                  <span
                    key={milestone}
                    className={`absolute ${
                      milestone === GOAL
                        ? "-translate-x-full"
                        : "-translate-x-1/2"
                    } ${total >= milestone ? "text-foreground" : ""}`}
                    style={{ left: `${(milestone / GOAL) * 100}%` }}
                  >
                    {milestone / 1000}K
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5 font-medium">
                {complete ? (
                  <>
                    <LuCheck className="text-primary" />
                    10,000 claims reached!
                  </>
                ) : total >= GOAL ? (
                  <>
                    <LuFlag className="text-primary" />
                    Confirming milestone…
                  </>
                ) : (
                  <>{format(Math.max(0, GOAL - total))} claims to go</>
                )}
              </span>
              <span className="tabular-nums text-muted-foreground">
                {percent.toFixed(2)}%
              </span>
            </div>
          </motion.div>
        )}
      </div>
      <div className="mt-3 flex min-h-[28px] items-center justify-between gap-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
        <span
          title={
            model.data
              ? `Subgraph checked ${new Date(
                  model.data.checkedAt
                ).toLocaleString()}`
              : undefined
          }
        >
          {status}
        </span>
        <button
          type="button"
          disabled={model.syncing}
          onClick={() => void model.refresh()}
          aria-label={
            delayed || model.isError
              ? "Retry claim total update"
              : "Refresh claim total"
          }
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-md px-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          <LuRefreshCw
            className={`size-3 ${
              model.syncing ? "motion-safe:animate-spin" : ""
            }`}
          />
          {delayed || model.isError ? "Retry" : "Refresh"}
        </button>
      </div>
    </section>
  )
}
