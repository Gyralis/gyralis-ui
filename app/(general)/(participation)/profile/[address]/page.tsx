import { notFound } from "next/navigation"

import { getProfilePageData } from "@/lib/profile/get-profile-page-data"
import { ProfileSections } from "@/components/participation/profile-sections"
import { ProfileExploreLoops } from "@/components/profile/profile-explore-loops"
import {
  AchievementsSection,
  ProfilePageView,
} from "@/components/profile/profile-page-view"

export const dynamic = "force-dynamic"

export default async function ProfileAddressPage({
  params,
}: {
  params: { address: string }
}) {
  const data = await getProfilePageData(params.address)

  if (!data) notFound()

  return (
    <ProfileSections
      data={data}
      achievements={<AchievementsSection data={data} />}
      loops={<ProfileExploreLoops loops={data.loopStats} />}
    >
      <ProfilePageView data={data} />
    </ProfileSections>
  )
}
