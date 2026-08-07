interface GardensMembershipParams {
  subgraphEndpoint?: string
  communityAddress: string
  userAddress: string
}

interface GardensMembershipResponse {
  data?: { memberCommunities?: { memberAddress: string }[] }
  errors?: { message?: string }[]
}

export async function checkGardensMembership({
  subgraphEndpoint,
  communityAddress,
  userAddress,
}: GardensMembershipParams): Promise<boolean> {
  if (!subgraphEndpoint) {
    throw new Error("Gardens subgraph endpoint missing")
  }

  const query = `
    query CheckMembership(
      $communityAddress: String!
      $userAddress: String!
    ) {
      memberCommunities(
        first: 1
        where: {
          registryCommunity: $communityAddress
          memberAddress: $userAddress
        }
      ) {
        memberAddress
      }
    }
  `

  const response = await fetch(subgraphEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: {
        communityAddress: communityAddress.toLowerCase(),
        userAddress: userAddress.toLowerCase(),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gardens subgraph request failed (${response.status})`)
  }

  const json = (await response.json()) as GardensMembershipResponse
  if (json.errors?.length) {
    throw new Error(
      `Gardens subgraph query failed: ${
        json.errors[0]?.message ?? "Unknown error"
      }`
    )
  }

  return Boolean(json.data?.memberCommunities?.length)
}
