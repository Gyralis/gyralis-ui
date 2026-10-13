import { z } from "zod"

export const rwagmiAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/)
export const rwagmiRequestSchema = z.object({
  userAddress: rwagmiAddressSchema,
  tokenAddress: rwagmiAddressSchema,
})
const statusSchema = z.enum(["passed", "failed", "not_checked", "unavailable"])
const checksSchema = z.object({ passport: statusSchema, creator: statusSchema })
export const rwagmiResultSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    eligible: z.literal(true),
    checks: z.object({
      passport: z.literal("passed"),
      creator: z.literal("passed"),
    }),
  }),
  z.object({
    success: z.literal(false),
    eligible: z.literal(false),
    code: z.string(),
    error: z.string(),
    checks: checksSchema,
  }),
])
export type RwagmiChecks = z.infer<typeof checksSchema>
export type RwagmiResult = z.infer<typeof rwagmiResultSchema>
export const uncheckedRwagmiChecks: RwagmiChecks = {
  passport: "not_checked",
  creator: "not_checked",
}
