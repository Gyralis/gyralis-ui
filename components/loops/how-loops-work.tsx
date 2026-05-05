"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  FaArrowRight,
  FaCalendarCheck,
  FaCheck,
  FaDoorOpen,
  FaExclamationTriangle,
  FaRedo,
  FaShieldAlt,
} from "react-icons/fa"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type StepId =
  | "shield"
  | "enter"
  | "claim-window"
  | "continue"
  | "missed"
  | "enter-again"
  | "claim-next"

type LoopStep = {
  id: StepId
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  tone?: "primary" | "warning" | "success"
}

const stepById: Record<StepId, LoopStep> = {
  shield: {
    id: "shield",
    title: "Pass the Shield",
    description:
      "Start verified in GyraHub with enough Human Passport score for this loop.",
    icon: FaShieldAlt,
  },
  enter: {
    id: "enter",
    title: "Enter",
    description:
      "Entering now registers you for the next 24-hour period, not the current one.",
    icon: FaDoorOpen,
  },
  "claim-window": {
    id: "claim-window",
    title: "Claim Window",
    description:
      "When that next period starts, you are entered in the current period and can claim.",
    icon: FaCalendarCheck,
  },
  continue: {
    id: "continue",
    title: "Continue",
    description:
      "Claiming automatically enters you into the following period, keeping you in the rhythm.",
    icon: FaRedo,
    tone: "success",
  },
  missed: {
    id: "missed",
    title: "Missed Claim",
    description:
      "If you miss your claim period, you are not carried forward automatically.",
    icon: FaExclamationTriangle,
    tone: "warning",
  },
  "enter-again": {
    id: "enter-again",
    title: "Enter Again",
    description:
      "Enter again to register for the next 24-hour period.",
    icon: FaDoorOpen,
    tone: "warning",
  },
  "claim-next": {
    id: "claim-next",
    title: "Claim Next Period",
    description:
      "When that period starts, you can claim again and continue from there.",
    icon: FaCalendarCheck,
    tone: "warning",
  },
}

const initialPath: StepId[] = ["shield", "enter", "claim-window"]
const claimPath: StepId[] = ["shield", "enter", "claim-window", "continue"]
const missedPath: StepId[] = [
  "shield",
  "enter",
  "claim-window",
  "missed",
  "enter-again",
  "claim-next",
  "continue",
]

