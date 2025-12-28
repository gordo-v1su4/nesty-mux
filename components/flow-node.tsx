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

interface FlowNodeData extends ContentItem {
  sequenceColor: any
  currentLevel: "projects" | "scenes" | "shots"
  onNavigate?: (item: ContentItem, level: "scenes" | "shots") => void
  onConnect?: (nodeId: string) => void
  connectingFrom?: string | null
}

export const FlowNode = memo(({ data, selected }: NodeProps<FlowNodeData>) => {
  const { title, description, id, location, cameraAngle, duration, sequenceColor, currentLevel, onNavigate, onConnect, connectingFrom } = data

  return (
    <div
      className={`w-60 bg-zinc-800/90 backdrop-blur-sm rounded-xl border-2 transition-colors cursor-pointer ${
        selected ? "border-cyan-400 shadow-lg shadow-cyan-400/20" : "border-zinc-700 hover:border-zinc-600"
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-400" />
      
      <div className={`p-3 border-b border-zinc-700 ${sequenceColor.primary} rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          <Badge variant="secondary" className="text-xs bg-black/30 text-white">
            {id}
          </Badge>
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{description}</p>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {location && (
            <Badge variant="outline" className="text-xs text-zinc-300 border-zinc-600">
              {location}
            </Badge>
          )}
          {cameraAngle && (
            <Badge variant="outline" className="text-xs text-zinc-300 border-zinc-600">
              {cameraAngle}
            </Badge>
          )}
          {duration && (
            <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/30">
              <Clock className="w-3 h-3 mr-1" />
              {duration}s
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              if (onNavigate && data) {
                if (currentLevel === "scenes" && Array.isArray(data.shots)) {
                  onNavigate(data, "shots")
                } else if (currentLevel === "projects" && Array.isArray(data.scenes)) {
                  onNavigate(data, "scenes")
                }
              }
            }}
          >
            <FileText className="w-3 h-3 mr-1" />
            {currentLevel === "scenes"
              ? `${data.shots?.length || 0} Shots`
              : currentLevel === "projects"
                ? `${data.scenes?.length || 0} Scenes`
                : "Details"}
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
            <Link2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-cyan-400" />
    </div>
  )
})

FlowNode.displayName = "FlowNode"

