"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { FlowNode } from "@/components/flow-node"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useMuxVideos } from "@/components/mux-video-context"
import { MuxPlayer } from "@/components/mux-player"
import { MuxThumbnail } from "@/components/mux-thumbnail"
import { VideoLibraryPanel } from "@/components/video-library-panel"
import { TimelineClip } from "@/components/timeline-clip"
import {
  Edit3,
  Plus,
  Film,
  Clock,
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FileText,
  Layers,
  Menu,
  Maximize2,
  Shuffle,
  Download,
  Upload,
  Video,
  PanelLeftClose,
  Minus,
} from "lucide-react"

const timelineData = [
  {
    id: "1A",
    duration: 2000,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Wide Shot - Launch Pad",
    sequence: "Opening Sequence",
    playbackId: "", // Will be populated when Mux video is added
  },
  {
    id: "2A",
    duration: 1500,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Close-up - Pilot",
    sequence: "Opening Sequence",
    playbackId: "",
  },
  {
    id: "2B",
    duration: 3000,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Rocket Ignition",
    sequence: "Opening Sequence",
    playbackId: "",
  },
  {
    id: "3A",
    duration: 2500,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Space Station Exterior",
    sequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "3B",
    duration: 1800,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Docking Sequence",
    sequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "4A",
    duration: 2200,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Alien Ship Approach",
    sequence: "First Contact",
    parentSequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "4B",
    duration: 1600,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "First Contact",
    sequence: "First Contact",
    parentSequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "4C",
    duration: 2800,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Communication",
    sequence: "First Contact",
    parentSequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "4D",
    duration: 1900,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Crew Reactions",
    sequence: "First Contact",
    parentSequence: "Space Station Arrival",
    playbackId: "",
  },
  {
    id: "5A",
    duration: 3200,
    thumbnail: "/placeholder.svg?height=80&width=120",
    title: "Space Battle",
    sequence: "First Contact",
    parentSequence: "Space Station Arrival",
    playbackId: "",
  },
]

// Enhanced mock data with sequence color coding
const mockData = {
  projects: [
    {
      id: "movie-1",
      title: "Stellar Odyssey",
      type: "Feature Film",
      thumbnail: "/placeholder.svg?height=200&width=300",
      status: "In Production",
      childCount: 12,
      description: "An epic space adventure following humanity's first interstellar voyage",
      aspectRatio: "16:9",
      timeline: timelineData,
      scenes: [
        {
          id: "scene-1",
          title: "Opening Sequence",
          description: "Earth departure scene",
          location: "Launch Facility",
          duration: 8.0,
          position: { x: 100, y: 100 },
          connections: ["scene-2"],
          timeline: timelineData.slice(0, 3),
          sequence: "Opening Sequence",
          shots: [
            {
              id: "shot-1-1",
              title: "Wide Shot - Launch Pad",
              description: "Establishing shot of the launch facility",
              duration: 8.0,
              cameraAngle: "Wide",
              notes: "Golden hour lighting preferred",
              position: { x: 50, y: 50 },
              connections: ["shot-1-2"],
              sequence: "Opening Sequence",
            },
            {
              id: "shot-1-2",
              title: "Close-up - Pilot",
              description: "Pilot's determined expression",
              duration: 8.0,
              cameraAngle: "Close-up",
              notes: "Focus on eyes, shallow depth of field",
              position: { x: 300, y: 50 },
              connections: [],
              sequence: "Opening Sequence",
            },
          ],
        },
        {
          id: "scene-2",
          title: "Space Station Arrival",
          description: "First glimpse of the massive space station",
          location: "Deep Space",
          duration: 8.0,
          position: { x: 400, y: 200 },
          connections: ["scene-3"],
          timeline: timelineData.slice(3, 5),
          sequence: "Space Station Arrival",
          shots: [],
        },
        {
          id: "scene-3",
          title: "First Contact",
          description: "Alien encounter sequence",
          location: "Alien Vessel",
          duration: 8.0,
          position: { x: 200, y: 350 },
          connections: [],
          timeline: timelineData.slice(5, 9),
          sequence: "First Contact",
          shots: [],
        },
      ],
    },
  ],
}

type ViewLevel = "projects" | "scenes" | "shots"
type ContentItem = any

const availableColorPalettes = [
  {
    name: "red",
    primary: "bg-sequence-red",
    accent: "border-sequence-red-light/30 bg-sequence-red-light/10",
    ring: "ring-sequence-red-light/60",
    bg: "bg-sequence-red-light/75",
    text: "text-sequence-red-light",
    dot: "bg-sequence-red-light",
    badge: "bg-sequence-red text-primary-foreground",
  },
  {
    name: "blue",
    primary: "bg-sequence-blue",
    accent: "border-sequence-blue-light/30 bg-sequence-blue-light/10",
    ring: "ring-sequence-blue-light/60",
    bg: "bg-sequence-blue-light/75",
    text: "text-sequence-blue-light",
    dot: "bg-sequence-blue-light",
    badge: "bg-sequence-blue text-primary-foreground",
  },
  {
    name: "green",
    primary: "bg-sequence-green",
    accent: "border-sequence-green-light/30 bg-sequence-green-light/10",
    ring: "ring-sequence-green-light/60",
    bg: "bg-sequence-green-light/75",
    text: "text-sequence-green-light",
    dot: "bg-sequence-green-light",
    badge: "bg-sequence-green text-primary-foreground",
  },
  {
    name: "yellow",
    primary: "bg-sequence-yellow",
    accent: "border-sequence-yellow-light/30 bg-sequence-yellow-light/10",
    ring: "ring-sequence-yellow-light/60",
    bg: "bg-sequence-yellow-light/75",
    text: "text-sequence-yellow-light",
    dot: "bg-sequence-yellow-light",
    badge: "bg-sequence-yellow text-primary-foreground",
  },
  {
    name: "purple",
    primary: "bg-sequence-purple",
    accent: "border-sequence-purple-light/30 bg-sequence-purple-light/10",
    ring: "ring-sequence-purple-light/60",
    bg: "bg-sequence-purple-light/75",
    text: "text-sequence-purple-light",
    dot: "bg-sequence-purple-light",
    badge: "bg-sequence-purple text-primary-foreground",
  },
  {
    name: "orange",
    primary: "bg-sequence-orange",
    accent: "border-sequence-orange-light/30 bg-sequence-orange-light/10",
    ring: "ring-sequence-orange-light/60",
    bg: "bg-sequence-orange-light/75",
    text: "text-sequence-orange-light",
    dot: "bg-sequence-orange-light",
    badge: "bg-sequence-orange text-primary-foreground",
  },
  {
    name: "cyan",
    primary: "bg-sequence-cyan",
    accent: "border-sequence-cyan-light/30 bg-sequence-cyan-light/10",
    ring: "ring-sequence-cyan-light/60",
    bg: "bg-sequence-cyan-light/75",
    text: "text-sequence-cyan-light",
    dot: "bg-sequence-cyan-light",
    badge: "bg-sequence-cyan text-primary-foreground",
  },
  {
    name: "pink",
    primary: "bg-sequence-pink",
    accent: "border-sequence-pink-light/30 bg-sequence-pink-light/10",
    ring: "ring-sequence-pink-light/60",
    bg: "bg-sequence-pink-light/75",
    text: "text-sequence-pink-light",
    dot: "bg-sequence-pink-light",
    badge: "bg-sequence-pink text-primary-foreground",
  },
]

