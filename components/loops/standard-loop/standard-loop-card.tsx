"use client"

import type { LoopCardData } from "@/data/loops-data"

import { LoopCardShell } from "../loop-card-shell"
import { LoopClaimAction } from "../sections/loop-claim-action"
import { useStandardLoopCardController } from "./use-standard-loop-card-controller"

interface StandardLoopCardProps {
  loop: LoopCardData
}

export function StandardLoopCard({ loop }: StandardLoopCardProps) {
  const controller = useStandardLoopCardController(loop)

  return (
    <LoopCardShell
      action={
        <LoopClaimAction chainId={loop.chainId} model={controller.action} />
      }
      distribution={controller.distribution}
      isSuper={false}
      loop={loop}
      loopers={controller.loopers}
      modal={{
        currentPeriod: controller.raw.currentPeriod,
        firstPeriodStart: controller.raw.settings?.firstPeriodStart,
        loopContractType: "loop",
        loopToken: controller.raw.settings?.token,
        periodLength: controller.raw.settings?.periodLength,
        refreshKey: controller.modalRefreshKey,
      }}
      period={controller.period}
    />
  )
}
