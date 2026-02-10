import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-static"

export async function GET() {
  return NextResponse.json({ error: "PDF proxy disabled in static export." }, { status: 404 })
}
