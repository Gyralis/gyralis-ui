import { z } from "zod"

export const totalClaimsSnapshotSchema = z.object({
  totalClaims: z.number().int().nonnegative().safe(),
  /** Time of the successful subgraph read, not the last claim or indexed block. */
  checkedAt: z.string().datetime(),
  indexedBlock: z.number().int().nonnegative().safe(),
})

export type TotalClaimsSnapshot = z.infer<typeof totalClaimsSnapshotSchema>
