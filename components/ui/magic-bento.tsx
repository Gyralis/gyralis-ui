"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import { useCardMotion } from "@/components/participation/card-motion-preview"

// Adapted from the supplied MagicBento animation engine. Existing cards own their
// layout, links and buttons; this layer only provides decorative motion.
type Rect = { left: number; top: number; width: number; height: number }
type CardState = {
  rect: Rect
  hot: number
  press: number
  written: Map<string, string>
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value))

export default function MagicBento({
  children,
  className = "",
  spotlightRadius = 300,
  glowColor = "28, 231, 131",
}: {
  children: ReactNode
  className?: string
  spotlightRadius?: number
  glowColor?: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const { mode, replay, reducedMotion, finePointer } = useCardMotion()
  const enabled = mode !== "off" && !reducedMotion
  const radius = Math.max(40, spotlightRadius)

  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return
    const cards = new Map<HTMLElement, CardState>()
    const entrances = new Map<HTMLElement, Animation>()
    let rootRect: Rect = { left: 0, top: 0, width: 0, height: 0 }
    let raf = 0
    let last = 0
    let dirty = true
    let inView = false
    let active: HTMLElement | null = null
    let pressed: HTMLElement | null = null
    let lightX = 0
    let lightY = 0
    let targetX = 0
    let targetY = 0
    let near = 0
    let inside = false
    let wave: { x: number; y: number; start: number; reach: number } | null =
      null

    const write = (
      card: HTMLElement,
      state: CardState,
      name: string,
      value: string
    ) => {
      if (state.written.get(name) === value) return
      state.written.set(name, value)
      card.style.setProperty(name, value)
    }
    const clearStyles = (card: HTMLElement) => {
      for (const name of [
        "--mb-x",
        "--mb-y",
        "--mb-near",
        "--mb-hot",
        "--mb-press",
        "--mb-wx",
        "--mb-wy",
        "--mb-wr",
        "--mb-wa",
      ])
        card.style.removeProperty(name)
    }
    const measure = () => {
      dirty = false
      const box = root.getBoundingClientRect()
      rootRect = {
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
      }
      const elements = new Set(
        root.querySelectorAll<HTMLElement>("[data-magic-bento-card]")
      )
      for (const card of cards.keys())
        if (!elements.has(card)) {
          entrances.get(card)?.cancel()
          entrances.delete(card)
          clearStyles(card)
          cards.delete(card)
        }
      let index = 0
      for (const card of elements) {
        // All decorated cards are direct children. offset geometry stays stable
        // while the visual card plays its entrance or press feedback.
        const rect = {
          left: box.left + card.offsetLeft,
          top: box.top + card.offsetTop,
          width: card.offsetWidth,
          height: card.offsetHeight,
        }
        const state = cards.get(card)
        if (state) state.rect = rect
        else {
          cards.set(card, {
            rect,
            hot: 0,
            press: 1,
            written: new Map(),
          })
          if (inView && typeof card.animate === "function") {
            const animation = card.animate(
              [
                { opacity: 0, translate: "0 14px" },
                { opacity: 1, translate: "0 0" },
              ],
              {
                duration: 620,
                delay: Math.min(index, 6) * 75,
                easing: "cubic-bezier(.22,1,.36,1)",
                fill: "backwards",
              }
            )
            entrances.set(card, animation)
          }
        }
        index++
      }
    }

    const frame = (now: number) => {
      raf = 0
      if (!inView || document.hidden) return
      if (dirty) measure()
      const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60)
      last = now
      const follow = 1 - Math.exp(-dt / 0.055)
      lightX += (targetX - lightX) * follow
      lightY += (targetY - lightY) * follow
      near +=
        ((inside ? 1 : 0) - near) * (1 - Math.exp(-dt / (inside ? 0.12 : 0.32)))
      if (Math.abs((inside ? 1 : 0) - near) < 0.002) near = inside ? 1 : 0
      let busy =
        Math.abs(targetX - lightX) + Math.abs(targetY - lightY) > 0.3 ||
        (near !== 0 && near !== 1)
      const waveProgress = wave ? clamp((now - wave.start) / 1100, 0, 1) : 1
      const waveRadius = wave
        ? wave.reach * (1 - Math.pow(1 - waveProgress, 2.2))
        : 0
      const waveAlpha = wave ? Math.pow(1 - waveProgress, 1.3) : 0
      if (waveProgress < 1) busy = true

      for (const [card, state] of cards) {
        const { rect } = state
        const hovered = inside && card === active
        const settle = (key: "hot" | "press", target: number) => {
          state[key] += (target - state[key]) * (1 - Math.exp(-dt / 0.11))
          if (Math.abs(target - state[key]) < 0.002) state[key] = target
          else busy = true
        }
        settle("hot", hovered ? 1 : 0)
        settle("press", pressed === card ? 0.985 : 1)
        write(card, state, "--mb-x", `${(lightX - rect.left).toFixed(1)}px`)
        write(card, state, "--mb-y", `${(lightY - rect.top).toFixed(1)}px`)
        write(card, state, "--mb-near", near.toFixed(3))
        write(card, state, "--mb-hot", state.hot.toFixed(3))
        write(card, state, "--mb-press", state.press.toFixed(4))
        write(
          card,
          state,
          "--mb-wx",
          `${((wave?.x ?? rect.left) - rect.left).toFixed(1)}px`
        )
        write(
          card,
          state,
          "--mb-wy",
          `${((wave?.y ?? rect.top) - rect.top).toFixed(1)}px`
        )
        write(card, state, "--mb-wr", `${waveRadius.toFixed(1)}px`)
        write(card, state, "--mb-wa", waveAlpha.toFixed(3))
      }
      if (waveProgress === 1) wave = null
      if (busy) raf = requestAnimationFrame(frame)
    }
    const wake = () => {
      if (raf || !inView || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const cardFor = (target: EventTarget | null) => {
      const card =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-magic-bento-card]")
          : null
      return card && root.contains(card) ? card : null
    }
    const move = (event: PointerEvent) => {
      if (!finePointer || event.pointerType === "touch") return
      if (dirty) measure()
      const next = cardFor(event.target)
      active = next
      if (!inside) {
        lightX = event.clientX
        lightY = event.clientY
      }
      targetX = event.clientX
      targetY = event.clientY
      inside = true
      wake()
    }
    const leave = () => {
      inside = false
      active = null
      pressed = null
      wake()
    }
    const press = (event: PointerEvent) => {
      if (finePointer) {
        pressed = cardFor(event.target)
        wake()
      }
    }
    const release = () => {
      if (pressed) {
        pressed = null
        wake()
      }
    }
    const click = (event: MouseEvent) => {
      const card = cardFor(event.target)
      if (!card) return
      if (dirty) measure()
      const rect = cards.get(card)?.rect
      if (!rect) return
      const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX
      const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY
      const reach =
        Math.max(
          Math.hypot(x - rootRect.left, y - rootRect.top),
          Math.hypot(
            x - rootRect.left - rootRect.width,
            y - rootRect.top - rootRect.height
          )
        ) + 140
      wave = { x, y, start: performance.now(), reach }
      wake()
    }
    const focus = (event: FocusEvent) => {
      const card = cardFor(event.target)
      if (!card) return
      if (dirty) measure()
      const rect = cards.get(card)?.rect
      if (!rect) return
      active = card
      inside = true
      lightX = targetX = rect.left + rect.width / 2
      lightY = targetY = rect.top + rect.height / 2
      wake()
    }
    const blur = (event: FocusEvent) => {
      if (
        !(event.relatedTarget instanceof Node) ||
        !root.contains(event.relatedTarget)
      )
        leave()
    }
    const invalidate = () => {
      dirty = true
      wake()
    }
    const visibilityChanged = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
        pressed = null
        inside = false
        active = null
        for (const animation of entrances.values()) animation.finish()
      } else invalidate()
    }
    const resizeObserver = new ResizeObserver(invalidate)
    resizeObserver.observe(root)
    const mutationObserver = new MutationObserver(invalidate)
    mutationObserver.observe(root, { childList: true })
    const intersection = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting)
      if (inView) invalidate()
      else {
        cancelAnimationFrame(raf)
        raf = 0
        pressed = null
        inside = false
        active = null
      }
    })
    intersection.observe(root)
    root.addEventListener("pointermove", move, { passive: true })
    root.addEventListener("pointerleave", leave)
    root.addEventListener("pointerdown", press, { passive: true })
    root.addEventListener("click", click)
    root.addEventListener("focusin", focus)
    root.addEventListener("focusout", blur)
    window.addEventListener("pointerup", release, { passive: true })
    window.addEventListener("pointercancel", release, { passive: true })
    window.addEventListener("scroll", invalidate, {
      passive: true,
      capture: true,
    })
    window.addEventListener("gyralis:layout-change", invalidate)
    document.addEventListener("visibilitychange", visibilityChanged)
    wake()

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      intersection.disconnect()
      root.removeEventListener("pointermove", move)
      root.removeEventListener("pointerleave", leave)
      root.removeEventListener("pointerdown", press)
      root.removeEventListener("click", click)
      root.removeEventListener("focusin", focus)
      root.removeEventListener("focusout", blur)
      window.removeEventListener("pointerup", release)
      window.removeEventListener("pointercancel", release)
      window.removeEventListener("scroll", invalidate, { capture: true })
      window.removeEventListener("gyralis:layout-change", invalidate)
      document.removeEventListener("visibilitychange", visibilityChanged)
      for (const animation of entrances.values()) animation.cancel()
      for (const card of cards.keys()) clearStyles(card)
    }
  }, [enabled, finePointer, replay, radius])

  return (
    <div
      ref={rootRef}
      className={`magic-bento ${className}`}
      data-motion={enabled ? "" : undefined}
      style={
        {
          "--mb-glow-rgb": glowColor,
          "--mb-spot-size": `${radius}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
