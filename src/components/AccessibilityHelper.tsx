"use client"

import type React from "react"

import { useEffect } from "react"

interface AccessibilityHelperProps {
  children: React.ReactNode
}

export function AccessibilityHelper({ children }: AccessibilityHelperProps) {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modals/overlays
      if (e.key === "Escape") {
        const activeElement = document.activeElement as HTMLElement
        if (activeElement && activeElement.blur) {
          activeElement.blur()
        }
      }

      // Tab navigation improvements
      if (e.key === "Tab") {
        // Ensure focus is visible
        document.body.classList.add("keyboard-navigation")
      }
    }

    // Remove keyboard navigation class on mouse use
    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation")
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  return <>{children}</>
}
