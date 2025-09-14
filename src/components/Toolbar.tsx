"use client"

import { motion } from "framer-motion"
import { Sparkles, Edit3, Undo, Download, History, Upload, Brush } from "lucide-react"
import { Button } from "./ui/button"

interface ToolbarProps {
  onGenerate?: () => void
  onEdit?: () => void
  onUndo?: () => void
  onDownload?: () => void
  onHistory?: () => void
  onUpload?: () => void
  onMask?: () => void
  isGenerating?: boolean
  canUndo?: boolean
  canDownload?: boolean
  className?: string
}

export function Toolbar({
  onGenerate,
  onEdit,
  onUndo,
  onDownload,
  onHistory,
  onUpload,
  onMask,
  isGenerating = false,
  canUndo = false,
  canDownload = false,
  className = "",
}: ToolbarProps) {
  const tools = [
    {
      icon: Sparkles,
      label: "Generate",
      onClick: onGenerate,
      disabled: isGenerating,
      variant: "default" as const,
    },
    {
      icon: Edit3,
      label: "Edit",
      onClick: onEdit,
      disabled: isGenerating,
      variant: "outline" as const,
    },
    {
      icon: Brush,
      label: "Mask",
      onClick: onMask,
      disabled: isGenerating,
      variant: "outline" as const,
    },
    {
      icon: Upload,
      label: "Upload",
      onClick: onUpload,
      disabled: isGenerating,
      variant: "outline" as const,
    },
    {
      icon: Undo,
      label: "Undo",
      onClick: onUndo,
      disabled: !canUndo || isGenerating,
      variant: "outline" as const,
    },
    {
      icon: Download,
      label: "Download",
      onClick: onDownload,
      disabled: !canDownload,
      variant: "outline" as const,
    },
    {
      icon: History,
      label: "History",
      onClick: onHistory,
      disabled: false,
      variant: "outline" as const,
    },
  ]

  return (
    <motion.div
      className={`flex items-center justify-center space-x-2 p-4 bg-background-surface border border-border-default rounded-lg shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {tools.map((tool) => {
        const IconComponent = tool.icon
        return (
          <Button
            key={tool.label}
            variant={tool.variant}
            size="sm"
            onClick={tool.onClick}
            disabled={tool.disabled}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 min-w-[60px]"
          >
            <IconComponent className="w-4 h-4" />
            <span className="text-xs">{tool.label}</span>
          </Button>
        )
      })}
    </motion.div>
  )
}
