import { beforeEach, describe, expect, it, vi } from "vitest"

import { GET } from "./route"

const { getLatestActivity } = vi.hoisted(() => ({ getLatestActivity: vi.fn() }))
vi.mock("@/lib/activity/get-latest-activity", () => ({ getLatestActivity }))

const wallet = "0xe9dc34b67006db0910a9761cb031d4bde67dce23"
const loop = "0x8995641fb3e452bc1359e79a738a6de556015696"
const context = { params: { address: wallet } }
beforeEach(() => {
  getLatestActivity.mockReset()
  getLatestActivity.mockResolvedValue({ address: wallet, items: [] })
})

describe("wallet activity route", () => {
  it("allows a validated scoped refresh and keeps the response private", async () => {
    const response = await GET(
      new Request(
        `https://app.test/api/users/${wallet}/activity?scope=100:${loop}`
      ),
      context
    )
    expect(response.status).toBe(200)
    expect(getLatestActivity).toHaveBeenCalledWith(wallet, [
      { chainId: 100, loopAddress: loop },
    ])
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
  })

  it("keeps the full-wallet request available for opening or manual refresh", async () => {
    await GET(
      new Request(`https://app.test/api/users/${wallet}/activity`),
      context
    )
    expect(getLatestActivity).toHaveBeenCalledWith(wallet, undefined)
  })

  it.each([`999:${loop}`, `100:${wallet}`, "", `100:${loop}:extra`])(
    "rejects unsupported scope %s before fetching",
    async (scope) => {
      const response = await GET(
        new Request(
          `https://app.test/api/users/${wallet}/activity?scope=${scope}`
        ),
        context
      )
      expect(response.status).toBe(400)
      expect(getLatestActivity).not.toHaveBeenCalled()
    }
  )

  it("rejects invalid wallets before fetching", async () => {
    const response = await GET(
      new Request("https://app.test/api/users/bad/activity"),
      { params: { address: "bad" } }
    )
    expect(response.status).toBe(400)
    expect(getLatestActivity).not.toHaveBeenCalled()
  })
})
