import { FaFire, FaFireFlameCurved } from "react-icons/fa6"
import { GiFlame, GiFlameSpin } from "react-icons/gi"
import type { IconType } from "react-icons"

import { cn } from "@/lib/utils"

export const streakIconByMilestone: Record<number, IconType> = {
  3: FaFireFlameCurved,
  7: FaFire,
  14: GiFlame,
  30: GiFlameSpin,
}

export function getStreakMilestoneIcon(streak: number) {
  return streakIconByMilestone[streak] ?? FaFireFlameCurved
}

export interface StreakMilestoneIconProps {
  streak: number
  glowing?: boolean
  className?: string
  title?: string
}

export function StreakMilestoneIcon({
  streak,
  glowing = false,
  className,
  title,
}: StreakMilestoneIconProps) {
  const Icon = getStreakMilestoneIcon(streak)

  return (
    <Icon
      aria-hidden={title ? undefined : true}
      className={cn(
        glowing && "drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)]",
        className
      )}
      title={title}
    />
  )
}
