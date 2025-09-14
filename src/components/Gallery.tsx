"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { History, Download, Trash2, Eye, X } from "lucide-react"
import { Button } from "./ui/button"
import type { Job } from "../types"
import { downloadImage } from "../utils/imageUtils"

interface GalleryProps {
  jobs: Job[]
  onRestore?: (job: Job) => void
  onDelete?: (jobId: string) => void
  className?: string
}

export function Gallery({ jobs, onRestore, onDelete, className = "" }: GalleryProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const completedJobs = jobs.filter((job) => job.status === "completed" && job.finalUrl)

  const handleDownload = (job: Job) => {
    if (job.finalUrl) {
      downloadImage(job.finalUrl, `generated-${job.jobId}.png`)
    }
  }

  const handlePreview = (job: Job) => {
    setSelectedJob(job)
  }

  if (completedJobs.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <History className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-muted">No generated images yet</p>
        <p className="text-sm text-text-muted mt-1">Your completed generations will appear here</p>
      </div>
    )
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Generations
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {completedJobs.map((job) => (
            <motion.div
              key={job.jobId}
              className="group relative bg-background-surface rounded-lg overflow-hidden border border-border-default hover:border-border-focus transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={job.finalUrl || "/placeholder.svg"}
                  alt={`Generated image ${job.jobId}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-background-overlay opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreview(job)}
                      className="bg-background-surface/90"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(job)}
                      className="bg-background-surface/90"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {onRestore && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onRestore(job)}
                        className="bg-background-surface/90"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onDelete(job.jobId)}
                        className="bg-background-surface/90 text-status-danger hover:text-status-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="text-xs text-text-muted truncate">{new Date(job.createdAt).toLocaleDateString()}</p>
                <p className="text-xs text-text-muted">Model: {job.modelId}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            className="fixed inset-0 bg-background-overlay z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              className="bg-background-surface rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border-default flex items-center justify-between">
                <h3 className="font-semibold">Generated Image</h3>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => handleDownload(selectedJob)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <img
                  src={selectedJob.finalUrl || "/placeholder.svg"}
                  alt="Generated image preview"
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
