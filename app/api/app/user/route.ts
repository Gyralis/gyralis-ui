// import { getIronSession } from "iron-session"

// import { SERVER_SESSION_SETTINGS } from "@/lib/session"

export async function GET() {
  return Response.json({ isLoggedIn: false })
}

// export async function GET_WITH_SESSION(req: Request) {
//   const res = new Response()
//   const session = await getIronSession(req, res, SERVER_SESSION_SETTINGS)

//   if (session.siwe) {
//     return new Response(
//       JSON.stringify({
//         address: session.siwe.address,
//         isLoggedIn: true,
//         isAdmin: session.isAdmin,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     )
//   } else {
//     return new Response(
//       JSON.stringify({
//         isLoggedIn: false,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     )
//   }
// }
