"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { ChevronUp, ChevronDown, X } from "lucide-react"
import { Button } from "./ui/button"

interface BottomSheetMobileProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function BottomSheetMobile({ isOpen, onClose, title, children, className = "" }: BottomSheetMobileProps) {
  const [dragY, setDragY] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  // Reset state when sheet opens/closes
  useEffect(() => {
    if (isOpen) {
      setDragY(0)
      setIsExpanded(false)
    }
  }, [isOpen])

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    const velocity = info.velocity.y

    if (info.offset.y > threshold || velocity > 500) {
      onClose()
    } else if (info.offset.y < -threshold || velocity < -500) {
      setIsExpanded(true)
    } else {
      setDragY(0)
    }
  }

  const sheetHeight = isExpanded ? "90vh" : "60vh"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background-overlay z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className={`fixed bottom-0 left-0 right-0 bg-background-surface rounded-t-2xl shadow-xl z-50 ${className}`}
            style={{ height: sheetHeight }}
            initial={{ y: "100%" }}
            animate={{ y: dragY }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDrag={(event, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-border-default rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-default">
              <h2 className="text-lg font-semibold">{title}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
