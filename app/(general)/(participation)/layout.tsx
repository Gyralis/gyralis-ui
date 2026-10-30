import { CardMotionProvider } from "@/components/participation/card-motion-preview"
import { ParticipationShell } from "@/components/participation/participation-shell"
import { SeasonProvider } from "@/components/participation/season-context"

export default function ParticipationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CardMotionProvider>
      <SeasonProvider>
        <ParticipationShell>{children}</ParticipationShell>
      </SeasonProvider>
    </CardMotionProvider>
  )
}
