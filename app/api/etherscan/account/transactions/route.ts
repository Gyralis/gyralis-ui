import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Etherscan transactions proxy is not implemented",
    },
    { status: 501 }
  )
}
