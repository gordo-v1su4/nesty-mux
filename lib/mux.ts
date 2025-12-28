import Mux from "@mux/mux-node"

// Initialize Mux client - only on server side
let muxClient: Mux | null = null

export function getMuxClient() {
  // Only initialize on server and when credentials exist
  if (typeof window !== "undefined") {
    return null
  }

  if (!muxClient) {
    const tokenId = process.env.MUX_TOKEN_ID
    const tokenSecret = process.env.MUX_TOKEN_SECRET

    if (!tokenId || !tokenSecret) {
      console.error("[v0] Mux credentials not configured")
      return null
    }

    try {
      muxClient = new Mux({
        tokenId,
        tokenSecret,
      })
    } catch (error) {
      console.error("[v0] Failed to initialize Mux client:", error)
      return null
    }
  }
  return muxClient
}

// Types for Mux assets
export interface MuxAsset {
  id: string
  playbackId: string
  status: "preparing" | "ready" | "errored"
  duration?: number
  aspectRatio?: string
  createdAt: string
  thumbnailUrl?: string
  posterUrl?: string
}

export interface MuxUploadResponse {
  uploadId: string
  uploadUrl: string
}

// Generate thumbnail URL from playback ID
export function getMuxThumbnailUrl(
  playbackId: string,
  options?: {
    time?: number
    width?: number
    height?: number
    fit_mode?: "preserve" | "stretch" | "crop" | "smartcrop" | "pad"
  },
) {
  const params = new URLSearchParams()
  if (options?.time !== undefined) params.set("time", options.time.toString())
  if (options?.width) params.set("width", options.width.toString())
  if (options?.height) params.set("height", options.height.toString())
  if (options?.fit_mode) params.set("fit_mode", options.fit_mode)

  const queryString = params.toString()
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? `?${queryString}` : ""}`
}

// Generate animated GIF URL from playback ID
export function getMuxGifUrl(
  playbackId: string,
  options?: {
    start?: number
    end?: number
    width?: number
    fps?: number
  },
) {
  const params = new URLSearchParams()
  if (options?.start !== undefined) params.set("start", options.start.toString())
  if (options?.end !== undefined) params.set("end", options.end.toString())
  if (options?.width) params.set("width", options.width.toString())
  if (options?.fps) params.set("fps", options.fps.toString())

  const queryString = params.toString()
  return `https://image.mux.com/${playbackId}/animated.gif${queryString ? `?${queryString}` : ""}`
}

// Generate storyboard URL for timeline thumbnails
export function getMuxStoryboardUrl(playbackId: string) {
  return `https://image.mux.com/${playbackId}/storyboard.vtt`
}

// Get stream URL
export function getMuxStreamUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`
}
