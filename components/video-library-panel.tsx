"use client"

import type React from "react"

import { useState } from "react"
import { useMuxVideos } from "@/components/mux-video-context"
import { MuxThumbnail } from "@/components/mux-thumbnail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Film, Search, RefreshCw, Plus, Loader2, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoLibraryPanelProps {
  onSelectVideo?: (video: { playbackId: string; duration?: number; title?: string }) => void
  className?: string
}

export function VideoLibraryPanel({ onSelectVideo, className }: VideoLibraryPanelProps) {
  const { videos, isLoading, error, fetchVideos, uploadVideo } = useMuxVideos()
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const filteredVideos = videos.filter(
    (video) =>
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.playbackId.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await uploadVideo(file, (progress) => {
        setUploadProgress(progress)
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        )
      case "preparing":
        return (
          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 text-xs">
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case "errored":
        return (
          <Badge variant="outline" className="text-red-400 border-red-400/30 text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className={cn("bg-zinc-900 rounded-lg border border-zinc-700 p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center">
          <Film className="w-4 h-4 mr-2 text-cyan-400" />
          Mux Video Library
        </h3>
        <Button variant="ghost" size="sm" onClick={fetchVideos} disabled={isLoading} className="text-zinc-400">
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* Upload Button */}
      <div className="mb-4">
        <label className="block">
          <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
          <Button
            variant="outline"
            className="w-full border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-cyan-400 bg-transparent"
            disabled={isUploading}
            asChild
          >
            <span className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading... {Math.round(uploadProgress)}%
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload to Mux
                </>
              )}
            </span>
          </Button>
        </label>
        {isUploading && (
          <div className="mt-2 w-full bg-zinc-700 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Video Grid */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading && videos.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No videos found</p>
            <p className="text-xs mt-1">Upload a video to get started</p>
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer transition-colors group"
              onClick={() =>
                video.status === "ready" &&
                onSelectVideo?.({
                  playbackId: video.playbackId,
                  duration: video.duration,
                  title: video.title,
                })
              }
            >
              <div className="relative shrink-0 rounded overflow-hidden">
                {video.status === "ready" ? (
                  <MuxThumbnail playbackId={video.playbackId} width={80} height={45} className="rounded" />
                ) : (
                  <div className="w-20 h-[45px] bg-zinc-700 flex items-center justify-center rounded">
                    <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{video.title || `Video ${video.id.slice(0, 8)}`}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(video.status)}
                  {video.duration && (
                    <span className="text-xs text-zinc-500">
                      {Math.floor(video.duration / 60)}:
                      {Math.floor(video.duration % 60)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                  )}
                </div>
              </div>

              {video.status === "ready" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectVideo?.({
                      playbackId: video.playbackId,
                      duration: video.duration,
                      title: video.title,
                    })
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
