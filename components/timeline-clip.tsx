"use client"

import { useState } from "react"
import { MuxThumbnail } from "@/components/mux-thumbnail"
import { Film } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineClipProps {
  clip: {
    id: string
    duration: number
    thumbnail?: string
    title: string
    sequence: string
    playbackId?: string
    thumbnailTime?: number // Time offset in seconds for Mux thumbnail
  }
  sequenceColor: {
    primary: string
    accent: string
    ring: string
    bg: string
    text: string
    dot: string
    badge: string
  }
  isSelected: boolean
  isPlaying: boolean
  width: number
  onClick: () => void
}

export function TimelineClip({ clip, sequenceColor, isSelected, isPlaying, width, onClick }: TimelineClipProps) {
  const [thumbnailError, setThumbnailError] = useState(false)

  // Use thumbnailTime from clip if available (for scrambled chunks), otherwise calculate middle of clip
  const thumbnailTime = clip.thumbnailTime !== undefined 
    ? clip.thumbnailTime 
    : (clip.duration ? clip.duration / 1000 / 2 : 0)

  const borderColor = sequenceColor.dot.replace("bg-", "border-")

  return (
    <div
      className={cn(
        "cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2",
        borderColor,
        isPlaying
          ? `ring-2 ${sequenceColor.ring} ring-offset-2 ring-offset-background`
          : isSelected
            ? `ring-1 ${sequenceColor.ring.replace("/60", "/40")}`
            : "hover:ring-1 hover:ring-border",
      )}
      style={{
        width: `${width}px`,
        height: "72px",
      }}
      onClick={onClick}
    >
      <div className={cn("relative h-full rounded-lg overflow-hidden", sequenceColor.bg)}>
        {/* Mux Thumbnail Background */}
        {clip.playbackId && !thumbnailError ? (
          <div className="absolute inset-0">
            <MuxThumbnail
              playbackId={clip.playbackId}
              time={thumbnailTime}
              width={Math.max(120, Math.round(width))}
              height={72}
              className="w-full h-full object-cover"
              fitMode="crop"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/70 via-background/20 to-background/40" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Film className="w-5 h-5 text-muted-foreground" />
          </div>
        )}

        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 bg-background/80 text-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
          {(clip.duration / 1000).toFixed(1)}s
        </div>

        {/* Clip ID and title */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <div className="flex items-center justify-between">
            <span className="text-primary-foreground text-xs font-bold drop-shadow-lg">{clip.id}</span>
          </div>
          {width > 100 && (
            <p className="text-primary-foreground/80 text-[10px] truncate mt-0.5 drop-shadow">{clip.title}</p>
          )}
        </div>
      </div>
    </div>
  )
}
