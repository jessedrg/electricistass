import { NextResponse } from "next/server"

// This route catches all old /problema/* URLs and returns 410 Gone
// This tells Google these pages no longer exist and should be removed from the index
export async function GET() {
  return new NextResponse("Esta pagina ya no existe", {
    status: 410,
    headers: {
      "X-Robots-Tag": "noindex",
    },
  })
}
