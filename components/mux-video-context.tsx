"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { getMuxThumbnailUrl } from "@/lib/mux-urls"

export interface MuxVideo {
  id: string
  playbackId: string
  status: "preparing" | "ready" | "errored"
  duration?: number
  aspectRatio?: string
  createdAt?: string
  thumbnailUrl?: string
  title?: string
}

interface MuxVideoContextType {
  videos: MuxVideo[]
  isLoading: boolean
  error: string | null
  fetchVideos: () => Promise<void>
  uploadVideo: (file: File, onProgress?: (progress: number) => void) => Promise<MuxVideo | null>
  getVideoById: (id: string) => MuxVideo | undefined
  getVideoByPlaybackId: (playbackId: string) => MuxVideo | undefined
  getThumbnailUrl: (playbackId: string, time?: number, width?: number, height?: number) => string
  pollAssetStatus: (uploadId: string) => Promise<MuxVideo | null>
}

const MuxVideoContext = createContext<MuxVideoContextType | undefined>(undefined)

export function MuxVideoProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<MuxVideo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/mux/assets")
      if (!response.ok) {
        throw new Error("Failed to fetch videos")
      }

      const data = await response.json()
      setVideos(data.assets || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch videos")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const pollAssetStatus = useCallback(async (uploadId: string): Promise<MuxVideo | null> => {
    const maxAttempts = 60 // 5 minutes max
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/mux/assets?uploadId=${uploadId}`)
        const data = await response.json()

        if (data.status === "ready" && data.playbackId) {
          const newVideo: MuxVideo = {
            id: data.id,
            playbackId: data.playbackId,
            status: data.status,
            duration: data.duration,
            aspectRatio: data.aspectRatio,
            thumbnailUrl: data.thumbnailUrl,
          }

          setVideos((prev) => [...prev, newVideo])
          return newVideo
        }

        if (data.status === "errored") {
          throw new Error("Video processing failed")
        }

        // Wait 5 seconds before polling again
        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      } catch (err) {
        console.error("Polling error:", err)
        throw err
      }
    }

    throw new Error("Video processing timed out")
  }, [])

  const uploadVideo = useCallback(
    async (file: File, onProgress?: (progress: number) => void): Promise<MuxVideo | null> => {
      try {
        console.log("[v0] Starting upload for file:", file.name, file.type, file.size)

        // Get upload URL from Mux
        const uploadResponse = await fetch("/api/mux/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cors_origin: window.location.origin }),
        })

        console.log("[v0] Upload response status:", uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          console.error("[v0] Upload API error:", errorData)
          throw new Error(errorData.error || errorData.message || "Failed to create upload URL")
        }

        const { uploadId, uploadUrl } = await uploadResponse.json()
        console.log("[v0] Got upload URL, uploadId:", uploadId)

        // Upload file directly to Mux
        const xhr = new XMLHttpRequest()

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable && onProgress) {
              const progress = (e.loaded / e.total) * 100
              console.log("[v0] Upload progress:", progress.toFixed(1) + "%")
              onProgress(progress)
            }
          })

          xhr.addEventListener("load", () => {
            console.log("[v0] Upload completed with status:", xhr.status)
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => {
            console.error("[v0] XHR error during upload")
            reject(new Error("Upload failed"))
          })

          xhr.addEventListener("abort", () => {
            console.error("[v0] Upload aborted")
            reject(new Error("Upload aborted"))
          })

          xhr.open("PUT", uploadUrl)
          xhr.send(file)
        })

        console.log("[v0] Starting to poll asset status...")
        // Poll for asset status
        return await pollAssetStatus(uploadId)
      } catch (err) {
        console.error("[v0] Upload error:", err)
        const errorMessage = err instanceof Error ? err.message : "Upload failed"
        setError(errorMessage)
        return null
      }
    },
    [pollAssetStatus],
  )

  const getVideoById = useCallback(
    (id: string) => {
      return videos.find((v) => v.id === id)
    },
    [videos],
  )

  const getVideoByPlaybackId = useCallback(
    (playbackId: string) => {
      return videos.find((v) => v.playbackId === playbackId)
    },
    [videos],
  )

  const getThumbnailUrl = useCallback((playbackId: string, time?: number, width?: number, height?: number) => {
    return getMuxThumbnailUrl(playbackId, { time, width, height })
  }, [])

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  return (
    <MuxVideoContext.Provider
      value={{
        videos,
        isLoading,
        error,
        fetchVideos,
        uploadVideo,
        getVideoById,
        getVideoByPlaybackId,
        getThumbnailUrl,
        pollAssetStatus,
      }}
    >
      {children}
    </MuxVideoContext.Provider>
  )
}

export function useMuxVideos() {
  const context = useContext(MuxVideoContext)
  if (context === undefined) {
    throw new Error("useMuxVideos must be used within a MuxVideoProvider")
  }
  return context
}
