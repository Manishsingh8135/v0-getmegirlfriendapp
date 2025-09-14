"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Brush, Eraser, Undo, RotateCcw, Download, Minus, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Slider } from "./ui/slider"
import { useToast } from "./Toasts"
import { createMaskFromCanvas } from "../utils/imageUtils"

interface MaskBrushProps {
  imageUrl?: string
  onMaskChange?: (maskDataUrl: string) => void
  className?: string
}

interface Point {
  x: number
  y: number
  pressure?: number
}

interface Stroke {
  points: Point[]
  brushSize: number
  isEraser: boolean
}

export function MaskBrush({ imageUrl, onMaskChange, className = "" }: MaskBrushProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(20)
  const [isEraser, setIsEraser] = useState(false)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  const { addToast } = useToast()

  // Initialize canvas when image loads
  useEffect(() => {
    if (imageUrl && imageRef.current && canvasRef.current) {
      const img = imageRef.current
      const canvas = canvasRef.current

      img.onload = () => {
        const container = containerRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        const aspectRatio = img.naturalWidth / img.naturalHeight

        let canvasWidth, canvasHeight

        if (containerRect.width / containerRect.height > aspectRatio) {
          canvasHeight = Math.min(containerRect.height, 600)
          canvasWidth = canvasHeight * aspectRatio
        } else {
          canvasWidth = Math.min(containerRect.width, 800)
          canvasHeight = canvasWidth / aspectRatio
        }

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        setCanvasSize({ width: canvasWidth, height: canvasHeight })
        setImageLoaded(true)

        // Draw initial transparent mask
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight)
          ctx.fillStyle = "rgba(0, 0, 0, 0)"
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        }
      }

      img.src = imageUrl
    }
  }, [imageUrl])

  // Redraw canvas when strokes change
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up for mask drawing
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return

      ctx.globalCompositeOperation = stroke.isEraser ? "destination-out" : "source-over"
      ctx.strokeStyle = stroke.isEraser ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = stroke.brushSize

      ctx.beginPath()
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i]
        ctx.lineTo(point.x, point.y)
      }

      ctx.stroke()
    })

    // Draw current stroke
    if (currentStroke.length > 1) {
      ctx.globalCompositeOperation = isEraser ? "destination-out" : "source-over"
      ctx.strokeStyle = isEraser ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = brushSize

      ctx.beginPath()
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y)

      for (let i = 1; i < currentStroke.length; i++) {
        const point = currentStroke[i]
        ctx.lineTo(point.x, point.y)
      }

      ctx.stroke()
    }

    // Notify parent of mask changes
    if (onMaskChange && strokes.length > 0) {
      const maskDataUrl = createMaskFromCanvas(canvas)
      onMaskChange(maskDataUrl)
    }
  }, [strokes, currentStroke, brushSize, isEraser, imageLoaded, onMaskChange])

  const getPointFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
        pressure: (touch as any).force || 1,
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        pressure: 1,
      }
    }
  }, [])

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      setIsDrawing(true)
      const point = getPointFromEvent(e)
      setCurrentStroke([point])
    },
    [getPointFromEvent],
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()

      const point = getPointFromEvent(e)
      setCurrentStroke((prev) => [...prev, point])
    },
    [isDrawing, getPointFromEvent],
  )

  const stopDrawing = useCallback(() => {
    if (!isDrawing || currentStroke.length === 0) return

    setIsDrawing(false)

    // Add completed stroke to strokes array
    const newStroke: Stroke = {
      points: currentStroke,
      brushSize,
      isEraser,
    }

    setStrokes((prev) => [...prev, newStroke])
    setCurrentStroke([])
  }, [isDrawing, currentStroke, brushSize, isEraser])

  const undoLastStroke = useCallback(() => {
    if (strokes.length === 0) return

    setStrokes((prev) => prev.slice(0, -1))
    addToast({
      type: "info",
      title: "Stroke undone",
      message: "Last brush stroke has been removed",
      duration: 2000,
    })
  }, [strokes.length, addToast])

  const clearMask = useCallback(() => {
    setStrokes([])
    setCurrentStroke([])
    addToast({
      type: "info",
      title: "Mask cleared",
      message: "All brush strokes have been removed",
      duration: 2000,
    })
  }, [addToast])

  const downloadMask = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement("a")
    link.download = `mask-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()

    addToast({
      type: "success",
      title: "Mask downloaded",
      message: "Mask has been saved to your device",
      duration: 3000,
    })
  }, [addToast])

  if (!imageUrl) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Brush className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <p className="text-text-muted">Upload an image to start masking</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Brush Controls */}
      <div className="flex items-center justify-between p-4 bg-background-surface border border-border-default rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Brush/Eraser Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={!isEraser ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEraser(false)}
              className="h-10 w-10 p-0"
            >
              <Brush className="w-4 h-4" />
            </Button>
            <Button
              variant={isEraser ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEraser(true)}
              className="h-10 w-10 p-0"
            >
              <Eraser className="w-4 h-4" />
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.max(5, brushSize - 5))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>

            <div className="w-24">
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBrushSize(Math.min(100, brushSize + 5))}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>

            <span className="text-sm text-text-muted min-w-[3ch]">{brushSize}px</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={undoLastStroke} disabled={strokes.length === 0}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={clearMask} disabled={strokes.length === 0}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={downloadMask} disabled={strokes.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative bg-background-surface border border-border-default rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      >
        {/* Background Image */}
        <img
          ref={imageRef}
          src={imageUrl || "/placeholder.svg"}
          alt="Image to mask"
          className="absolute inset-0 w-full h-full object-contain opacity-70"
          style={{ pointerEvents: "none" }}
        />

        {/* Mask Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-manipulation"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            maxWidth: "100%",
            maxHeight: "100%",
            margin: "auto",
            display: imageLoaded ? "block" : "none",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Brush Cursor */}
        {imageLoaded && (
          <div
            className="brush-cursor pointer-events-none"
            style={{
              width: `${brushSize}px`,
              height: `${brushSize}px`,
              borderColor: isEraser ? "#ef4444" : "#6366f1",
              backgroundColor: isEraser ? "rgba(239, 68, 68, 0.1)" : "rgba(99, 102, 241, 0.1)",
            }}
          />
        )}

        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-text-muted bg-background-elevated p-3 rounded-lg">
        <p className="mb-1">
          <strong>Instructions:</strong> Paint over areas you want to {isEraser ? "remove from" : "add to"} the mask.
        </p>
        <p>Use brush tool to add to mask, eraser tool to remove. Adjust brush size with the slider or +/- buttons.</p>
      </div>
    </div>
  )
}