export function HowLoopsWork({
  triggerLabel = "See How Loops Work",
  triggerClassName,
}: {
  triggerLabel?: string
  triggerClassName?: string
}) {
  const [activeStep, setActiveStep] = useState<StepId>("shield")
  const [path, setPath] = useState<StepId[]>(initialPath)
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    return () => setIsSimulating(false)
  }, [])

  const activeIndex = path.indexOf(activeStep)
  const isFinished =
    activeStep === "continue" && completedSteps.includes("continue")

  const steps = useMemo(() => path.map((stepId) => stepById[stepId]), [path])

  const advanceTo = (nextStep: StepId, nextPath = path) => {
    if (isSimulating) return

    setIsSimulating(true)
    window.setTimeout(() => {
      setPath(nextPath)
      setCompletedSteps((current) =>
        current.includes(activeStep) ? current : [...current, activeStep]
      )
      setActiveStep(nextStep)
      setIsSimulating(false)
    }, 1500)
  }

  const resetSimulation = () => {
    setPath(initialPath)
    setActiveStep("shield")
    setCompletedSteps([])
    setIsSimulating(false)
  }

  const handlePrimaryAction = () => {
    if (activeStep === "shield") {
      advanceTo("enter")
      return
    }

    if (activeStep === "enter") {
      advanceTo("claim-window")
      return
    }

    if (activeStep === "claim-window") {
      advanceTo("continue", claimPath)
      return
    }

    if (activeStep === "missed") {
      advanceTo("enter-again", missedPath)
      return
    }

    if (activeStep === "enter-again") {
      advanceTo("claim-next", missedPath)
      return
    }

    if (activeStep === "claim-next") {
      advanceTo("continue", missedPath)
      return
    }

    if (activeStep === "continue") {
      setCompletedSteps((current) =>
        current.includes("continue") ? current : [...current, "continue"]
      )
    }
  }

  const handleMissClaim = () => {
    advanceTo("missed", missedPath)
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetSimulation()
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            "inline-flex items-center justify-center rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          }
        >
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="h-auto max-h-[82vh] w-[98vw] max-w-[92rem] overflow-y-auto rounded-[1.25rem] p-6 sm:p-7">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            How Loops Work
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            Click through the route to see how entering, claiming, and missing a
            claim change what happens next.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold text-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>Enter now</span>
            <FaArrowRight className="size-3 text-primary" aria-hidden="true" />
            <span>claim next period</span>
            <FaArrowRight className="size-3 text-primary" aria-hidden="true" />
            <span>claiming enters the following period</span>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <InteractivePath
            activeIndex={activeIndex}
            activeStep={activeStep}
            completedSteps={completedSteps}
            isSimulating={isSimulating}
            steps={steps}
          />

          <ActionPanel
            activeStep={stepById[activeStep]}
            isFinished={isFinished}
            isSimulating={isSimulating}
            onMissClaim={handleMissClaim}
            onPrimaryAction={handlePrimaryAction}
            onReset={resetSimulation}
          />
        </div>

        <div className="rounded-2xl bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
          A loop needs entries before claims because each period&apos;s rewards
          are split among the users registered for that period. Entering first
          makes the next period&apos;s distribution predictable and fair.
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InteractivePath({
  activeIndex,
  activeStep,
  completedSteps,
  isSimulating,
  steps,
}: {
  activeIndex: number
  activeStep: StepId
  completedSteps: StepId[]
  isSimulating: boolean
  steps: LoopStep[]
}) {
  const progress =
    steps.length > 1 ? Math.max(0, activeIndex) / (steps.length - 1) : 0

  return (
    <div className="relative rounded-2xl border border-border/70 bg-background/70 p-4">
      <div className="absolute left-9 top-10 h-[calc(100%-5rem)] w-0.5 bg-border">
        <motion.div
          className="w-full bg-gradient-to-b from-primary via-secondary to-green-400"
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep
          const isComplete = completedSteps.includes(step.id)
          const isPending = index > activeIndex
          const isWarning = step.tone === "warning"
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              className={`relative flex gap-4 rounded-2xl border p-4 transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : isComplete
                  ? "border-green-400/40 bg-green-400/5"
                  : "border-border/70 bg-background/85"
              } ${isPending ? "opacity-60" : ""}`}
              animate={{
                scale: isActive && !isSimulating ? 1.02 : 1,
              }}
              transition={{ duration: 0.25 }}
            >
              <div
                className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full shadow-md ${
                  isComplete
                    ? "bg-green-500 text-white"
                    : isWarning
                    ? "bg-amber-500 text-white"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isComplete ? (
                  <FaCheck className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {isActive ? "Current step" : `Step ${index + 1}`}
                </p>
                <h3 className="mt-1 font-heading text-lg text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function ActionPanel({
  activeStep,
  isFinished,
  isSimulating,
  onMissClaim,
  onPrimaryAction,
  onReset,
}: {
  activeStep: LoopStep
  isFinished: boolean
  isSimulating: boolean
  onMissClaim: () => void
  onPrimaryAction: () => void
  onReset: () => void
}) {
  const primaryLabel = getPrimaryLabel(activeStep.id, isFinished)

  return (
    <div className="rounded-2xl border border-border/70 bg-background/85 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Try it
      </p>
      <h3 className="mt-2 font-heading text-xl text-foreground">
        {activeStep.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {isSimulating
          ? "Simulating the next period action..."
          : getActionCopy(activeStep.id, isFinished)}
      </p>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          onClick={isFinished ? onReset : onPrimaryAction}
          disabled={isSimulating}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSimulating ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
              Loading...
            </span>
          ) : (
            primaryLabel
          )}
        </button>

        {activeStep.id === "claim-window" && !isSimulating ? (
          <button
            type="button"
            onClick={onMissClaim}
            className="inline-flex w-full items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-400/20 dark:text-amber-300"
          >
            Miss claim
          </button>
        ) : null}

        {!isFinished ? (
          <button
            type="button"
            onClick={onReset}
            disabled={isSimulating}
            className="inline-flex w-full items-center justify-center rounded-full border border-border/70 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Restart route
          </button>
        ) : null}
      </div>
    </div>
  )
}

function getPrimaryLabel(stepId: StepId, isFinished: boolean) {
  if (isFinished) return "Restart route"

  switch (stepId) {
    case "shield":
      return "Pass shield"
    case "enter":
      return "Enter loop"
    case "claim-window":
      return "Claim"
    case "missed":
      return "Enter again"
    case "enter-again":
      return "Wait for next period"
    case "claim-next":
      return "Claim next period"
    case "continue":
      return "Complete route"
  }
}

function getActionCopy(stepId: StepId, isFinished: boolean) {
  if (isFinished) {
    return "You completed the route. Claiming keeps the loop going by entering you into the following period."
  }

  switch (stepId) {
    case "shield":
      return "Start by passing the loop shield with your GyraHub verification and Passport score."
    case "enter":
      return "Now enter the loop. Your entry will count for the next 24-hour period."
    case "claim-window":
      return "The next period has started. You can claim now, or see what happens if you miss it."
    case "missed":
      return "You missed the claim period, so the automatic continuation stopped."
    case "enter-again":
      return "Enter again to register for the next period."
    case "claim-next":
      return "That period is now active. Claim to continue the loop rhythm."
    case "continue":
      return "You claimed successfully and were entered into the following period."
  }
}
