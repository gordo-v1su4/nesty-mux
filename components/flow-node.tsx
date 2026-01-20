"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, FileText, Link2 } from "lucide-react"

// Define ContentItem type locally
type ContentItem = {
  id: string
  title: string
  description?: string
  location?: string
  cameraAngle?: string
  duration?: number
  sequence?: string
  scenes?: ContentItem[]
  shots?: ContentItem[]
  position?: { x: number; y: number }
  connections?: string[]
}

type SequenceColor = {
  primary: string
  accent: string
  text: string
  dot: string
}

export interface FlowNodeData {
  // ContentItem properties (excluding id and position which are Node properties)
  title: string
  description?: string
  location?: string
  cameraAngle?: string
  duration?: number
  sequence?: string
  scenes?: ContentItem[]
  shots?: ContentItem[]
  connections?: string[]
  // Additional FlowNode-specific properties
  sequenceColor: SequenceColor
  currentLevel: "projects" | "scenes" | "shots"
  onNavigate?: (item: ContentItem, level: "scenes" | "shots") => void
  onConnect?: (nodeId: string) => void
  connectingFrom?: string | null
}

// Workaround for TypeScript constraint issue with React Flow types
// NodeProps expects FlowNodeData to be the data type, not the Node type
// The constraint check is incorrect - FlowNodeData is the data type, not the Node type
// @ts-expect-error - React Flow's type constraint is incorrectly checking the generic parameter
const FlowNodeComponent = (props: NodeProps<FlowNodeData>) => {
  const { data, selected, id: nodeId } = props
  // TypeScript needs explicit typing here - React Flow's types aren't inferring correctly
  // The data property should be FlowNodeData, but TypeScript inference is failing
  const nodeData = data as FlowNodeData
  const id = String(nodeId ?? '')
  const { title, description, location, duration, sequenceColor, sequence, currentLevel, onNavigate, onConnect, connectingFrom } = nodeData

  // Fallback color if sequenceColor is missing
  const color = sequenceColor || {
    primary: "bg-zinc-700",
    accent: "border-zinc-600",
    text: "text-zinc-300",
    dot: "bg-zinc-500"
  }

  return (
    <div
      className={`w-64 bg-zinc-800/95 backdrop-blur-sm rounded-lg border-2 transition-all cursor-pointer shadow-lg ${
        selected ? "border-cyan-400 shadow-cyan-400/20" : "border-zinc-700 hover:border-zinc-600"
      }`}
      style={{ 
        position: 'relative',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-400 border-2 border-zinc-800" />
      
      {/* Colored Header */}
      <div className={`px-4 py-2.5 ${color.primary} rounded-t-lg border-b-2 border-zinc-700`}>
        <h3 className="text-sm font-semibold text-white truncate">{title || sequence || id}</h3>
      </div>

      {/* Node Content */}
      <div className="p-4 bg-zinc-800/50">
        {/* Description */}
        {description && (
          <p className="text-sm text-zinc-300 mb-3 line-clamp-2">{description}</p>
        )}

        {/* Location Badge */}
        {location && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs text-zinc-300 border-zinc-600 bg-zinc-900/50">
              {location}
            </Badge>
          </div>
        )}

        {/* Duration and Shot Count */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
          <div className="flex items-center gap-2">
            {duration && (
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{duration}s</span>
              </div>
            )}
            <div className="text-xs text-zinc-400">
              {currentLevel === "scenes"
                ? `${nodeData.shots?.length || 0} Shot${(nodeData.shots?.length || 0) !== 1 ? "s" : ""}`
                : currentLevel === "projects"
                  ? `${nodeData.scenes?.length || 0} Scene${(nodeData.scenes?.length || 0) !== 1 ? "s" : ""}`
                  : "Details"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                if (onNavigate && nodeData) {
                  const contentItem: ContentItem = {
                    id,
                    title: nodeData.title,
                    description: nodeData.description,
                    location: nodeData.location,
                    cameraAngle: nodeData.cameraAngle,
                    duration: nodeData.duration,
                    sequence: nodeData.sequence,
                    scenes: nodeData.scenes,
                    shots: nodeData.shots,
                    connections: nodeData.connections,
                  }
                  if (currentLevel === "scenes" && Array.isArray(nodeData.shots)) {
                    onNavigate(contentItem, "shots")
                  } else if (currentLevel === "projects" && Array.isArray(nodeData.scenes)) {
                    onNavigate(contentItem, "scenes")
                  }
                }
              }}
              title="View details"
            >
              <FileText className="w-3.5 h-3.5" />
            </Button>

            {/* Connection Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${connectingFrom === id ? "text-cyan-400" : "text-zinc-400"}`}
              onClick={(e) => {
                e.stopPropagation()
                if (onConnect) {
                  onConnect(id)
                }
              }}
              title="Connect nodes"
            >
              <Link2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-cyan-400 border-2 border-zinc-800" />
    </div>
  )
}

export const FlowNode = memo(FlowNodeComponent)

FlowNode.displayName = "FlowNode"

