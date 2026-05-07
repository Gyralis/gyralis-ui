"use client"

import { useEffect, useRef, useState } from "react"
import type { ComponentType } from "react"
import { motion } from "framer-motion"
import {
  FaCalendarCheck,
  FaDoorOpen,
  FaExclamationTriangle,
} from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Modal, useModal } from "@/components/ui/modal"

type FlowState =
  | "ready-to-enter"
  | "ready-to-claim"
  | "claimed"
  | "missed"
  | "ready-to-claim-after-miss"

type PeriodCard = {
  label: "Previous Period" | "Current Period" | "Next Period"
  title: string
  description: string
  tone: "muted" | "primary" | "success" | "warning"
  icon: ComponentType<{ className?: string }>
}

const periodContent: Record<FlowState, PeriodCard[]> = {
  "ready-to-enter": [
    {
      label: "Previous Period",
      title: "No claim available",
      description:
        "Claims come from a period where you were already entered.",
      tone: "muted",
      icon: FaCalendarCheck,
    },
    {
      label: "Current Period",
      title: "Enter the Loop",
      description:
        "The loop checks your Human Passport score through the shield and registers you for the next period.",
      tone: "primary",
      icon: FaDoorOpen,
    },
    {
      label: "Next Period",
      title: "Your entry lands here",
      description:
        "Entering now never applies to the current period. It prepares your claim for the next 24-hour period.",
      tone: "muted",
      icon: FaCalendarCheck,
    },
  ],
  "ready-to-claim": [
    {
      label: "Previous Period",
      title: "You entered",
      description:
        "The period where you entered moved into the past, making the current period claimable.",
      tone: "success",
      icon: FaDoorOpen,
    },
    {
      label: "Current Period",
      title: "Claim now",
      description:
        "You can claim because you were entered for this period before it started.",
      tone: "primary",
      icon: FaCalendarCheck,
    },
    {
      label: "Next Period",
      title: "Not entered yet",
      description:
        "Claiming now will automatically enter you for the following period.",
      tone: "muted",
      icon: FaCalendarCheck,
    },
  ],
  claimed: [
    {
      label: "Previous Period",
      title: "Claim completed",
      description:
        "The last current period moved back after you claimed its distribution.",
      tone: "success",
      icon: FaCalendarCheck,
    },
    {
      label: "Current Period",
      title: "Claim now",
      description:
        "Your automatic entry is now current, so you can claim again in this period.",
      tone: "primary",
      icon: FaCalendarCheck,
    },
    {
      label: "Next Period",
      title: "Claiming enters next",
      description:
        "Each successful claim keeps the loop going by entering the following period.",
      tone: "muted",
      icon: FaDoorOpen,
    },
  ],
  missed: [
    {
      label: "Previous Period",
      title: "Claim missed",
      description:
        "The claimable period passed without a claim, so the automatic entry did not happen.",
      tone: "warning",
      icon: FaExclamationTriangle,
    },
    {
      label: "Current Period",
      title: "Enter again",
      description:
        "You need to enter again. That entry will apply to the next period, not this one.",
      tone: "primary",
      icon: FaDoorOpen,
    },
    {
      label: "Next Period",
      title: "Waiting for entry",
      description:
        "After entering again, this becomes the period where you can claim.",
      tone: "muted",
      icon: FaCalendarCheck,
    },
  ],
  "ready-to-claim-after-miss": [
    {
      label: "Previous Period",
      title: "You re-entered",
      description:
        "The recovery entry moved into the previous period as time advanced.",
      tone: "success",
      icon: FaDoorOpen,
    },
    {
      label: "Current Period",
      title: "Claim now",
      description:
        "You are claimable again because you entered before this period started.",
      tone: "primary",
      icon: FaCalendarCheck,
    },
    {
      label: "Next Period",
      title: "Claim continues the loop",
      description:
        "Claiming now will enter you automatically for the following period.",
      tone: "muted",
      icon: FaDoorOpen,
    },
  ],
}

