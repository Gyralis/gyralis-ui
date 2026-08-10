interface LoopSectionErrorProps {
  label: string
  message: string
  onRetry?: () => void
}

export function LoopSectionError({
  label,
  message,
  onRetry,
}: LoopSectionErrorProps) {
  return (
    <div
      className="flex size-full min-h-[68px] flex-col items-center justify-center text-center"
      role="alert"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-destructive">{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-1.5 text-[11px] font-semibold text-primary underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
