const MONGO_TIMEOUT_DEFAULTS = {
  serverSelectionTimeoutMS: "5000",
  connectTimeoutMS: "5000",
}

export function withMongoConnectionTimeouts(
  databaseUrl: string | undefined
): string | undefined {
  if (!databaseUrl) return databaseUrl

  let url: URL
  try {
    url = new URL(databaseUrl)
  } catch {
    return databaseUrl
  }

  if (!url.protocol.startsWith("mongodb")) return databaseUrl

  for (const [key, value] of Object.entries(MONGO_TIMEOUT_DEFAULTS)) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value)
    }
  }

  return url.toString()
}