export function HowLoopsWork({
  triggerLabel = "See How Loops Work",
  triggerClassName,
}: {
  triggerLabel?: string
  triggerClassName?: string
}) {
  const { isOpen, openModal, closeModal } = useModal()
  const [flowState, setFlowState] = useState<FlowState>("ready-to-enter")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationMessage, setSimulationMessage] = useState<string>()
  const simulationTimers = useRef<number[]>([])

  useEffect(() => {
    return () => {
      simulationTimers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const runSimulation = (
    messages: string[],
    nextState: FlowState,
    delay = 750
  ) => {
    if (isSimulating) return

    setIsSimulating(true)
    setSimulationMessage(messages[0])
    simulationTimers.current.forEach((timer) => window.clearTimeout(timer))

    const timers = messages.slice(1).map((message, index) =>
      window.setTimeout(() => setSimulationMessage(message), delay * (index + 1))
    )

    const finalTimer = window.setTimeout(() => {
      setFlowState(nextState)
      setIsSimulating(false)
      setSimulationMessage(undefined)
    }, delay * messages.length)

    simulationTimers.current = [...timers, finalTimer]
  }

  const handlePrimaryAction = () => {
    if (flowState === "ready-to-enter") {
      runSimulation(
        [
          "Checking the Human Passport shield...",
          "Registering your entry for the next period...",
          "The next 24-hour period is now current.",
        ],
        "ready-to-claim"
      )
      return
    }

    if (
      flowState === "ready-to-claim" ||
      flowState === "ready-to-claim-after-miss" ||
      flowState === "claimed"
    ) {
      runSimulation(
        [
          "Claiming the current period reward...",
          "Entering you automatically for the next period...",
          "The next 24-hour period is now current.",
        ],
        "claimed"
      )
      return
    }

    if (flowState === "missed") {
      runSimulation(
        [
          "Checking the loop shield again...",
          "Registering your new entry for the next period...",
          "The next 24-hour period is now current.",
        ],
        "ready-to-claim-after-miss"
      )
    }
  }

  const handleMissClaim = () => {
    runSimulation(
      [
        "Letting the claim window pass...",
        "Automatic entry stops because no claim happened.",
      ],
      "missed"
    )
  }

  const resetSimulation = () => {
    simulationTimers.current.forEach((timer) => window.clearTimeout(timer))
    simulationTimers.current = []
    setFlowState("ready-to-enter")
    setIsSimulating(false)
    setSimulationMessage(undefined)
  }

  const handleClose = () => {
    closeModal()
    resetSimulation()
  }

  return (
    <>
      <Button
        onClick={openModal}
        requireWallet={false}
        variant="secondary"
        className={
          triggerClassName ??
          "rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"
        }
      >
        {triggerLabel}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="full"
        title="How Loops Work"
        description="Enter now, claim in the next period, then claiming enters you for the following period."
        className="h-auto max-h-[78vh] gap-3 overflow-y-auto rounded-[1.25rem] p-5 font-body sm:p-6 lg:w-[50vw] lg:max-w-[50vw]"
        contentClassName="space-y-4 py-0"
        headerClassName="pr-8"
      >
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-foreground">
          You need to be verified in GyraHub and have enough Human Passport
          score to pass the loop shield. After that, loops work by periods:
          entering always prepares the next period, while claiming happens only
          once that entered period becomes current.
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <PeriodTimeline
            flowState={flowState}
            isSimulating={isSimulating}
          />

          <ActionPanel
            flowState={flowState}
            isSimulating={isSimulating}
            onMissClaim={handleMissClaim}
            onPrimaryAction={handlePrimaryAction}
            onReset={resetSimulation}
            simulationMessage={simulationMessage}
          />
        </div>

        <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
          This delay keeps distribution fair. The current period&apos;s claim is
          based on who was already entered before it started, so rewards can be
          split predictably among eligible humans.
        </div>
      </Modal>
    </>
  )
}

function PeriodTimeline({
  flowState,
  isSimulating,
}: {
  flowState: FlowState
  isSimulating: boolean
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="grid gap-3">
        {periodContent[flowState].map((period, index) => {
          const Icon = period.icon
          const isActive = period.tone === "primary"

          return (
            <motion.div
              key={`${flowState}-${period.label}`}
              layout
              className={`rounded-2xl border p-4 transition-colors ${getPeriodClass(
                period.tone
              )}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: isSimulating && isActive ? [0, -4, 0] : 0,
                scale: isActive ? 1.01 : 1,
              }}
              transition={{
                delay: index * 0.05,
                duration: 0.25,
                y: { repeat: isSimulating && isActive ? Infinity : 0 },
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ${getIconClass(
                    period.tone
                  )}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {period.label}
                  </p>
                  <h3 className="mt-1 font-heading text-lg text-foreground">
                    {period.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {period.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ActionPanel({
  flowState,
  isSimulating,
  onMissClaim,
  onPrimaryAction,
  onReset,
  simulationMessage,
}: {
  flowState: FlowState
  isSimulating: boolean
  onMissClaim: () => void
  onPrimaryAction: () => void
  onReset: () => void
  simulationMessage?: string
}) {
  const canMissClaim =
    flowState === "ready-to-claim" ||
    flowState === "ready-to-claim-after-miss" ||
    flowState === "claimed"

  return (
    <div className="rounded-2xl border border-border/70 bg-background/85 p-5 lg:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Try it
      </p>
      <h3 className="mt-2 font-heading text-xl text-foreground">
        {getPanelTitle(flowState)}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {isSimulating
          ? simulationMessage ?? "Updating the period state..."
          : getPanelCopy(flowState)}
      </p>

      <div className="mt-5 space-y-3">
        <Button
          onClick={onPrimaryAction}
          requireWallet={false}
          disabled={isSimulating}
          isLoading={isSimulating}
          className="w-full rounded-full px-4 py-3 text-sm font-semibold"
        >
          {isSimulating
            ? simulationMessage ?? "Loading..."
            : getPrimaryLabel(flowState)}
        </Button>

        {canMissClaim && !isSimulating ? (
          <Button
            onClick={onMissClaim}
            requireWallet={false}
            variant="secondary"
            className="w-full rounded-full border border-amber-400/70 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-400/20 dark:text-amber-300"
          >
            Miss claim
          </Button>
        ) : null}

        <Button
          onClick={onReset}
          requireWallet={false}
          variant="secondary"
          disabled={isSimulating}
          className="w-full rounded-full border border-border/70 px-4 py-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Restart route
        </Button>
      </div>
    </div>
  )
}

function getPrimaryLabel(flowState: FlowState) {
  switch (flowState) {
    case "ready-to-enter":
      return "Enter the Loop"
    case "ready-to-claim":
    case "ready-to-claim-after-miss":
    case "claimed":
      return "Claim now"
    case "missed":
      return "Enter again"
  }
}

function getPanelTitle(flowState: FlowState) {
  switch (flowState) {
    case "ready-to-enter":
      return "Start by entering"
    case "ready-to-claim":
    case "ready-to-claim-after-miss":
    case "claimed":
      return "Current period is claimable"
    case "missed":
      return "Missed claim recovery"
  }
}

function getPanelCopy(flowState: FlowState) {
  switch (flowState) {
    case "ready-to-enter":
      return "Click enter to pass the shield and register for the next 24-hour period."
    case "ready-to-claim":
      return "The entered period is now current. Claim now to receive rewards and enter the following period."
    case "ready-to-claim-after-miss":
      return "After re-entering, the next period is now current and claimable again."
    case "missed":
      return "Missing the claim means you are not automatically entered. Enter again to recover."
    case "claimed":
      return "You claimed successfully. The automatic entry has rolled forward into another claimable current period."
  }
}

function getPeriodClass(tone: PeriodCard["tone"]) {
  switch (tone) {
    case "primary":
      return "border-primary bg-primary/5"
    case "success":
      return "border-green-400/40 bg-green-400/5"
    case "warning":
      return "border-amber-400/50 bg-amber-400/10"
    case "muted":
      return "border-border/70 bg-background/85"
  }
}

function getIconClass(tone: PeriodCard["tone"]) {
  switch (tone) {
    case "primary":
      return "bg-primary text-primary-foreground"
    case "success":
      return "bg-green-500 text-white"
    case "warning":
      return "bg-amber-500 text-white"
    case "muted":
      return "bg-muted text-muted-foreground"
  }
}
