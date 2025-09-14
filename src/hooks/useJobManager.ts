"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Job, GenerationParams, EditParams } from "../types"
import { useToast } from "../components/Toasts"

interface UseJobManagerReturn {
  activeJobs: Job[]
  completedJobs: Job[]
  isGenerating: boolean
  startGeneration: (params: GenerationParams) => Promise<string>
  startEditing: (params: EditParams) => Promise<string>
  cancelJob: (jobId: string) => Promise<boolean>
  getJobStatus: (jobId: string) => Promise<Job | null>
  clearCompletedJobs: () => void
}

export function useJobManager(): UseJobManagerReturn {
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [completedJobs, setCompletedJobs] = useState<Job[]>([])
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const { addToast } = useToast()

  const isGenerating = activeJobs.some((job) => job.status === "pending" || job.status === "processing")

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach((interval) => clearInterval(interval))
      pollingIntervals.current.clear()
    }
  }, [])

  const pollJobStatus = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`/api/job/${jobId}`)
        if (!response.ok) {
          throw new Error(`Failed to get job status: ${response.statusText}`)
        }

        const job: Job = await response.json()

        // Update active jobs
        setActiveJobs((prev) => {
          const index = prev.findIndex((j) => j.jobId === jobId)
          if (index === -1) return prev

          const updated = [...prev]
          updated[index] = job
          return updated
        })

        // Move to completed if finished
        if (job.status === "completed" || job.status === "failed" || job.status === "cancelled") {
          // Stop polling
          const interval = pollingIntervals.current.get(jobId)
          if (interval) {
            clearInterval(interval)
            pollingIntervals.current.delete(jobId)
          }

          // Move to completed jobs
          setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId))

          if (job.status === "completed") {
            setCompletedJobs((prev) => [job, ...prev])

            addToast({
              type: "success",
              title: "Generation completed",
              message: "Your image has been generated successfully",
              duration: 5000,
              action: {
                label: "View",
                onClick: () => {
                  // Could scroll to canvas or open gallery
                  console.log("View completed job:", jobId)
                },
              },
            })
          } else if (job.status === "failed") {
            addToast({
              type: "error",
              title: "Generation failed",
              message: job.error || "An error occurred during generation",
              duration: 8000,
              action: {
                label: "Retry",
                onClick: () => {
                  // Could implement retry logic
                  console.log("Retry failed job:", jobId)
                },
              },
            })
          }
        }

        return job
      } catch (error) {
        console.error("Error polling job status:", error)

        // Stop polling on error
        const interval = pollingIntervals.current.get(jobId)
        if (interval) {
          clearInterval(interval)
          pollingIntervals.current.delete(jobId)
        }

        // Remove from active jobs
        setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId))

        addToast({
          type: "error",
          title: "Connection error",
          message: "Lost connection to generation service",
          duration: 5000,
        })

        return null
      }
    },
    [addToast],
  )

  const startPolling = useCallback(
    (jobId: string) => {
      // Don't start if already polling
      if (pollingIntervals.current.has(jobId)) return

      const interval = setInterval(() => {
        pollJobStatus(jobId)
      }, 2000) // Poll every 2 seconds

      pollingIntervals.current.set(jobId, interval)

      // Initial poll
      pollJobStatus(jobId)
    },
    [pollJobStatus],
  )

  const startGeneration = useCallback(
    async (params: GenerationParams): Promise<string> => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Generation failed")
        }

        const job: Job = await response.json()

        // Add to active jobs
        setActiveJobs((prev) => [...prev, job])

        // Start polling for status updates
        startPolling(job.jobId)

        addToast({
          type: "info",
          title: "Generation started",
          message: "Your image is being generated...",
          duration: 3000,
        })

        return job.jobId
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start generation"

        addToast({
          type: "error",
          title: "Generation failed",
          message,
          duration: 5000,
        })

        throw error
      }
    },
    [startPolling, addToast],
  )

  const startEditing = useCallback(
    async (params: EditParams): Promise<string> => {
      try {
        const response = await fetch("/api/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Editing failed")
        }

        const job: Job = await response.json()

        // Add to active jobs
        setActiveJobs((prev) => [...prev, job])

        // Start polling for status updates
        startPolling(job.jobId)

        addToast({
          type: "info",
          title: "Editing started",
          message: "Your image is being edited...",
          duration: 3000,
        })

        return job.jobId
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start editing"

        addToast({
          type: "error",
          title: "Editing failed",
          message,
          duration: 5000,
        })

        throw error
      }
    },
    [startPolling, addToast],
  )

  const cancelJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/job/${jobId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to cancel job")
        }

        // Stop polling
        const interval = pollingIntervals.current.get(jobId)
        if (interval) {
          clearInterval(interval)
          pollingIntervals.current.delete(jobId)
        }

        // Remove from active jobs
        setActiveJobs((prev) => prev.filter((j) => j.jobId !== jobId))

        addToast({
          type: "info",
          title: "Job cancelled",
          message: "Generation has been cancelled",
          duration: 3000,
        })

        return true
      } catch (error) {
        addToast({
          type: "error",
          title: "Cancellation failed",
          message: "Could not cancel the job",
          duration: 3000,
        })

        return false
      }
    },
    [addToast],
  )

  const getJobStatus = useCallback(
    async (jobId: string): Promise<Job | null> => {
      return pollJobStatus(jobId)
    },
    [pollJobStatus],
  )

  const clearCompletedJobs = useCallback(() => {
    setCompletedJobs([])
    addToast({
      type: "info",
      title: "History cleared",
      message: "All completed jobs have been removed",
      duration: 2000,
    })
  }, [addToast])

  return {
    activeJobs,
    completedJobs,
    isGenerating,
    startGeneration,
    startEditing,
    cancelJob,
    getJobStatus,
    clearCompletedJobs,
  }
}
