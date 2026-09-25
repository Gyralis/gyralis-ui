import type { ReactNode } from "react"

export function LoopInactiveOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-20 col-start-1 row-start-1 flex flex-col items-center justify-center bg-card/90 px-6 py-2 text-center text-card-foreground backdrop-blur-md dark:bg-background/80">
      {children}
    </div>
  )
}
