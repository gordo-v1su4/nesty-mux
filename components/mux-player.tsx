"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MuxPlayerProps {
  playbackId: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  poster?: string
  thumbnailTime?: number
  className?: string
  aspectRatio?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
}

export function MuxPlayer({
  playbackId,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  poster,
  thumbnailTime = 0,
  className,
  aspectRatio = "16:9",
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}: MuxPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`
  const thumbnailUrl = poster || `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${thumbnailTime}`

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Load HLS.js for HLS playback
    const loadHls = async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = streamUrl
      } else {
        // Use HLS.js for other browsers
        const Hls = (await import("hls.js")).default
        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(streamUrl)
          hls.attachMedia(video)
        }
      }
    }

    loadHls()
  }, [streamUrl])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = Number.parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate aspect ratio padding
  const [ratioW, ratioH] = aspectRatio.split(":").map(Number)
  const paddingBottom = `${(ratioH / ratioW) * 100}%`

  return (
    <div className={cn("relative w-full bg-black rounded-lg overflow-hidden", className)}>
      <div style={{ paddingBottom }} className="relative">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          poster={thumbnailUrl}
          autoPlay={autoPlay}
          muted={isMuted}
          loop={loop}
          playsInline
          onPlay={() => {
            setIsPlaying(true)
            setIsLoading(false)
            onPlay?.()
          }}
          onPause={() => {
            setIsPlaying(false)
            onPause?.()
          }}
          onEnded={() => {
            setIsPlaying(false)
            onEnded?.()
          }}
          onTimeUpdate={(e) => {
            const time = e.currentTarget.currentTime
            setCurrentTime(time)
            onTimeUpdate?.(time)
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            setIsLoading(false)
          }}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}

        {/* Custom controls */}
        {controls && (
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
            {/* Progress bar */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer mb-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                </button>

                <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>

                <span className="text-white text-sm font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
