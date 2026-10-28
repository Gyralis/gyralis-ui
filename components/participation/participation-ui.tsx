"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { LuArrowRight, LuSearch } from "react-icons/lu"

export function PageIntro({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="participation-page-intro">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  )
}

export function SectionTitle({
  title,
  href,
  label = "View all",
}: {
  title: string
  href?: string
  label?: string
}) {
  return (
    <div className="p-section-title">
      <h2>{title}</h2>
      {href && (
        <Link href={href}>
          {label}
          <LuArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

export function FilterTabs({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly string[]
  value: string
  onChange: (value: string) => void
  label: string
}) {
  return (
    <div className="p-tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          type="button"
          key={item}
          aria-pressed={value === item}
          className={value === item ? "is-active" : ""}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({
  value,
  label,
}: {
  value: number
  label: string
}) {
  const progress = Math.min(100, Math.max(0, value))
  return (
    <div
      className="p-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <span style={{ width: `${progress}%` }} />
    </div>
  )
}

export function EmptyState({
  title,
  description,
  onReset,
}: {
  title: string
  description: string
  onReset?: () => void
}) {
  return (
    <div className="p-empty">
      <LuSearch aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {onReset && (
        <button type="button" className="p-button secondary" onClick={onReset}>
          Clear filters
        </button>
      )}
    </div>
  )
}