const initialSequenceColors = {
  "Opening Sequence": {
    primary: "bg-sequence-red",
    accent: "border-sequence-red-light/30 bg-sequence-red-light/10",
    ring: "ring-sequence-red-light/60",
    bg: "bg-sequence-red-light/75",
    text: "text-sequence-red-light",
    dot: "bg-sequence-red-light",
    badge: "bg-sequence-red text-primary-foreground",
  },
  "Space Station Arrival": {
    primary: "bg-sequence-blue",
    accent: "border-sequence-blue-light/30 bg-sequence-blue-light/10",
    ring: "ring-sequence-blue-light/60",
    bg: "bg-sequence-blue-light/75",
    text: "text-sequence-blue-light",
    dot: "bg-sequence-blue-light",
    badge: "bg-sequence-blue text-primary-foreground",
  },
  "First Contact": {
    primary: "bg-sequence-green",
    accent: "border-sequence-green-light/30 bg-sequence-green-light/10",
    ring: "ring-sequence-green-light/60",
    bg: "bg-sequence-green-light/75",
    text: "text-sequence-green-light",
    dot: "bg-sequence-green-light",
    badge: "bg-sequence-green text-primary-foreground",
  },
}

interface NodeConnection {
  from: string
  to: string
}

const getSequenceColor = (sequenceName: string | undefined, colorMap: Record<string, any>) => {
  if (!sequenceName) {
    return availableColorPalettes[0]
  }
  return colorMap[sequenceName] || getNextAvailableColor(colorMap)
}

const getNextAvailableColor = (colorMap: Record<string, any>) => {
  const usedColors = Object.values(colorMap).map((color) => color.primary)
  const availableColor = availableColorPalettes.find((palette) => !usedColors.includes(palette.primary))
  return availableColor || availableColorPalettes[Object.keys(colorMap).length % availableColorPalettes.length]
}

