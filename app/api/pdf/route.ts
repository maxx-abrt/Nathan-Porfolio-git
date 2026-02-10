import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  try {
    const response = await fetch(url)

    if (!response.ok || !response.body) {
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 502 })
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 })
  }
}
