export type SectionState<T> =
  | { status: "loading"; message?: string }
  | { status: "ready"; data: T }
  | { status: "refreshing"; data: T }
  | { status: "error"; message: string; retry?: () => void }

export type LoopActionStatus =
  | "checking"
  | "enter"
  | "entering"
  | "entered"
  | "active"
  | "claimable"
  | "claiming"
  | "claimed"
  | "error"

export interface LoopActionTooltip {
  title: string
  description?: string
}

export interface LoopActionViewModel {
  status: LoopActionStatus
  label: string
  amountLabel?: string
  disabled: boolean
  isPending: boolean
  presentation?: "button" | "neutral" | "success"
  tooltip?: LoopActionTooltip
  execute: () => void | Promise<void>
}

export interface LoopDistributionViewData {
  animation?: PeriodRewardAnimationViewModel
  balanceDetail?: string
  balanceDetailLabel: string
  detail?: string
  isLoading?: boolean
  tooltip: string
  value: string
  valueUnit?: string
}

export interface PeriodRewardAnimationViewModel {
  enabled: boolean
  estimatedPeriodPayout: bigint
  periodLengthSeconds: bigint
  periodStartSeconds: bigint
  tokenDecimals: number
}

export interface LoopPeriodViewData {
  nextPeriodStart?: bigint
  onCountdownComplete?: () => void | Promise<void>
  timerTitle: string
}
