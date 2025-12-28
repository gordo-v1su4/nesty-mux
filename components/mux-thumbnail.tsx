"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Film, Loader2 } from "lucide-react"

interface MuxThumbnailProps {
  playbackId: string
  time?: number
  width?: number
  height?: number
  alt?: string
  className?: string
  fitMode?: "preserve" | "stretch" | "crop" | "smartcrop" | "pad"
  showDuration?: boolean
  duration?: number
  onClick?: () => void
}

export function MuxThumbnail({
  playbackId,
  time = 0,
  width = 320,
  height = 180,
  alt = "Video thumbnail",
  className,
  fitMode = "smartcrop",
  showDuration,
  duration,
  onClick,
}: MuxThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=${width}&height=${height}&fit_mode=${fitMode}`

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (hasError) {
    return (
      <div
        className={cn("relative bg-muted flex items-center justify-center", className)}
        style={{ width, height }}
        onClick={onClick}
      >
        <Film className="w-8 h-8 text-muted-foreground" />
      </div>
    )
  }

  return (
    <div
      className={cn("relative overflow-hidden cursor-pointer group", className)}
      style={{ width, height }}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      )}

      <Image
        src={thumbnailUrl || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={cn("object-cover transition-transform group-hover:scale-105", isLoading && "opacity-0")}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        unoptimized
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/30 transition-colors" />

      {/* Duration badge */}
      {showDuration && duration && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded font-mono">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  )
}
