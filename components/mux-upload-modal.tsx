"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMuxVideos } from "@/components/mux-video-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Film, CheckCircle, Loader2, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface MuxUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onVideoUploaded?: (video: { playbackId: string; duration?: number; title?: string }) => void
}

export function MuxUploadModal({ isOpen, onClose, onVideoUploaded }: MuxUploadModalProps) {
  const { uploadVideo } = useMuxVideos()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [videoTitle, setVideoTitle] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "processing" | "complete" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ""))
      setErrorMessage(null)
    } else {
      setErrorMessage("Please drop a valid video file")
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ""))
      setErrorMessage(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus("uploading")
    setUploadProgress(0)
    setErrorMessage(null)

    try {
      const video = await uploadVideo(selectedFile, (progress) => {
        setUploadProgress(progress)
        if (progress >= 100) {
          setUploadStatus("processing")
        }
      })

      if (video) {
        setUploadStatus("complete")
        onVideoUploaded?.({
          playbackId: video.playbackId,
          duration: video.duration,
          title: videoTitle || video.title,
        })

        // Reset and close after a delay
        setTimeout(() => {
          handleReset()
          onClose()
        }, 1500)
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.")
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setVideoTitle("")
    setUploadProgress(0)
    setUploadStatus("idle")
    setErrorMessage(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-zinc-900 rounded-xl w-full max-w-lg border border-zinc-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Cloud className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Upload to Mux</h2>
                  <p className="text-xs text-zinc-400">Upload video for processing and streaming</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {uploadStatus === "complete" ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Complete!</h3>
                  <p className="text-sm text-zinc-400">Your video has been uploaded and is ready to use.</p>
                </motion.div>
              ) : (
                <>
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                      isDragging
                        ? "border-cyan-400 bg-cyan-400/10"
                        : selectedFile
                          ? "border-green-400/50 bg-green-400/5"
                          : "border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50",
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {selectedFile ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                          <Film className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                          <p className="text-xs text-zinc-400 mt-1">{formatFileSize(selectedFile.size)}</p>
                          <p className="text-xs text-green-400 mt-1">Ready to upload</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReset()
                          }}
                          className="text-zinc-400 hover:text-white shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className={cn("w-8 h-8", isDragging ? "text-cyan-400" : "text-zinc-500")} />
                        </div>
                        <p className="text-sm text-white mb-1">
                          {isDragging ? "Drop your video here" : "Drag and drop your video here"}
                        </p>
                        <p className="text-xs text-zinc-500">or click to browse files</p>
                        <p className="text-xs text-zinc-600 mt-3">Supports MP4, MOV, WebM, and more</p>
                      </>
                    )}
                  </div>

                  {/* Video Title */}
                  {selectedFile && (
                    <div className="mt-4">
                      <label className="text-sm text-zinc-400 mb-2 block">Video Title (optional)</label>
                      <Input
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Enter a title for your video"
                        className="bg-zinc-800 border-zinc-700 text-white"
                        disabled={uploadStatus !== "idle"}
                      />
                    </div>
                  )}

                  {/* Upload Progress */}
                  {(uploadStatus === "uploading" || uploadStatus === "processing") && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">
                          {uploadStatus === "uploading" ? "Uploading to Mux..." : "Processing video..."}
                        </span>
                        <span className="text-cyan-400 font-mono">
                          {uploadStatus === "uploading" ? `${Math.round(uploadProgress)}%` : "Please wait"}
                        </span>
                      </div>
                      <Progress value={uploadStatus === "processing" ? 100 : uploadProgress} className="h-2" />
                      {uploadStatus === "processing" && (
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Mux is processing your video for streaming...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-sm text-red-400">{errorMessage}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {uploadStatus !== "complete" && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-700">
                <Button variant="ghost" onClick={onClose} className="text-zinc-400" disabled={uploadStatus !== "idle"}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadStatus !== "idle"}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                >
                  {uploadStatus === "uploading" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadStatus === "processing" ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload to Mux
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
