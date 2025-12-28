import { NextResponse } from "next/server"
import { getMuxClient } from "@/lib/mux"

export async function POST(request: Request) {
  try {
    console.log("[Mux] Scrambled video upload route called")

    const mux = getMuxClient()

    if (!mux) {
      console.error("[Mux] Mux client not available - check environment variables")
      return NextResponse.json(
        {
          error: "Mux not configured",
          message: "Please add MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables",
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    const videoBlob = formData.get("video") as File

    if (!videoBlob) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 })
    }

    console.log("[Mux] Creating upload for scrambled video:", videoBlob.name, videoBlob.size)

    // Create a direct upload URL
    const upload = await mux.video.uploads.create({
      cors_origin: "*",
      new_asset_settings: {
        playback_policy: ["public"],
        encoding_tier: "baseline",
      },
    })

    console.log("[Mux] Upload URL created:", upload.id)

    // Upload the blob directly to Mux
    const uploadResponse = await fetch(upload.url, {
      method: "PUT",
      body: videoBlob,
      headers: {
        "Content-Type": videoBlob.type || "video/mp4",
      },
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Mux: ${uploadResponse.status}`)
    }

    console.log("[Mux] Video uploaded, waiting for processing...")

    // Poll for asset processing completion
    let assetId: string | null = null
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)) // Wait 5 seconds

      try {
        const uploadStatus = await mux.video.uploads.retrieve(upload.id)

        if (uploadStatus.asset_id) {
          assetId = uploadStatus.asset_id
          break
        }

        attempts++
      } catch (err) {
        console.error("[Mux] Error polling upload status:", err)
        attempts++
      }
    }

    if (!assetId) {
      return NextResponse.json(
        { error: "Video processing timeout", uploadId: upload.id },
        { status: 408 },
      )
    }

    // Get the asset details
    const asset = await mux.video.assets.retrieve(assetId)
    const playbackId = asset.playback_ids?.[0]?.id

    if (!playbackId) {
      return NextResponse.json({ error: "No playback ID available" }, { status: 500 })
    }

    console.log("[Mux] Scrambled video processed successfully:", {
      assetId,
      playbackId,
      duration: asset.duration,
      status: asset.status,
    })

    return NextResponse.json({
      assetId,
      playbackId,
      duration: asset.duration,
      status: asset.status,
    })
  } catch (error) {
    console.error("[Mux] Error uploading scrambled video:", error)
    return NextResponse.json(
      {
        error: "Failed to upload scrambled video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