export default function NestedCanvas() {
  const [mounted, setMounted] = useState(false)
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("projects")
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [currentData, setCurrentData] = useState<ContentItem[]>(mockData.projects)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [currentTimeline, setCurrentTimeline] = useState(timelineData)
  const [selectedClipIndex, setSelectedClipIndex] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [timelineZoom, setTimelineZoom] = useState(1)
  const [showBoardDrawer, setShowBoardDrawer] = useState(true)
  const [showVideoLibrary, setShowVideoLibrary] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showNewSequenceModal, setShowNewSequenceModal] = useState(false)
  const [newSequenceName, setNewSequenceName] = useState("")
  const [newSequenceColor, setNewSequenceColor] = useState("cyan")

  const [canvasZoom, setCanvasZoom] = useState(1)
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [isScrambling, setIsScrambling] = useState(false)
  const [scramblingProgress, setScramblingProgress] = useState(0)
  const [scrambledVideoUrl, setScrambledVideoUrl] = useState<string | null>(null)
  const [scrambledPlaybackId, setScrambledPlaybackId] = useState<string | null>(null)
  const [scrambledAssetId, setScrambledAssetId] = useState<string | null>(null)
  const [scrambledChunkTimes, setScrambledChunkTimes] = useState<number[]>([])
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)

  const [chunkDuration, setChunkDuration] = useState(1.0)
  const [chunkVariance, setChunkVariance] = useState(0)
  const [scrambledChunks, setScrambledChunks] = useState<ImageData[][]>([])
  const [scrambledChunkDurations, setScrambledChunkDurations] = useState<number[]>([])
  const [showFrames, setShowFrames] = useState(false)

  const [sequenceColors, setSequenceColors] = useState<Record<string, any>>(initialSequenceColors)

  const { videos: muxVideos } = useMuxVideos()

  const isCanvasMode = currentLevel === "scenes" || currentLevel === "shots"

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug: Log when currentData or currentLevel changes
  useEffect(() => {
    console.log("[Debug] State changed:", {
      currentLevel,
      currentDataLength: currentData.length,
      currentDataIds: currentData.map((item: any) => item.id),
      isCanvasMode,
      // Note: flowNodes is derived from currentData, so currentData.length is sufficient
    })
  }, [currentLevel, currentData, isCanvasMode])

  // Calculate total timeline duration
  const totalDuration = currentTimeline.reduce((sum, clip) => sum + clip.duration, 0)

  // Timeline scale: pixels per millisecond (1.5x bigger)
  // Handle totalDuration = 0 to prevent division by zero
  const timelineScale = totalDuration > 0 ? (1200 * timelineZoom) / totalDuration : 0

  // Calculate current time position across all clips
  const getCurrentTimePosition = () => {
    let accumulatedTime = 0
    for (let i = 0; i < selectedClipIndex; i++) {
      accumulatedTime += currentTimeline[i].duration
    }
    return accumulatedTime + (currentTime * currentTimeline[selectedClipIndex]?.duration || 0)
  }

  // Get clip start time
  const getClipStartTime = (clipIndex: number) => {
    let startTime = 0
    for (let i = 0; i < clipIndex; i++) {
      startTime += currentTimeline[i].duration
    }
    return startTime
  }

  // Format time for display (real-time format)
  const formatTime = (milliseconds: number) => {
    if (showFrames) {
      const frameNumber = Math.floor((milliseconds / 1000) * 24)
      return `${frameNumber}f`
    }
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const frames = Math.floor((milliseconds % 1000) / (1000 / 24))
    return `${minutes}:${seconds.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  // Generate time markers with better spacing for real-time
  const generateTimeMarkers = () => {
    const markers = []
    // Add this check:
    if (totalDuration === 0 || timelineScale === 0) {
      return markers // Return empty array if no duration or scale
    }

    const markerInterval = Math.max(1000, 2000 / timelineZoom)
    const totalTime = totalDuration

    for (let time = 0; time <= totalTime; time += markerInterval) {
      markers.push({
        time,
        position: time * timelineScale,
        label: formatTime(time),
      })
    }
    return markers
  }

  // Simulate video playback
  useEffect(() => {
    if (!mounted) return

    let interval: NodeJS.Timeout
    if (isPlaying) {
      const currentClip = currentTimeline[selectedClipIndex]
      if (currentClip) {
        const timeIncrement = 50 / currentClip.duration

        interval = setInterval(() => {
          setCurrentTime((prev) => {
            const newTime = prev + timeIncrement
            if (newTime >= 1) {
              if (selectedClipIndex < currentTimeline.length - 1) {
                setSelectedClipIndex(selectedClipIndex + 1)
                return 0
              } else {
                setIsPlaying(false)
                return 0
              }
            }
            return newTime
          })
        }, 50)
      }
    }
    return () => clearInterval(interval)
  }, [isPlaying, selectedClipIndex, currentTimeline, mounted])

  useEffect(() => {
    if (!mounted) return

    const handleMouseMove = (e: MouseEvent) => {
      if (connectingFrom && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - rect.left - canvasPan.x) / canvasZoom,
          y: (e.clientY - rect.top - canvasPan.y) / canvasZoom,
        })
      }

      if (isPanning && canvasRef.current) {
        const deltaX = e.clientX - panStart.x
        const deltaY = e.clientY - panStart.y
        setCanvasPan({
          x: canvasPan.x + deltaX,
          y: canvasPan.y + deltaY,
        })
        setPanStart({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      setIsPanning(false)
    }

    if (connectingFrom || isPanning) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [connectingFrom, mounted, canvasZoom, canvasPan, isPanning, panStart])

  const scrambleTimeline = () => {
    // Create a copy of the current timeline
    const scrambled = [...currentTimeline]

    // Fisher-Yates shuffle algorithm for true randomization
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = scrambled[i]
      scrambled[i] = scrambled[j]
      scrambled[j] = temp
    }

    // Update the timeline with scrambled order
    setCurrentTimeline(scrambled)

    // Reset playback to the first clip
    setSelectedClipIndex(0)
    setCurrentTime(0)
    setIsPlaying(false)
  }

  const downloadScrambledTimeline = () => {
    const timelineExport = {
      title: selectedItem?.title || "Scrambled Timeline",
      totalDuration: totalDuration,
      clipCount: currentTimeline.length,
      clips: currentTimeline.map((clip, index) => ({
        order: index + 1,
        id: clip.id,
        title: clip.title,
        sequence: clip.sequence,
        duration: clip.duration,
        durationSeconds: (clip.duration / 1000).toFixed(2),
        playbackId: clip.playbackId || null,
      })),
      exportDate: new Date().toISOString(),
    }

    // Create a blob and download link
    const blob = new Blob([JSON.stringify(timelineExport, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `scrambled-timeline-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const addMuxVideoToClip = (clipIndex: number, playbackId: string, duration?: number) => {
    setCurrentTimeline((prev) => {
      const updated = [...prev]
      updated[clipIndex] = {
        ...updated[clipIndex],
        playbackId,
        duration: duration ? duration * 1000 : updated[clipIndex].duration,
      }
      return updated
    })
  }

  const addMuxVideoAsNewClip = (video: { playbackId: string; duration?: number; title?: string }) => {
    const existingSequences = new Set(currentTimeline.map((clip) => clip.sequence))
    let sequenceNumber = 1
    let sequenceName = `Mux Video ${sequenceNumber}`
    while (existingSequences.has(sequenceName)) {
      sequenceNumber++
      sequenceName = `Mux Video ${sequenceNumber}`
    }

    const newClip = {
      id: `MUX-${currentTimeline.length + 1}`,
      duration: video.duration ? video.duration * 1000 : 5000,
      thumbnail: "",
      title: video.title || `Mux Video ${currentTimeline.length + 1}`,
      sequence: sequenceName,
      playbackId: video.playbackId,
    }

    setCurrentTimeline((prev) => [...prev, newClip])
  }

  const navigateToLevel = async (item: ContentItem, level: ViewLevel) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newPath = [...currentPath, item.title]
    setCurrentPath(newPath)
    setCurrentLevel(level)
    setSelectedItem(item)

    console.log("[Navigate] Navigating to level:", level, "Item:", item.id, item.title)

    if (level === "scenes") {
      // Navigating into a project to see its scenes
      setCurrentData(item.scenes || [])
      // Keep showing project timeline at scenes level (will show scene timeline when navigating into a scene)
      setCurrentTimeline(item.timeline || timelineData)
      setSelectedClipIndex(0)
      const sceneConnections: NodeConnection[] = []
      item.scenes?.forEach((scene: any) => {
        scene.connections?.forEach((targetId: string) => {
          sceneConnections.push({ from: scene.id, to: targetId })
        })
      })
      setConnections(sceneConnections)
      console.log("[Navigate] Set scenes data:", item.scenes?.length || 0, "scenes")
    } else if (level === "shots") {
      // Navigating into a scene to see its shots - show THIS scene's timeline
      setCurrentData(item.shots || [])
      // Show the scene's timeline, not the project timeline
      setCurrentTimeline(item.timeline || [])
      setSelectedClipIndex(0)
      const shotConnections: NodeConnection[] = []
      item.shots?.forEach((shot: any) => {
        shot.connections?.forEach((targetId: string) => {
          shotConnections.push({ from: shot.id, to: targetId })
        })
      })
      setConnections(shotConnections)
      console.log("[Navigate] Set shots data:", item.shots?.length || 0, "shots, timeline:", item.timeline?.length || 0, "clips")
    } else if (level === "projects") {
      setCurrentData(mockData.projects)
      setCurrentTimeline(timelineData)
      setSelectedItem(null)
      setCurrentPath([])
      setSelectedClipIndex(0)
      setConnections([])
    }

    setIsLoading(false)
  }

  const navigateBack = async (index?: number) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    if (index !== undefined) {
      const newPath = currentPath.slice(0, index + 1)
      setCurrentPath(newPath)

      if (index === 0) {
        setCurrentLevel("scenes")
        const project = mockData.projects.find((p) => p.title === currentPath[0])
        setCurrentData(project?.scenes || [])
        setCurrentTimeline(project?.timeline || timelineData)
        setSelectedItem(project || null)
        setSelectedClipIndex(0)
      } else if (index === -1) {
        setCurrentLevel("projects")
        setCurrentPath([])
        setCurrentData(mockData.projects)
        setCurrentTimeline(timelineData)
        setSelectedItem(null)
        setSelectedClipIndex(0)
      }
    } else {
      if (currentLevel === "shots") {
        setCurrentLevel("scenes")
        const project = mockData.projects.find((p) => p.title === currentPath[0])
        setCurrentData(project?.scenes || [])
        setCurrentTimeline(project?.timeline || timelineData)
        setSelectedItem(project || null)
        setCurrentPath(currentPath.slice(0, -1))
        setSelectedClipIndex(0)
      } else if (currentLevel === "scenes") {
        setCurrentLevel("projects")
        setCurrentData(mockData.projects)
        setCurrentTimeline(timelineData)
        setSelectedItem(null)
        setCurrentPath([])
        setSelectedClipIndex(0)
      }
    }

    setIsLoading(false)
  }

  const handleNodeDragEnd = (itemId: string, info: PanInfo, position: { x: number; y: number }) => {
    setIsDragging(null)

    const newX = position.x + info.offset.x / canvasZoom
    const newY = position.y + info.offset.y / canvasZoom

    setCurrentData((prevData) =>
      prevData.map((item) => (item.id === itemId ? { ...item, position: { x: newX, y: newY } } : item)),
    )
  }

  const startConnection = (fromId: string) => {
    setConnectingFrom(fromId)
  }

  const completeConnection = (toId: string) => {
    if (connectingFrom && connectingFrom !== toId) {
      const connectionExists = connections.some((conn) => conn.from === connectingFrom && conn.to === toId)

      if (!connectionExists) {
        setConnections((prev) => [...prev, { from: connectingFrom, to: toId }])
      }
    }
    setConnectingFrom(null)
  }

  // React Flow node types (defined after navigateToLevel and startConnection)
  const nodeTypes = useMemo(() => ({ flowNode: FlowNode }), [])

  // Convert currentData to React Flow nodes
  const flowNodes = useMemo<Node[]>(() => {
    // Ensure sequenceColors is always available
    const colors = sequenceColors || initialSequenceColors
    if (!colors || Object.keys(colors).length === 0) return []
    
    console.log("[React Flow] Generating nodes:", {
      currentLevel,
      currentDataLength: currentData.length,
      currentData: currentData.map((item: any) => ({ id: item.id, title: item.title })),
    })
    
    return currentData.map((item) => {
      const sequenceColor = getSequenceColor(item.sequence, colors)
      return {
        id: item.id,
        type: "flowNode",
        position: { x: item.position?.x || 100, y: item.position?.y || 100 },
        data: {
          ...item,
          sequenceColor,
          currentLevel,
          onNavigate: navigateToLevel,
          onConnect: startConnection,
          connectingFrom,
        },
        selected: false,
      }
    })
  }, [currentData, sequenceColors, currentLevel, connectingFrom, navigateToLevel, startConnection])

  // Convert connections to React Flow edges
  const flowEdges = useMemo<Edge[]>(() => {
    return connections.map((conn) => ({
      id: `${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      type: "smoothstep",
      animated: false,
      style: { stroke: "rgba(34, 211, 238, 0.5)", strokeWidth: 2 },
    }))
  }, [connections])

  // Handle node changes (position updates)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setCurrentData((prev) => {
      const updated = [...prev]
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          const index = updated.findIndex((item) => item.id === change.id)
          if (index !== -1) {
            updated[index] = { ...updated[index], position: change.position }
          }
        }
      })
      return updated
    })
  }, [])

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Apply edge changes if needed
  }, [])

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.source !== connection.target) {
      setConnections((prev) => {
        const exists = prev.find((c) => c.from === connection.source && c.to === connection.target)
        if (exists) return prev
        return [...prev, { from: connection.source!, to: connection.target! }]
      })
      setConnectingFrom(null)
    }
  }, [])

  const handleCanvasClick = () => {
    if (connectingFrom) {
      setConnectingFrom(null)
    }
  }

  const handleClipSelect = (index: number) => {
    setSelectedClipIndex(index)
    setCurrentTime(0)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedVideo(file)
      setScrambledVideoUrl(null)
      setScrambledPlaybackId(null)
      setScrambledAssetId(null)
      setScrambledChunkTimes([])
      setScrambledChunks([])
      setScrambledChunkDurations([])
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
      const previewUrl = URL.createObjectURL(file)
      setVideoPreviewUrl(previewUrl)
    }
  }

  const downloadScrambledVideo = () => {
    if (scrambledVideoUrl) {
      const link = document.createElement("a")
      link.href = scrambledVideoUrl
      link.download = `scrambled-${uploadedVideo?.name || "video"}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const addScrambledToTimeline = () => {
    if (scrambledChunks.length === 0 || !scrambledPlaybackId) return

    const existingSequences = new Set(currentTimeline.map((clip) => clip.sequence))
    let sequenceNumber = 1
    let sequenceName = `Scrambled Sequence ${sequenceNumber}`
    while (existingSequences.has(sequenceName)) {
      sequenceNumber++
      sequenceName = `Scrambled Sequence ${sequenceNumber}`
    }

    // Calculate time offsets for each chunk
    const newClips = scrambledChunks.map((chunk, index) => {
      const thumbnailTime = scrambledChunkTimes[index] || 0
      return {
        id: `S${sequenceNumber}-${index + 1}`,
        duration: scrambledChunkDurations[index] || 1000,
        thumbnail: "",
        title: `Scrambled Shot ${index + 1}`,
        sequence: sequenceName,
        playbackId: scrambledPlaybackId,
        thumbnailTime: thumbnailTime, // Time offset in seconds for Mux thumbnail
      }
    })

    setCurrentTimeline([...currentTimeline, ...newClips])
    console.log(`Added ${newClips.length} scrambled shots to timeline as "${sequenceName}" with Mux playbackId: ${scrambledPlaybackId}`)
  }

  const scrambleVideoFrames = async (file: File) => {
    console.log("Starting video scrambling process...")
    setIsScrambling(true)
    setScramblingProgress(0)
    setScrambledVideoUrl(null)
    setScrambledPlaybackId(null)
    setScrambledAssetId(null)
    setScrambledChunkTimes([])
    setScrambledChunks([])
    setScrambledChunkDurations([])

    try {
      const inputFormat = file.type
      console.log("Input video format:", inputFormat)

      const video = document.createElement("video")
      const videoUrl = URL.createObjectURL(file)
      video.src = videoUrl
      video.muted = true
      video.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error("Failed to load video"))
        setTimeout(() => reject(new Error("Video loading timeout")), 30000)
      })

      console.log("Video loaded:", {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
        alpha: false,
      })!
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const fps = 24
      const frameDuration = 1 / fps
      const totalFrames = Math.floor(video.duration * fps)
      const frames: ImageData[] = []

      console.log("Extracting", totalFrames, "frames at", fps, "fps...")

      for (let i = 0; i < totalFrames; i++) {
        const targetTime = i * frameDuration
        video.currentTime = targetTime

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked)
            resolve()
          }
          video.addEventListener("seeked", onSeeked)
        })

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        frames.push(frameData)

        setScramblingProgress(Math.floor((i / totalFrames) * 40))
      }

      console.log("Extracted", frames.length, "frames")

      const baseFramesPerChunk = Math.max(1, Math.floor(fps * chunkDuration))
      const chunkDurations: number[] = []
      const chunks: ImageData[][] = []
      let currentChunkFrames: ImageData[] = []
      let targetChunkSize = baseFramesPerChunk

      for (let i = 0; i < frames.length; i++) {
        currentChunkFrames.push(frames[i])

        if (currentChunkFrames.length >= targetChunkSize) {
          chunks.push([...currentChunkFrames])
          chunkDurations.push((currentChunkFrames.length / fps) * 1000)
          currentChunkFrames = []

          const variance = Math.floor(Math.random() * (chunkVariance * 2 + 1)) - chunkVariance
          targetChunkSize = Math.max(1, baseFramesPerChunk + variance)
        }
      }

      if (currentChunkFrames.length > 0) {
        chunks.push(currentChunkFrames)
        chunkDurations.push((currentChunkFrames.length / fps) * 1000)
      }

      console.log(`Grouped ${frames.length} frames into ${chunks.length} chunks`)
      setScramblingProgress(40)

      const shuffledChunks = [...chunks]
      const shuffledDurations = [...chunkDurations]
      for (let i = shuffledChunks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tempChunk = shuffledChunks[i]
        shuffledChunks[i] = shuffledChunks[j]
        shuffledChunks[j] = tempChunk
        const tempDuration = shuffledDurations[i]
        shuffledDurations[i] = shuffledDurations[j]
        shuffledDurations[j] = tempDuration
      }

      console.log(`Shuffled ${shuffledChunks.length} chunks`)
      setScramblingProgress(50)

      setScrambledChunks(shuffledChunks)
      setScrambledChunkDurations(shuffledDurations)

      const stream = canvas.captureStream(fps)
      console.log("Canvas stream created at", fps, "fps")

      let mimeType = ""
      let fileExtension = "webm"

      if (inputFormat.includes("mp4") && MediaRecorder.isTypeSupported("video/mp4;codecs=h264")) {
        mimeType = "video/mp4;codecs=h264"
        fileExtension = "mp4"
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9"
        fileExtension = "webm"
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        mimeType = "video/webm;codecs=vp8"
        fileExtension = "webm"
      } else {
        mimeType = "video/webm"
        fileExtension = "webm"
      }

      console.log("Selected codec:", mimeType, "| Output format:", fileExtension)

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      })

      const recordedChunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data)
        }
      }

      mediaRecorder.start()

      console.log("Reconstructing video from shuffled chunks at 24fps...")

      const frameInterval = 1000 / fps

      for (let i = 0; i < shuffledChunks.flat().length; i++) {
        const startTime = performance.now()

        const currentFrame = shuffledChunks.flat()[i]
        ctx.putImageData(currentFrame, 0, 0)

        const elapsed = performance.now() - startTime
        const waitTime = Math.max(0, frameInterval - elapsed)
        await new Promise((resolve) => setTimeout(resolve, waitTime))

        setScramblingProgress(50 + Math.floor((i / shuffledChunks.flat().length) * 50))
      }

      mediaRecorder.stop()

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve()
      })

      console.log("Video reconstruction complete at 24fps")

      const blob = new Blob(recordedChunks, { type: mimeType })

      if (scrambledVideoUrl) {
        URL.revokeObjectURL(scrambledVideoUrl)
      }

      const url = URL.createObjectURL(blob)
      setScrambledVideoUrl(url)

      URL.revokeObjectURL(videoUrl)

      console.log("Scrambled video ready:", {
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        type: mimeType,
        format: fileExtension,
        fps: fps,
        chunks: shuffledChunks.length,
        baseFramesPerChunk,
        variance: chunkVariance,
      })

      // Upload scrambled video to Mux
      setScramblingProgress(95)
      console.log("Uploading scrambled video to Mux...")

      try {
        const formData = new FormData()
        formData.append("video", blob, `scrambled-${Date.now()}.${fileExtension}`)

        const uploadResponse = await fetch("/api/mux/scrambled-upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to upload to Mux")
        }

        const muxData = await uploadResponse.json()
        console.log("Mux upload successful:", muxData)

        setScrambledPlaybackId(muxData.playbackId)
        setScrambledAssetId(muxData.assetId)

        // Calculate time offsets for each chunk
        const chunkTimes: number[] = []
        let cumulativeTime = 0
        for (const duration of shuffledDurations) {
          chunkTimes.push(cumulativeTime / 1000) // Convert to seconds
          cumulativeTime += duration
        }
        setScrambledChunkTimes(chunkTimes)

        setScramblingProgress(100)
        console.log("Scrambled video uploaded to Mux successfully")
      } catch (muxError) {
        console.error("Error uploading to Mux:", muxError)
        // Continue anyway - user can still download the blob
        setScramblingProgress(100)
      }
    } catch (error) {
      console.error("Error scrambling video:", error)
      alert(`Failed to scramble video: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsScrambling(false)
    } finally {
      setIsScrambling(false)
    }
  }

  const handleAddNewSequence = () => {
    console.log("[Add Sequence] Called with name:", newSequenceName, "trimmed:", newSequenceName.trim())
    if (!newSequenceName.trim()) {
      console.log("[Add Sequence] Early return - empty name")
      return
    }
    console.log("[Add Sequence] Processing sequence:", newSequenceName)

    const colorPalette = availableColorPalettes.find((p) => p.name === newSequenceColor) || availableColorPalettes[0]

    setSequenceColors((prev) => ({
      ...prev,
      [newSequenceName]: colorPalette,
    }))

    // Find the project we're working with
    const project = currentLevel === "projects" 
      ? currentData.find((p: any) => p.id === "movie-1") || mockData.projects[0]
      : selectedItem || mockData.projects[0]

    // Get all existing scene IDs from both mockData and current state to ensure uniqueness
    const allExistingScenes = [
      ...(mockData.projects[0].scenes || []),
      ...(currentLevel === "scenes" ? currentData : []),
    ]
    
    // Generate unique scene ID by finding the highest existing scene number
    const existingSceneIds = allExistingScenes.map((s: any) => {
      const match = s.id?.match(/^scene-(\d+)$/)
      return match ? parseInt(match[1], 10) : 0
    })
    const maxSceneNumber = existingSceneIds.length > 0 ? Math.max(...existingSceneIds) : 0
    const newSceneId = `scene-${maxSceneNumber + 1}`

    // Calculate position based on current data length (for scenes level) or project scenes length
    const basePosition = currentLevel === "scenes" 
      ? { x: 100 + currentData.length * 150, y: 100 + currentData.length * 100 }
      : { x: 100 + (project.scenes?.length || 0) * 150, y: 100 + (project.scenes?.length || 0) * 100 }

    const newScene = {
      id: newSceneId,
      title: newSequenceName,
      description: `New ${newSequenceName} sequence`,
      location: "TBD",
      duration: 2.0,
      position: basePosition,
      connections: [],
      timeline: [],
      sequence: newSequenceName,
      shots: [], // Empty shots array - allows navigation
    }

    // Update mockData for persistence
    if (!mockData.projects[0].scenes) {
      mockData.projects[0].scenes = []
    }
    // Check if scene already exists to avoid duplicates
    if (!mockData.projects[0].scenes.find((s: any) => s.id === newSceneId)) {
      mockData.projects[0].scenes.push(newScene)
    }

    if (currentLevel === "projects") {
      // Update the project in currentData to include the new scene
      setCurrentData((prevData) => {
        return prevData.map((proj: any) => {
          if (proj.id === "movie-1") {
            const updatedScenes = [...(proj.scenes || []), newScene]
            return {
              ...proj,
              scenes: updatedScenes,
            }
          }
          return proj
        })
      })
    } else if (currentLevel === "scenes") {
      console.log("[Add Sequence] Adding scene at scenes level:", newSceneId, newScene)
      console.log("[Add Sequence] Current currentData:", currentData.map((s: any) => s.id))
      
      // Add directly to visible nodes - check for duplicates first
      const sceneExists = currentData.find((s: any) => s.id === newSceneId)
      if (!sceneExists) {
        console.log("[Add Sequence] Adding new scene to currentData")
        // Use functional update to ensure we have the latest state
        setCurrentData((prev) => {
          const exists = prev.find((s: any) => s.id === newSceneId)
          if (exists) {
            console.log("[Add Sequence] Scene already exists in prev state, skipping")
            return prev
          }
          console.log("[Add Sequence] Adding scene to prev state")
          return [...prev, newScene]
        })
      } else {
        console.log("[Add Sequence] Scene already exists in currentData, skipping")
      }
      
      // Also update selectedItem (the project) so navigation works correctly
      if (selectedItem && selectedItem.id === "movie-1") {
        const projectSceneExists = (selectedItem.scenes || []).find((s: any) => s.id === newSceneId)
        if (!projectSceneExists) {
          console.log("[Add Sequence] Updating selectedItem")
          setSelectedItem({
            ...selectedItem,
            scenes: [...(selectedItem.scenes || []), newScene],
          })
        } else {
          console.log("[Add Sequence] Scene already exists in selectedItem, skipping")
        }
      } else {
        console.log("[Add Sequence] No selectedItem or wrong project ID")
      }
    }
    
    console.log("[Add Sequence] Sequence added successfully, closing modal")

    const newClipId = `${newSequenceName.charAt(0).toUpperCase()}${currentTimeline.length + 1}`
    const newClip = {
      id: newClipId,
      duration: 2000,
      thumbnail: "/placeholder.svg?height=80&width=120",
      title: `New ${newSequenceName} Shot`,
      sequence: newSequenceName,
      playbackId: "",
    }

    setCurrentTimeline((prev) => [...prev, newClip])

    setShowNewSequenceModal(false)
    setNewSequenceName("")
    setNewSequenceColor("cyan")
  }

  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setCanvasZoom((prev) => Math.max(0.25, Math.min(2, prev + delta)))
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y })
    }
  }

  const resetCanvasView = () => {
    setCanvasZoom(1)
    setCanvasPan({ x: 0, y: 0 })
  }

  const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
    const node = currentData.find((item) => item.id === nodeId)
    return node?.position || null
  }

  // Added handleNodeDrag function
  const handleNodeDrag = (itemId: string, info: PanInfo) => {
    setCurrentData((prevData) =>
      prevData.map((item) =>
        item.id === itemId
          ? { ...item, position: { x: item.position.x + info.delta.x, y: item.position.y + info.delta.y } }
          : item,
      ),
    )
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  const currentClip = currentTimeline[selectedClipIndex]

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 select-none">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-zinc-800 px-4 py-3 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* CHANGE: Show toggle button whenever drawer is closed, or always on mobile */}
            {isCanvasMode && (
              <Button
                variant="ghost"
                size="icon"
                className={`text-zinc-400 hover:text-white ${showBoardDrawer ? "md:hidden" : ""}`}
                onClick={() => setShowBoardDrawer(!showBoardDrawer)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">Nestmux</span>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigateBack(-1)}
              className="text-zinc-400 hover:text-white transition-colors flex items-center"
            >
              <Layers className="w-4 h-4 mr-1" />
              Projects
            </button>
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center">
                <span className="text-zinc-600 mx-2">/</span>
                <button
                  onClick={() => navigateBack(index)}
                  className={`transition-colors ${
                    index === currentPath.length - 1 ? "text-cyan-400 font-medium" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {path}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {isCanvasMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVideoLibrary(!showVideoLibrary)}
                className={`border-zinc-700 ${showVideoLibrary ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400"}`}
              >
                <Film className="w-4 h-4 mr-2" />
                Mux Library
              </Button>
            )}

            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 bg-transparent">
              <Search className="w-4 h-4" />
            </Button>
            <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
              {currentLevel === "projects" ? "Projects" : currentLevel === "scenes" ? "Scenes" : "Shots"}
            </Badge>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar / Board Drawer */}
        <AnimatePresence>
          {showBoardDrawer && isCanvasMode && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 150 }}
              className="w-72 border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-y-auto h-[calc(100vh-57px)] fixed md:sticky top-[57px] z-40"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    {currentLevel === "scenes" ? "Scenes" : "Shots"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-zinc-400 hover:text-white"
                    onClick={() => setShowBoardDrawer(false)}
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </Button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-5 text-zinc-500" />
                  <Input
                    placeholder={`Search ${currentLevel}...`}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>

                {/* Sequence Timeline Preview */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-zinc-400">Timeline Clips</h3>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-cyan-400 hover:bg-cyan-400/20"
                        onClick={scrambleTimeline}
                        title="Scramble Timeline"
                      >
                        <Shuffle className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-green-400 hover:bg-green-400/20"
                        onClick={downloadScrambledTimeline}
                        title="Download Timeline"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {currentTimeline.map((clip, index) => {
                      const sequenceColor = getSequenceColor(clip.sequence, sequenceColors)
                      const isSelected = index === selectedClipIndex
                      const isPlayingClip = isSelected && isPlaying

                      return (
                        <div
                          key={clip.id}
                          className={`p-2 rounded cursor-pointer transition-colors border ${
                            isSelected
                              ? `bg-cyan-400/20 border-cyan-400 ${sequenceColor.ring}`
                              : `${sequenceColor.accent} hover:bg-zinc-600`
                          }`}
                          style={{
                            filter: isPlayingClip
                              ? `drop-shadow(0 0 6px ${sequenceColor.dot.replace("bg-", "").replace("-400", "")})`
                              : "none",
                          }}
                          onClick={() => handleClipSelect(index)}
                        >
                          <div className="flex items-start gap-2">
                            {clip.playbackId ? (
                              <MuxThumbnail
                                playbackId={clip.playbackId}
                                width={48}
                                height={32}
                                time={(clip as any).thumbnailTime !== undefined 
                                  ? (clip as any).thumbnailTime 
                                  : (clip.duration / 1000 / 2)}
                                className="rounded shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-8 bg-zinc-700 rounded flex items-center justify-center shrink-0">
                                <Film className="w-3 h-3 text-zinc-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-xs font-medium text-white">{clip.id}</div>
                                <div className={`text-xs flex items-center space-x-1 ${sequenceColor.text}`}>
                                  <span className="font-medium truncate">{clip.sequence}</span>
                                </div>
                              </div>
                              <div className="text-xs text-zinc-400 truncate">{clip.title}</div>
                              <div className="text-xs text-zinc-500">{clip.duration / 1000}s</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* CHANGE: Removed Back to Projects button - using breadcrumbs instead */}

                <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Total Duration</span>
                    <span className="text-cyan-400 font-mono">{formatTime(totalDuration)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Clips</span>
                    <span className="text-white">{currentTimeline.length}</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Video Scrambler Section */}
          {isCanvasMode && (
            <div className="mb-6 p-6 bg-zinc-800 rounded-lg border border-zinc-700 container mx-auto mt-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Film className="w-6 h-6 mr-3 text-cyan-400" />
                Video Frame Scrambler (Chunk Mode)
              </h3>

              <p className="text-sm text-zinc-400 mb-6">
                Upload a video to scramble it in chunks, creating jump cuts and stuttered effects. Adjust the chunk size
                to control how long each segment is before it jumps to another part of the video.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                    <h4 className="text-sm font-medium text-white mb-3">1. Upload Video</h4>

                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />

                    <Button
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center space-x-2 h-12"
                      disabled={isScrambling}
                    >
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">{uploadedVideo ? "Change Video" : "Choose Video File"}</span>
                    </Button>

                    {uploadedVideo && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-zinc-800 rounded border border-cyan-400/30">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-400 mb-1">Selected file:</p>
                              <p className="text-sm text-white font-medium truncate">{uploadedVideo.name}</p>
                              <p className="text-xs text-cyan-400 mt-1">
                                {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div className="ml-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            </div>
                          </div>
                        </div>

                        {videoPreviewUrl && (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-zinc-700">
                            <video src={videoPreviewUrl} controls className="w-full h-full" preload="metadata" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                    <h4 className="text-sm font-medium text-white mb-3">2. Set Chunk Duration</h4>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-zinc-400">Chunk Duration (seconds)</label>
                          <span className="text-sm font-mono text-cyan-400 font-bold">{chunkDuration.toFixed(1)}s</span>
                        </div>

                        <Slider
                          value={[chunkDuration]}
                          onValueChange={(value) => setChunkDuration(value[0])}
                          min={0.25}
                          max={5.0}
                          step={0.25}
                          className="w-full"
                          disabled={isScrambling}
                        />

                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>0.25s (fast cuts)</span>
                          <span>5.0s (slow cuts)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-zinc-400">Chunk Variance (frames)</label>
                          <span className="text-sm font-mono text-cyan-400 font-bold">±{chunkVariance}</span>
                        </div>

                        <Slider
                          value={[chunkVariance]}
                          onValueChange={(value) => setChunkVariance(value[0])}
                          min={0}
                          max={24}
                          step={1}
                          className="w-full"
                          disabled={isScrambling}
                        />

                        <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                          <span>0 (uniform)</span>
                          <span>24 (chaotic)</span>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          <strong className="text-cyan-400">Chunk Duration:</strong> Controls how long each video
                          segment is before jumping to another part. Smaller values create rapid, chaotic cuts. Larger
                          values create smoother, longer segments.
                        </p>
                        <p className="text-xs text-cyan-400 mt-2">
                          At 24fps: {chunkDuration.toFixed(1)}s = ~{Math.floor(24 * chunkDuration)} frames per chunk
                        </p>
                        <p className="text-xs text-zinc-400 leading-relaxed mt-3">
                          <strong className="text-cyan-400">Chunk Variance:</strong> Adds randomness to chunk sizes.
                          Each chunk will be the base size ± variance frames, creating more organic, less mechanical
                          cuts.
                        </p>
                        {chunkVariance > 0 && (
                          <p className="text-xs text-cyan-500 mt-2">
                            Range: {Math.max(1, Math.floor(24 * chunkDuration) - chunkVariance)} -{" "}
                            {Math.floor(24 * chunkDuration) + chunkVariance} frames per chunk
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                    <h4 className="text-sm font-medium text-white mb-3">3. Scramble Video</h4>

                    <Button
                      onClick={() => scrambleVideoFrames(uploadedVideo!)}
                      disabled={!uploadedVideo || isScrambling}
                      className="w-full bg-cyan-400 hover:bg-cyan-500 text-zinc-900 flex items-center justify-center space-x-2 h-12 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Shuffle className="w-5 h-5" />
                      <span>{isScrambling ? "Scrambling..." : "Scramble Video"}</span>
                    </Button>

                    {isScrambling && (
                      <div className="mt-4 space-y-2">
                        <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-linear-to-r from-cyan-400 to-cyan-500 h-full transition-all duration-300 relative overflow-hidden"
                            style={{ width: `${scramblingProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">
                            {scramblingProgress < 40
                              ? "Extracting frames..."
                              : scramblingProgress < 50
                                ? "Creating chunks & shuffling..."
                                : scramblingProgress < 95
                                  ? "Reconstructing video..."
                                  : scramblingProgress < 100
                                    ? "Uploading to Mux..."
                                    : "Complete!"}
                          </span>
                          <span className="text-cyan-400 font-mono font-bold">{scramblingProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!uploadedVideo && !isScrambling && (
                    <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        <strong className="text-zinc-400">How it works:</strong> The scrambler extracts frames from your
                        video, groups them into chunks of the specified duration, shuffles the chunks randomly, then
                        reconstructs a new video with jump cuts between segments.
                      </p>
                    </div>
                  )}
                </div>

                {/* Preview/Download Section */}
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                    <h4 className="text-sm font-medium text-white mb-3">4. Preview & Download</h4>

                    {scrambledVideoUrl || scrambledPlaybackId ? (
                      <div className="space-y-3">
                        {scrambledPlaybackId ? (
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-cyan-400/30">
                            <MuxPlayer
                              playbackId={scrambledPlaybackId}
                              autoPlay={false}
                              muted={false}
                              controls={true}
                              className="w-full h-full"
                            />
                          </div>
                        ) : (
                          <video
                            src={scrambledVideoUrl || "/placeholder.svg"}
                            controls
                            className="w-full rounded-lg border border-cyan-400/30"
                          />
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={downloadScrambledVideo}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 h-12 font-semibold"
                            disabled={!scrambledVideoUrl}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Scrambled Video
                          </Button>
                          <Button
                            onClick={addScrambledToTimeline}
                            disabled={scrambledChunks.length === 0 || !scrambledPlaybackId}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Timeline ({scrambledChunks.length} shots)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center">
                        <div className="text-center text-zinc-500 p-6">
                          <Film className="w-16 h-16 mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium mb-1">No scrambled video yet</p>
                          <p className="text-xs opacity-60">Upload and scramble a video to see the result here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Viewer with Video Library */}
          {isCanvasMode && (
            <div className="bg-zinc-900 border-b border-zinc-800">
              <div className="container mx-auto px-6 py-6">
                <div className={`grid gap-4 ${showVideoLibrary ? "grid-cols-3" : "grid-cols-2"}`}>
                  {showVideoLibrary && (
                    <VideoLibraryPanel
                      onSelectVideo={(video) => {
                        if (selectedClipIndex >= 0) {
                          addMuxVideoToClip(selectedClipIndex, video.playbackId, video.duration)
                        } else {
                          addMuxVideoAsNewClip(video)
                        }
                      }}
                      className="h-fit"
                    />
                  )}

                  {/* Overall Composition Player */}
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Overall Composition</h3>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                          {currentTimeline.length} Clips
                        </Badge>
                      </div>

                      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-linear-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center bg-black/20 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-3 gap-1 p-2">
                              {currentTimeline.slice(0, 9).map((clip, index) => {
                                const sequenceColor = getSequenceColor(clip.sequence, sequenceColors)
                                const isCurrentlyPlaying = index === selectedClipIndex && isPlaying

                                return (
                                  <div
                                    key={clip.id}
                                    className={`relative rounded flex items-center justify-center transition-all overflow-hidden ${
                                      index === selectedClipIndex
                                        ? `ring-2 ${sequenceColor.ring} scale-105`
                                        : "opacity-60"
                                    }`}
                                    onClick={() => handleClipSelect(index)}
                                  >
                                    {clip.playbackId ? (
                                      <MuxThumbnail
                                        playbackId={clip.playbackId}
                                        width={120}
                                        height={68}
                                        time={(clip as any).thumbnailTime !== undefined 
                                          ? (clip as any).thumbnailTime 
                                          : (clip.duration / 1000 / 2)}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div
                                        className={`w-full h-full ${sequenceColor.bg} flex items-center justify-center`}
                                      >
                                        <span className="text-white text-xs font-bold">{clip.id}</span>
                                      </div>
                                    )}
                                    {isCurrentlyPlaying && (
                                      <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white">Current Clip Preview</h3>
                        {currentClip && (
                          <Badge className={getSequenceColor(currentClip.sequence, sequenceColors).badge}>
                            {currentClip.id}
                          </Badge>
                        )}
                      </div>

                      <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden mb-4">
                        {currentClip?.playbackId ? (
                          <MuxPlayer
                            playbackId={currentClip.playbackId}
                            autoPlay={isPlaying}
                            muted={false}
                            controls={true}
                            className="w-full h-full"
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={(time) => {
                              const duration = currentClip.duration / 1000
                              if (duration > 0) {
                                setCurrentTime(time / duration)
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div
                              className={`w-full h-full ${getSequenceColor(currentClip?.sequence, sequenceColors).bg} flex flex-col items-center justify-center`}
                            >
                              <Film className="w-12 h-12 text-white/50 mb-2" />
                              <span className="text-white text-2xl font-bold">{currentClip?.id}</span>
                              <span className="text-white/70 text-sm mt-1">{currentClip?.title}</span>
                              <p className="text-white/50 text-xs mt-3">No Mux video assigned - Select from library</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Transport Controls */}
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (selectedClipIndex > 0) {
                              setSelectedClipIndex(selectedClipIndex - 1)
                              setCurrentTime(0)
                            }
                          }}
                          className="text-zinc-400 hover:text-white"
                        >
                          <SkipBack className="w-5 h-5" />
                        </Button>

                        <Button
                          size="icon"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="bg-cyan-400 hover:bg-cyan-500 text-zinc-900 w-12 h-12"
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (selectedClipIndex < currentTimeline.length - 1) {
                              setSelectedClipIndex(selectedClipIndex + 1)
                              setCurrentTime(0)
                            }
                          }}
                          className="text-zinc-400 hover:text-white"
                        >
                          <SkipForward className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Canvas Area - React Flow */}
          {isCanvasMode ? (
            <div className="relative h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
              {flowNodes.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <div className="text-center">
                    <p className="text-lg mb-2">No nodes to display</p>
                    <p className="text-sm">Current level: {currentLevel}</p>
                    <p className="text-sm">Data items: {currentData.length}</p>
                  </div>
                </div>
              ) : (
                <ReactFlowProvider>
                  <ReactFlow
                    key={`${currentLevel}-${currentData.length}`}
                    nodes={flowNodes}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDoubleClick={(_, node) => {
                      const item = currentData.find((d) => d.id === node.id)
                      if (!item) {
                        console.log("[React Flow] Node double-clicked but item not found:", node.id)
                        return
                      }
                      
                      console.log("[React Flow] Node double-clicked:", {
                        nodeId: node.id,
                        currentLevel,
                        itemTitle: item.title,
                        hasScenes: Array.isArray(item.scenes),
                        hasShots: Array.isArray(item.shots),
                        scenesCount: item.scenes?.length || 0,
                        shotsCount: item.shots?.length || 0,
                        timelineLength: item.timeline?.length || 0,
                      })
                      
                      if (currentLevel === "projects" && Array.isArray(item.scenes)) {
                        console.log("[React Flow] Navigating to scenes level")
                        navigateToLevel(item, "scenes")
                      } else if (currentLevel === "scenes" && Array.isArray(item.shots)) {
                        console.log("[React Flow] Navigating to shots level")
                        navigateToLevel(item, "shots")
                      } else {
                        console.log("[React Flow] Cannot navigate - missing scenes or shots array")
                      }
                    }}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    className="bg-zinc-900"
                    style={{ background: "#18181b" }}
                  >
                  <Background color="#3f3f46" gap={20} />
                  <Controls className="bg-zinc-800 border-zinc-700" />
                  <MiniMap
                    className="bg-zinc-800 border-zinc-700"
                    nodeColor={(node) => {
                      const item = currentData.find((d) => d.id === node.id)
                      if (!item) return "#71717a"
                      const colors = sequenceColors || initialSequenceColors
                      const color = getSequenceColor(item.sequence, colors)
                      return color.dot.replace("bg-", "#").replace("-400", "")
                    }}
                    maskColor="rgba(0, 0, 0, 0.6)"
                  />
                  </ReactFlow>
                </ReactFlowProvider>
              )}
            </div>
          ) : (
            /* Project Grid View */
            <div className="p-6">
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {currentData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (currentLevel === "projects") {
                          navigateToLevel(item, "scenes")
                        }
                      }}
                      className="cursor-pointer group"
                    >
                      <Card className="bg-zinc-800/50 border-zinc-700 hover:border-cyan-400/50 transition-all duration-300 overflow-hidden group-hover:shadow-lg group-hover:shadow-cyan-400/10">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={item.thumbnail || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

                          {/* Hover Play Indicator */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 bg-cyan-400/90 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                              <Play className="w-6 h-6 text-zinc-900 ml-1" />
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge className="absolute top-3 right-3 bg-cyan-400/20 text-cyan-400 border-cyan-400/30">
                            {item.status}
                          </Badge>
                        </div>

                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-zinc-500">{item.type}</p>
                            </div>
                            <Badge variant="outline" className="text-zinc-400 border-zinc-600">
                              {item.childCount} scenes
                            </Badge>
                          </div>

                          <p className="text-sm text-zinc-400 line-clamp-2">{item.description}</p>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-700">
                            <div className="flex items-center space-x-2 text-xs text-zinc-500">
                              <Film className="w-4 h-4" />
                              <span>{item.aspectRatio}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-cyan-400"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Timeline Panel */}
          {isCanvasMode && (
            <div className="bg-zinc-900/95 backdrop-blur-md border-t border-zinc-800 mt-6">
              <div className="container mx-auto px-6 py-4 relative border-b border-zinc-800/50">
                <div className="flex items-center justify-between">
                  {/* Left side - Timecode and info */}
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-mono text-cyan-400 tabular-nums">
                      {formatTime(getCurrentTimePosition())}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-zinc-400">
                      <span>SHOT {selectedClipIndex + 1}</span>
                      <span>|</span>
                      <span>{currentTimeline.length} SHOTS</span>
                      <span>|</span>
                      <span>TOTAL {formatTime(totalDuration)}</span>
                    </div>
                  </div>

                  {/* Right side - Zoom controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTimelineZoom((prev) => Math.max(0.5, prev - 0.25))}
                      className="text-zinc-400 hover:text-white h-8 w-8"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-zinc-400 min-w-[50px] text-center">
                      {Math.round(timelineZoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTimelineZoom((prev) => Math.min(3, prev + 0.25))}
                      className="text-zinc-400 hover:text-white h-8 w-8"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const viewportWidth = window.innerWidth - 300
                        setTimelineZoom(viewportWidth / (totalDuration * 100))
                      }}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Fit
                    </Button>
                    <div className="w-px h-6 bg-zinc-700 mx-2" />
                    <Button
                      onClick={() => setShowNewSequenceModal(true)}
                      className="bg-cyan-400 hover:bg-cyan-500 text-zinc-900 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Sequence
                    </Button>
                  </div>
                </div>

                {/* Center - Transport controls positioned absolutely */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (selectedClipIndex > 0) {
                        setSelectedClipIndex(selectedClipIndex - 1)
                        setCurrentTime(0)
                      }
                    }}
                    className="text-zinc-400 hover:text-white h-10 w-10"
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>

                  <Button
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-cyan-400 hover:bg-cyan-500 text-zinc-900 w-12 h-12 rounded-full"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (selectedClipIndex < currentTimeline.length - 1) {
                        setSelectedClipIndex(selectedClipIndex + 1)
                        setCurrentTime(0)
                      }
                    }}
                    className="text-zinc-400 hover:text-white h-10 w-10"
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="container mx-auto px-6">
                <div className="relative bg-zinc-950 overflow-hidden rounded-lg border border-zinc-800/50">
                  {/* Timeline ruler with tick marks */}
                  <div className="relative h-8 bg-zinc-900 border-b border-zinc-800/50">
                    <div
                      className="relative h-full overflow-x-auto scrollbar-hide"
                      style={{ scrollBehavior: "smooth" }}
                    >
                      <div
                        className="relative h-full"
                        style={{
                          minWidth: `100%`,
                          width: `${totalDuration * timelineScale + 40}px`,
                        }}
                      >
                        {/* Tick marks */}
                        {generateTimeMarkers().map((marker, index) => {
                          const shouldShowLabel = index % Math.max(1, Math.floor(3 / timelineZoom)) === 0
                          return (
                            <div
                              key={marker.time}
                              className="absolute top-0 h-full flex flex-col items-center"
                              style={{ left: `${marker.position + 20}px` }}
                            >
                              {shouldShowLabel ? (
                                <>
                                  <div className="w-px h-3 bg-zinc-600" />
                                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{marker.label}</span>
                                </>
                              ) : (
                                <div className="w-px h-2 bg-zinc-700/50" />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Timeline track area */}
                  <div className="relative h-28 bg-zinc-950 overflow-x-auto overflow-y-hidden scrollbar-hide">
                    <div
                      className="relative h-full"
                      style={{
                        minWidth: `100%`,
                        width: `${totalDuration * timelineScale + 40}px`,
                      }}
                    >
                      {/* Track background */}
                      <div className="absolute inset-0 bg-zinc-900/30" style={{ left: "20px", right: "20px" }} />

                      {/* Clips container - vertically centered */}
                      <div
                        className="absolute inset-0 flex items-center"
                        style={{ paddingLeft: "20px", paddingRight: "20px" }}
                      >
                        <div className="relative w-full" style={{ height: "80px" }}>
                          {currentTimeline.map((clip, index) => {
                            const startPosition = getClipStartTime(index) * timelineScale
                            const clipWidth = clip.duration * timelineScale
                            const currentPlayheadTime = getCurrentTimePosition()
                            const clipStartTime = getClipStartTime(index)
                            const clipEndTime = clipStartTime + clip.duration
                            const sequenceColor = getSequenceColor(clip.sequence, sequenceColors)
                            const isCurrentClip =
                              currentPlayheadTime >= clipStartTime && currentPlayheadTime < clipEndTime
                            const isSelected = index === selectedClipIndex

                            return (
                              <div key={clip.id} className="absolute top-0" style={{ left: `${startPosition}px` }}>
                                <TimelineClip
                                  clip={clip}
                                  sequenceColor={sequenceColor}
                                  isSelected={isSelected || isCurrentClip}
                                  isPlaying={isCurrentClip && isPlaying}
                                  width={clipWidth}
                                  onClick={() => handleClipSelect(index)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Playhead */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
                        style={{
                          left: `${getCurrentTimePosition() * timelineScale + 20}px`,
                        }}
                      >
                        {/* Playhead timecode at top */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                          <div className="bg-red-500 px-2 py-0.5 rounded text-[10px] text-white font-mono whitespace-nowrap">
                            {formatTime(getCurrentTimePosition())}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Sequence Modal */}
      <AnimatePresence>
        {showNewSequenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowNewSequenceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 border border-zinc-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Add New Sequence</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Sequence Name</label>
                  <Input
                    value={newSequenceName}
                    onChange={(e) => setNewSequenceName(e.target.value)}
                    placeholder="e.g., Action Sequence"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Color Theme</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableColorPalettes.map((palette) => (
                      <button
                        key={palette.name}
                        onClick={() => setNewSequenceColor(palette.name)}
                        className={`h-10 rounded-lg ${palette.primary} ${
                          newSequenceColor === palette.name
                            ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-800"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="ghost" onClick={() => setShowNewSequenceModal(false)} className="text-zinc-400">
                  Cancel
                </Button>
                <Button onClick={handleAddNewSequence} className="bg-cyan-400 hover:bg-cyan-500 text-zinc-900">
                  Add Sequence
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-zinc-400">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
