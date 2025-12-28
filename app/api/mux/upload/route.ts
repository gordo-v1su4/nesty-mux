import { NextResponse } from "next/server"
import { getMuxClient } from "@/lib/mux"

export async function POST(request: Request) {
  try {
    console.log("[v0] Mux upload route called")

    const mux = getMuxClient()

    if (!mux) {
      console.error("[v0] Mux client not available - check environment variables")
      return NextResponse.json(
        {
          error: "Mux not configured",
          message: "Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables in the Vars section.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { cors_origin } = body

    console.log("[v0] Creating Mux upload with CORS origin:", cors_origin)

    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      cors_origin: cors_origin || "*",
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "baseline",
      },
    })

    console.log("[v0] Mux upload created successfully:", upload.id)

    return NextResponse.json({
      uploadId: upload.id,
      uploadUrl: upload.url,
    })
  } catch (error) {
    console.error("[v0] Error creating Mux upload:", error)
    return NextResponse.json(
      { error: "Failed to create upload URL", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
