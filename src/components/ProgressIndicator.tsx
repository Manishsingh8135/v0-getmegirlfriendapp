"use client"
import { motion } from "framer-motion"
import { X, Clock } from "lucide-react"
import { Button } from "./ui/button"

interface ProgressIndicatorProps {
  progress: number
  isActive: boolean
  eta?: number
  onCancel?: () => void
  className?: string
}

export function ProgressIndicator({ progress, isActive, eta, onCancel, className = "" }: ProgressIndicatorProps) {
  const formatETA = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!isActive) return null

  return (
    <motion.div
      className={`bg-background-surface border border-border-default rounded-lg p-4 shadow-md ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
          <span className="text-sm font-medium">Generating...</span>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-2">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{Math.round(progress)}% complete</span>
        {eta && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatETA(eta)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
