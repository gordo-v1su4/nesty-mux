import { NextResponse } from "next/server"
import { getMuxClient } from "@/lib/mux"
import { getMuxThumbnailUrl } from "@/lib/mux-urls"

export async function GET(request: Request) {
  try {
    const mux = getMuxClient()

    if (!mux) {
      return NextResponse.json({
        assets: [],
        message: "Mux not configured - add MUX_TOKEN_ID and MUX_TOKEN_SECRET environment variables",
      })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get("uploadId")
    const assetId = searchParams.get("assetId")

    // If uploadId is provided, get the asset from the upload
    if (uploadId) {
      try {
        const upload = await mux.video.uploads.retrieve(uploadId)

        if (!upload.asset_id) {
          return NextResponse.json({
            status: "waiting",
            message: "Upload still processing",
          })
        }

        const asset = await mux.video.assets.retrieve(upload.asset_id)
        const playbackId = asset.playback_ids?.[0]?.id

        return NextResponse.json({
          id: asset.id,
          playbackId,
          status: asset.status,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
          thumbnailUrl: playbackId ? getMuxThumbnailUrl(playbackId) : undefined,
        })
      } catch (err) {
        console.error("[v0] Error fetching upload:", err)
        return NextResponse.json({ error: "Failed to fetch upload" }, { status: 500 })
      }
    }

    // If assetId is provided, get the asset directly
    if (assetId) {
      try {
        const asset = await mux.video.assets.retrieve(assetId)
        const playbackId = asset.playback_ids?.[0]?.id

        return NextResponse.json({
          id: asset.id,
          playbackId,
          status: asset.status,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
          thumbnailUrl: playbackId ? getMuxThumbnailUrl(playbackId) : undefined,
        })
      } catch (err) {
        console.error("[v0] Error fetching asset:", err)
        return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
      }
    }

    // List all assets
    try {
      const assets = await mux.video.assets.list({ limit: 100 })

      const formattedAssets = (assets.data || []).map((asset) => {
        const playbackId = asset.playback_ids?.[0]?.id
        return {
          id: asset.id,
          playbackId,
          status: asset.status,
          duration: asset.duration,
          aspectRatio: asset.aspect_ratio,
          createdAt: asset.created_at,
          thumbnailUrl: playbackId ? getMuxThumbnailUrl(playbackId) : undefined,
        }
      })

      return NextResponse.json({ assets: formattedAssets })
    } catch (err) {
      console.error("[v0] Error listing assets:", err)
      return NextResponse.json({ assets: [], error: "Failed to list assets" })
    }
  } catch (error) {
    console.error("[v0] Error in Mux assets route:", error)
    return NextResponse.json({ assets: [], error: "Failed to fetch assets" })
  }
}
