import type { SectionState } from "./loop-section-types"

interface CreateLoopSectionStateParams<T> {
  data?: T
  error?: unknown
  errorMessage: string
  isFetching: boolean
  loadingMessage?: string
  retry: () => void
}

export function createLoopSectionState<T>({
  data,
  error,
  errorMessage,
  isFetching,
  loadingMessage,
  retry,
}: CreateLoopSectionStateParams<T>): SectionState<T> {
  if (data !== undefined) {
    return isFetching
      ? { status: "refreshing", data }
      : { status: "ready", data }
  }

  if (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : errorMessage,
      retry,
    }
  }

  return { status: "loading", message: loadingMessage }
}
