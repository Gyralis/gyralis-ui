"use client"

import type { LoopCardData } from "@/data/loops-data"

import { LoopCardShell } from "../loop-card-shell"
import { LoopClaimAction } from "../sections/loop-claim-action"
import { useSuperLoopCardController } from "./use-super-loop-card-controller"

interface SuperLoopCardProps {
  loop: LoopCardData
}

export function SuperLoopCard({ loop }: SuperLoopCardProps) {
  const controller = useSuperLoopCardController(loop)

  return (
    <LoopCardShell
      action={
        <LoopClaimAction chainId={loop.chainId} model={controller.action} />
      }
      distribution={controller.distribution}
      isSuper
      loop={loop}
      loopers={controller.loopers}
      loopersModalEnabled={false}
      modal={{
        currentPeriod: controller.raw.currentPeriod,
        firstPeriodStart: controller.raw.settings?.firstPeriodStart,
        loopContractType: "superLoop",
        loopToken: controller.raw.settings?.token,
        periodLength: controller.raw.settings?.periodLength,
        refreshKey: controller.modalRefreshKey,
      }}
      period={controller.period}
    />
  )
}
