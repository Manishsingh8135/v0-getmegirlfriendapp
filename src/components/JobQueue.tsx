"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Clock, X, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { Button } from "./ui/button"
import { ProgressIndicator } from "./ProgressIndicator"
import type { Job } from "../types"

interface JobQueueProps {
  jobs: Job[]
  onCancel?: (jobId: string) => void
  className?: string
}

export function JobQueue({ jobs, onCancel, className = "" }: JobQueueProps) {
  if (jobs.length === 0) return null

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-text-muted" />
      case "processing":
        return <Loader className="w-4 h-4 text-brand-primary animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-status-success" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-status-danger" />
      case "cancelled":
        return <X className="w-4 h-4 text-text-muted" />
      default:
        return <Clock className="w-4 h-4 text-text-muted" />
    }
  }

  const getStatusText = (status: Job["status"]) => {
    switch (status) {
      case "pending":
        return "Queued"
      case "processing":
        return "Generating"
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Unknown"
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Active Jobs ({jobs.length})</h3>
      </div>

      <AnimatePresence>
        {jobs.map((job) => (
          <motion.div
            key={job.jobId}
            className="bg-background-surface border border-border-default rounded-lg p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(job.status)}
                <span className="text-sm font-medium">{getStatusText(job.status)}</span>
                <span className="text-xs text-text-muted">#{job.jobId.slice(-8)}</span>
              </div>

              {(job.status === "pending" || job.status === "processing") && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(job.jobId)}
                  className="h-8 w-8 p-0 text-text-muted hover:text-status-danger"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Progress for active jobs */}
            {(job.status === "pending" || job.status === "processing") && (
              <ProgressIndicator
                progress={job.progress}
                isActive={true}
                eta={job.eta}
                onCancel={onCancel ? () => onCancel(job.jobId) : undefined}
              />
            )}

            {/* Error message */}
            {job.status === "failed" && job.error && (
              <div className="mt-2 p-2 bg-status-danger/10 border border-status-danger/20 rounded text-sm text-status-danger">
                {job.error}
              </div>
            )}

            {/* Job metadata */}
            <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
              <span>Model: {job.modelId}</span>
              <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
