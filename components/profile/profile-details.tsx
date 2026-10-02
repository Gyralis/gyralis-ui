"use client"

import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/** Hover on desktop, tap/click to pin, or Enter/Space to open details. */
export function ProfileDetails({
  trigger,
  children,
  label,
  className,
  align = "center",
}: {
  trigger: ReactElement<HTMLAttributes<HTMLElement>>
  children: ReactNode
  label: string
  className?: string
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const pinned = useRef(false)
  const restoreFocus = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  function cancelClose() {
    clearTimeout(closeTimer.current)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  function scheduleClose() {
    cancelClose()
    closeTimer.current = setTimeout(() => {
      if (!pinned.current) setOpen(false)
    }, 150)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        cancelClose()
        pinned.current = next
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        {cloneElement(trigger, {
          role: "button",
          tabIndex: 0,
          "aria-label": label,
          onPointerEnter: (event) => {
            if (event.pointerType !== "mouse") return
            cancelClose()
            setOpen(true)
          },
          onPointerLeave: scheduleClose,
          onClick: (event) => {
            // Prevent Radix from closing a hover-open popover on the first tap/click.
            event.preventDefault()
            cancelClose()
            pinned.current = !pinned.current
            restoreFocus.current = pinned.current
            setOpen(pinned.current)
          },
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              event.currentTarget.click()
            }
          },
        })}
      </PopoverTrigger>
      <PopoverContent
        aria-label={label}
        side="bottom"
        align={align}
        sideOffset={8}
        className={className}
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
        onOpenAutoFocus={(event) => {
          if (!pinned.current) event.preventDefault()
        }}
        onCloseAutoFocus={(event) => {
          if (!restoreFocus.current) event.preventDefault()
          restoreFocus.current = false
        }}
      >
        {children}
      </PopoverContent>
    </Popover>
  )
}
