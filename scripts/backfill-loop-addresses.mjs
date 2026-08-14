#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { PrismaClient } from "@prisma/client"

const legacyLoopsById = new Map([
  [
    3,
    {
      chainId: 100,
      title: "1Hive Gardens",
      loopAddress: "0x8995641fb3e452bc1359e79a738a6de556015696",
    },
  ],
  [
    4,
    {
      chainId: 100,
      title: "Blockscout Merits",
      loopAddress: "0xab25dbafd11b1eb606b2455eecec67e6746e409b",
    },
  ],
  [
    5,
    {
      chainId: 8453,
      title: "SuperLoop Blockscout Merits",
      loopAddress: "0x42664386739efdd277fa1eb05658b562c3b804c0",
    },
  ],
])

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName)
  if (!existsSync(filePath)) return

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const equalsIndex = trimmed.indexOf("=")
    if (equalsIndex === -1) continue

    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) process.env[key] = value
  }
}

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
    verbose: argv.includes("--verbose"),
  }
}

function normalizeAddress(address) {
  return String(address).toLowerCase()
}

function getLoopMeta(doc) {
  const loopId = Number(doc.loopId)
  const meta = legacyLoopsById.get(loopId)

  if (!meta) return null
  if (Number(doc.chainId) !== meta.chainId) return null

  return meta
}

function getUserLoopStatsId(doc, loopAddress) {
  return [
    Number(doc.chainId),
    normalizeAddress(loopAddress),
    normalizeAddress(doc.userAddress),
  ].join("-")
}

function getLoopLeaderboardId(doc, loopAddress) {
  return `loop-${getUserLoopStatsId(doc, loopAddress)}`
}

function cleanReplacementDoc(doc, replacementId, loopAddress) {
  const replacement = {
    ...doc,
    _id: replacementId,
    loopAddress: normalizeAddress(loopAddress),
  }

  delete replacement.loopId

  return replacement
}

async function findLegacyDocs(prisma, collectionName) {
  const result = await prisma.$runCommandRaw({
    find: collectionName,
    batchSize: 1000,
    filter: {
      loopId: { $exists: true },
      $or: [{ loopAddress: { $exists: false } }, { loopAddress: null }],
    },
  })

  return result.cursor?.firstBatch ?? []
}

async function replaceLegacyDoc({
  prisma,
  collectionName,
  legacyDoc,
  replacementDoc,
}) {
  const existing = await prisma.$runCommandRaw({
    find: collectionName,
    filter: { _id: replacementDoc._id },
    limit: 1,
  })
  const existingDoc = existing.cursor?.firstBatch?.[0]

  if (existingDoc) {
    await prisma.$runCommandRaw({
      update: collectionName,
      updates: [
        {
          q: { _id: replacementDoc._id },
          u: { $set: replacementDoc },
          upsert: false,
        },
      ],
    })
  } else {
    await prisma.$runCommandRaw({
      insert: collectionName,
      documents: [replacementDoc],
    })
  }

  if (legacyDoc._id !== replacementDoc._id) {
    await prisma.$runCommandRaw({
      delete: collectionName,
      deletes: [{ q: { _id: legacyDoc._id }, limit: 1 }],
    })
  }
}

async function backfillCollection({
  prisma,
  collectionName,
  getReplacementId,
  apply,
  verbose,
}) {
  const legacyDocs = await findLegacyDocs(prisma, collectionName)
  const planned = []
  const skipped = []

  for (const doc of legacyDocs) {
    const meta = getLoopMeta(doc)

    if (!meta) {
      skipped.push({
        id: doc._id,
        loopId: doc.loopId,
        chainId: doc.chainId,
        reason: "No current loop metadata for loopId/chainId",
      })
      continue
    }

    const replacementId = getReplacementId(doc, meta.loopAddress)
    const replacementDoc = cleanReplacementDoc(
      doc,
      replacementId,
      meta.loopAddress
    )

    planned.push({
      legacyId: doc._id,
      replacementId,
      userAddress: doc.userAddress,
      loopId: doc.loopId,
      loopTitle: meta.title,
      loopAddress: meta.loopAddress,
      replacementDoc,
      legacyDoc: doc,
    })
  }

  if (verbose || !apply) {
    for (const item of planned) {
      console.log(
        `${collectionName}: ${item.legacyId} -> ${item.replacementId} (${item.loopTitle})`
      )
    }

    for (const item of skipped) {
      console.warn(
        `${collectionName}: skipped ${item.id} loopId=${item.loopId} chainId=${item.chainId}: ${item.reason}`
      )
    }
  }

  if (apply) {
    for (const item of planned) {
      await replaceLegacyDoc({
        prisma,
        collectionName,
        legacyDoc: item.legacyDoc,
        replacementDoc: item.replacementDoc,
      })
    }
  }

  return {
    collectionName,
    found: legacyDocs.length,
    planned: planned.length,
    skipped: skipped.length,
    applied: apply ? planned.length : 0,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  loadEnvFile(".env.local")
  loadEnvFile(".env")

  const prisma = new PrismaClient()

  try {
    const results = []

    results.push(
      await backfillCollection({
        prisma,
        collectionName: "UserLoopStats",
        getReplacementId: getUserLoopStatsId,
        apply: args.apply,
        verbose: args.verbose,
      })
    )

    results.push(
      await backfillCollection({
        prisma,
        collectionName: "LeaderboardEntry",
        getReplacementId: getLoopLeaderboardId,
        apply: args.apply,
        verbose: args.verbose,
      })
    )

    console.log(
      JSON.stringify(
        {
          mode: args.apply ? "apply" : "dry-run",
          results,
        },
        null,
        2
      )
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
