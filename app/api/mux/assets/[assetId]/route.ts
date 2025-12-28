import { NextResponse } from "next/server"
import { getMuxClient, getMuxThumbnailUrl } from "@/lib/mux"

export async function GET(request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const mux = getMuxClient()

    if (!mux) {
      return NextResponse.json({ error: "Mux not configured" }, { status: 500 })
    }

    const { assetId } = await params
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
  } catch (error) {
    console.error("Error fetching Mux asset:", error)
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const mux = getMuxClient()

    if (!mux) {
      return NextResponse.json({ error: "Mux not configured" }, { status: 500 })
    }

    const { assetId } = await params
    await mux.video.assets.delete(assetId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting Mux asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
