"use client"
import { MuxPlayer } from "@/components/mux-player"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Film } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPreviewPlayerProps {
  currentClip: {
    id: string
    playbackId?: string
    title: string
    duration: number
    sequence: string
  } | null
  isPlaying: boolean
  currentTime: number
  onPlay: () => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
  onTimeUpdate?: (time: number) => void
  className?: string
}

export function VideoPreviewPlayer({
  currentClip,
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onPrevious,
  onNext,
  onTimeUpdate,
  className,
}: VideoPreviewPlayerProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className={cn("bg-zinc-800 border-zinc-700", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Preview Player</h3>
          {currentClip && (
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
              {currentClip.id} - {currentClip.title}
            </Badge>
          )}
        </div>

        <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden">
          {currentClip?.playbackId ? (
            <MuxPlayer
              playbackId={currentClip.playbackId}
              autoPlay={isPlaying}
              muted={false}
              controls={false}
              className="w-full h-full"
              onPlay={onPlay}
              onPause={onPause}
              onTimeUpdate={(time) => onTimeUpdate?.(time / (currentClip.duration / 1000))}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <div className="text-center text-zinc-500">
                <Film className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No video selected</p>
                <p className="text-xs mt-1">Select a clip with a Mux video to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button variant="ghost" size="icon" onClick={onPrevious} className="text-zinc-400 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={isPlaying ? onPause : onPlay}
            className="bg-cyan-500 hover:bg-cyan-600 text-black"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={onNext} className="text-zinc-400 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        {/* Time display */}
        {currentClip && (
          <div className="text-center mt-2">
            <span className="text-xs text-zinc-400 font-mono">
              {formatTime(currentTime * (currentClip.duration / 1000))} / {formatTime(currentClip.duration / 1000)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
