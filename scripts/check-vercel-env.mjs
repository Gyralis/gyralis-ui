const REQUIRED_VERCEL_ENV_VARS = [
  "DATABASE_URL",
  "GYRALIS_SUBGRAPH_URL",
  "GYRALIS_BASE_SUBGRAPH_URL",
  "GYRALIS_SUBGRAPH_CHAIN_ID",
  "BASE_RPC_URL",
  "CRON_SECRET",
  "NEXTAUTH_SECRET",
  "SCORING_SYNC_BATCH_SIZE",
]

if (process.env.VERCEL !== "1") {
  console.log("Skipping Vercel environment check outside Vercel.")
  process.exit(0)
}

const missingEnvVars = REQUIRED_VERCEL_ENV_VARS.filter(
  (name) => !process.env[name]?.trim()
)

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required Vercel environment variables: ${missingEnvVars.join(
      ", "
    )}`
  )
  process.exit(1)
}

console.log(
  `Required Vercel environment variables are set: ${REQUIRED_VERCEL_ENV_VARS.join(
    ", "
  )}`
)
