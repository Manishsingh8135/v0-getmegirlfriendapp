"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Camera, Palette, Sparkles } from "lucide-react"
import modes from "../config/modes.json"
import type { Mode } from "../types"

interface ModesSelectorProps {
  selectedMode?: string
  onModeSelect: (mode: Mode) => void
  className?: string
}

const modeIcons = {
  people: Heart,
  portrait: Camera,
  style: Palette,
  default: Sparkles,
}

export function ModesSelector({ selectedMode, onModeSelect, className = "" }: ModesSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null)
  const typedModes = modes as Mode[]

  const getModeIcon = (category: string) => {
    return modeIcons[category as keyof typeof modeIcons] || modeIcons.default
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-brand-primary" />
        <h3 className="text-lg font-semibold">Generation Modes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {typedModes.map((mode) => {
          const IconComponent = getModeIcon(mode.category)
          const isSelected = selectedMode === mode.id
          const isHovered = hoveredMode === mode.id

          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeSelect(mode)}
              onMouseEnter={() => setHoveredMode(mode.id)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`
                relative p-6 rounded-xl border-2 text-left transition-all duration-200
                ${
                  isSelected
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-border-default bg-background-surface hover:border-brand-primary/50 hover:bg-background-elevated"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-3 right-3 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Mode Icon */}
              <div className="mb-4">
                <div
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                    ${isSelected ? "bg-brand-primary text-white" : "bg-background-elevated text-brand-primary"}
                  `}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>

              {/* Mode Info */}
              <div className="space-y-2">
                <h4 className="font-semibold text-base">{mode.name}</h4>
                <p className="text-sm text-text-muted leading-relaxed">{mode.description}</p>

                {/* Mode Details */}
                <div className="pt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Aspect Ratio</span>
                    <span className="font-medium">{mode.defaultAspect}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Recommended Size</span>
                    <span className="font-medium">{mode.recommendedSize}</span>
                  </div>
                  {mode.preserveFaces && (
                    <div className="flex items-center space-x-1 text-xs text-status-success">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Preserves faces</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Effect */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 opacity-0"
                animate={{ opacity: isHovered && !isSelected ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>
          )
        })}
      </div>

      {/* Mode Template Preview */}
      {selectedMode && (
        <motion.div
          className="p-4 bg-background-elevated rounded-lg border border-border-default"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="font-medium text-sm mb-2">Prompt Template Preview</h4>
          <p className="text-xs text-text-muted font-mono bg-background-surface p-3 rounded border">
            {typedModes
              .find((m) => m.id === selectedMode)
              ?.promptTemplate.replace("{userPrompt}", "[Your prompt will be inserted here]")}
          </p>
        </motion.div>
      )}
    </div>
  )
}
