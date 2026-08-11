import { ParticipationSectionNav } from "@/components/layout/participation-section-nav"

export default function ParticipationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 text-foreground dark:from-background dark:via-background dark:to-background">
      <ParticipationSectionNav className="pt-8" />
      {children}
    </div>
  )
}
