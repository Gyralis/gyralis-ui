import { notFound } from "next/navigation"

import { ProfilePageView } from "@/components/profile/profile-page-view"
import { getProfilePageData } from "@/lib/profile/get-profile-page-data"

export const dynamic = "force-dynamic"

export default async function ProfileAddressPage({
  params,
}: {
  params: { address: string }
}) {
  const data = await getProfilePageData(params.address)

  if (!data) notFound()

  return <ProfilePageView data={data} />
}
