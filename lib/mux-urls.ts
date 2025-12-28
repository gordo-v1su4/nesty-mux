export function getMuxThumbnailUrl(
  playbackId: string,
  options?: {
    time?: number
    width?: number
    height?: number
    fit_mode?: "preserve" | "stretch" | "crop" | "smartcrop" | "pad"
  },
) {
  if (!playbackId) return ""

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
  if (!playbackId) return ""

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
  if (!playbackId) return ""
  return `https://image.mux.com/${playbackId}/storyboard.vtt`
}

// Get stream URL
export function getMuxStreamUrl(playbackId: string) {
  if (!playbackId) return ""
  return `https://stream.mux.com/${playbackId}.m3u8`
}
