"use client"

import { useState, useEffect } from "react"
import type { Job } from "../types"

interface UseProgressiveImageReturn {
  currentImage: string | null
  previewImages: string[]
  isLoading: boolean
  progress: number
  eta: number | null
  error: string | null
}

export function useProgressiveImage(job: Job | null): UseProgressiveImageReturn {
  const [currentImage, setCurrentImage] = useState<string | null>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Update state based on job status
  useEffect(() => {
    if (!job) {
      setCurrentImage(null)
      setPreviewImages([])
      setIsLoading(false)
      return
    }

    setIsLoading(job.status === "pending" || job.status === "processing")

    // Update preview images
    if (job.previewUrls && job.previewUrls.length > 0) {
      setPreviewImages(job.previewUrls)
      // Use the latest preview as current image
      setCurrentImage(job.previewUrls[job.previewUrls.length - 1])
    }

    // Use final image when completed
    if (job.status === "completed" && job.finalUrl) {
      setCurrentImage(job.finalUrl)
      setIsLoading(false)
    }

    // Handle errors
    if (job.status === "failed") {
      setIsLoading(false)
    }
  }, [job])

  return {
    currentImage,
    previewImages,
    isLoading,
    progress: job?.progress || 0,
    eta: job?.eta || null,
    error: job?.error || null,
  }
}
