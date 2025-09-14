"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useGesture } from "react-use-gesture"
import { motion, AnimatePresence } from "framer-motion"
import { ZoomIn, ZoomOut, RotateCcw, Download, Eye, EyeOff } from "lucide-react"
import { Button } from "./ui/button"
import { downloadImage } from "../utils/imageUtils"

interface CanvasProps {
  originalImage?: string
  currentImage?: string
  previewImages?: string[]
  isLoading?: boolean
  onImageLoad?: (dimensions: { width: number; height: number }) => void
  className?: string
}

export function Canvas({
  originalImage,
  currentImage,
  previewImages = [],
  isLoading = false,
  onImageLoad,
  className = "",
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [showOriginal, setShowOriginal] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)

  // Progressive preview cycling
  useEffect(() => {
    if (previewImages.length > 1 && isLoading) {
      const interval = setInterval(() => {
        setCurrentPreviewIndex((prev) => (prev < previewImages.length - 1 ? prev + 1 : prev))
      }, 2000) // Switch preview every 2 seconds

      return () => clearInterval(interval)
    }
  }, [previewImages.length, isLoading])

  // Reset transform when image changes
  useEffect(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }, [currentImage, originalImage])

  const displayImage =
    showOriginal && originalImage ? originalImage : currentImage || previewImages[currentPreviewIndex]

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget
      const dimensions = { width: img.naturalWidth, height: img.naturalHeight }
      setImageDimensions(dimensions)
      onImageLoad?.(dimensions)
    },
    [onImageLoad],
  )

  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }, [])

  const zoomIn = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.min(prev.scale * 1.5, 5) }))
  }, [])

  const zoomOut = useCallback(() => {
    setTransform((prev) => ({ ...prev, scale: Math.max(prev.scale / 1.5, 0.1) }))
  }, [])

  const handleDownload = useCallback(() => {
    if (displayImage) {
      const filename = `generated-image-${Date.now()}.png`
      downloadImage(displayImage, filename)
    }
  }, [displayImage])

  // Gesture handling for pinch-to-zoom and pan
  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y], memo = transform }) => {
        if (transform.scale > 1) {
          setTransform((prev) => ({ ...prev, x: memo.x + x, y: memo.y + y }))
        }
        return memo
      },
      onPinch: ({ offset: [scale], origin: [ox, oy], memo = transform }) => {
        const newScale = Math.max(0.1, Math.min(5, memo.scale * scale))
        setTransform((prev) => ({
          ...prev,
          scale: newScale,
          x: memo.x + (ox - memo.x) * (1 - scale),
          y: memo.y + (oy - memo.y) * (1 - scale),
        }))
        return memo
      },
      onWheel: ({ delta: [, dy], ctrlKey }) => {
        if (ctrlKey) {
          const scaleFactor = dy > 0 ? 0.9 : 1.1
          setTransform((prev) => ({
            ...prev,
            scale: Math.max(0.1, Math.min(5, prev.scale * scaleFactor)),
          }))
        }
      },
    },
    {
      drag: { threshold: 10 },
      pinch: { threshold: 0.1 },
      wheel: { preventDefault: true },
    },
  )

  return (
    <div className={`canvas-container relative ${className}`} ref={containerRef}>
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="secondary" size="sm" onClick={zoomIn} className="bg-background-surface/90 backdrop-blur-sm">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="secondary" size="sm" onClick={zoomOut} className="bg-background-surface/90 backdrop-blur-sm">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={resetTransform}
          className="bg-background-surface/90 backdrop-blur-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        {displayImage && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className="bg-background-surface/90 backdrop-blur-sm"
          >
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Compare Toggle */}
      {originalImage && currentImage && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
            className="bg-background-surface/90 backdrop-blur-sm"
          >
            {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="ml-2 text-sm">{showOriginal ? "Hide Original" : "Show Original"}</span>
          </Button>
        </div>
      )}

      {/* Image Container */}
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden touch-manipulation"
        {...bind()}
        style={{ cursor: transform.scale > 1 ? "grab" : "default" }}
      >
        <AnimatePresence mode="wait">
          {displayImage ? (
            <motion.img
              key={displayImage}
              ref={imageRef}
              src={displayImage}
              alt="Generated or uploaded image"
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transformOrigin: "center",
                transition: "transform 0.1s ease-out",
              }}
              onLoad={handleImageLoad}
              onDragStart={(e) => e.preventDefault()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <motion.div
              className="flex flex-col items-center justify-center text-text-muted p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-24 h-24 border-2 border-dashed border-border-default rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-center">Upload an image or generate one to get started</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-background-overlay flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-background-surface rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
              <div>
                <p className="text-sm font-medium">Generating image...</p>
                {previewImages.length > 0 && (
                  <p className="text-xs text-text-muted">
                    Preview {currentPreviewIndex + 1} of {previewImages.length}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Image Info */}
      {imageDimensions.width > 0 && (
        <div className="absolute bottom-4 left-4 bg-background-surface/90 backdrop-blur-sm rounded px-3 py-1 text-xs text-text-muted">
          {imageDimensions.width} × {imageDimensions.height} • {Math.round(transform.scale * 100)}%
        </div>
      )}
    </div>
  )
}
