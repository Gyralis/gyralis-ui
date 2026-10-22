import { CardMotionProvider } from "@/components/participation/card-motion-preview"
import { ParticipationShell } from "@/components/participation/participation-shell"

export default function ParticipationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CardMotionProvider>
      <ParticipationShell>{children}</ParticipationShell>
    </CardMotionProvider>
  )
}
