"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMuxVideos } from "@/components/mux-video-context"
import { MuxThumbnail } from "@/components/mux-thumbnail"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Film, Search, X, Upload, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClipVideoSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectVideo: (playbackId: string, duration?: number) => void
  clipTitle?: string
}

export function ClipVideoSelector({ isOpen, onClose, onSelectVideo, clipTitle }: ClipVideoSelectorProps) {
  const { videos, isLoading, fetchVideos } = useMuxVideos()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null)

  const filteredVideos = videos.filter(
    (video) =>
      video.status === "ready" &&
      (video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.playbackId.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSelect = (video: { playbackId: string; duration?: number }) => {
    setSelectedVideoId(video.playbackId)
    setTimeout(() => {
      onSelectVideo(video.playbackId, video.duration)
      onClose()
      setSelectedVideoId(null)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-zinc-900 rounded-xl w-full max-w-2xl border border-zinc-700 shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">Select Video for Clip</h2>
                {clipTitle && <p className="text-sm text-zinc-400 mt-0.5">Assigning to: {clipTitle}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-zinc-800 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-400 mb-2">No videos available</p>
                  <p className="text-sm text-zinc-500 mb-4">Upload videos to your Mux library first</p>
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 bg-transparent"
                    onClick={fetchVideos}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Refresh Library
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredVideos.map((video) => (
                    <motion.div
                      key={video.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative rounded-lg overflow-hidden cursor-pointer group border-2 transition-colors",
                        selectedVideoId === video.playbackId
                          ? "border-cyan-400"
                          : "border-transparent hover:border-zinc-600",
                      )}
                      onClick={() => handleSelect({ playbackId: video.playbackId, duration: video.duration })}
                    >
                      <div className="aspect-video bg-zinc-800">
                        <MuxThumbnail
                          playbackId={video.playbackId}
                          width={240}
                          height={135}
                          className="w-full h-full object-cover"
                          showDuration={true}
                          duration={video.duration}
                        />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-black" />
                          </div>
                        </div>
                      </div>

                      {/* Selected indicator */}
                      {selectedVideoId === video.playbackId && (
                        <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                          <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-black" />
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white truncate">{video.title || `Video ${video.id.slice(0, 8)}`}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-700 shrink-0">
              <p className="text-xs text-zinc-500">{filteredVideos.length} videos available</p>
              <Button variant="ghost" onClick={onClose} className="text-zinc-400">
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
