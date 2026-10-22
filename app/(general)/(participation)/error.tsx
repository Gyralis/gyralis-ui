"use client"

import Link from "next/link"

export default function ParticipationError({ reset }: { reset: () => void }) {
  return (
    <section className="p-empty">
      <h1>Participation data is unavailable</h1>
      <p>Please try again. You can still explore the Loop directory.</p>
      <div className="p-dialog-actions">
        <button type="button" className="p-button" onClick={reset}>
          Try again
        </button>
        <Link href="/loops" className="p-button secondary">
          Explore Loops
        </Link>
      </div>
    </section>
  )
}
