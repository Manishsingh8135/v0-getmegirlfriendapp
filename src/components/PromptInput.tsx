"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Sparkles, X, Copy, Wand2 } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { useToast } from "./Toasts"
import presets from "../config/presets.json"
import type { Preset } from "../types"

interface PromptInputProps {
  prompt: string
  negativePrompt: string
  onPromptChange: (prompt: string) => void
  onNegativePromptChange: (negativePrompt: string) => void
  onGenerate: () => void
  isGenerating?: boolean
  selectedPreset?: string
  onPresetChange?: (presetId: string) => void
  className?: string
}

const quickPrompts = [
  "beautiful portrait",
  "stunning landscape",
  "modern architecture",
  "abstract art",
  "vintage style",
  "cyberpunk aesthetic",
  "minimalist design",
  "dramatic lighting",
]

export function PromptInput({
  prompt,
  negativePrompt,
  onPromptChange,
  onNegativePromptChange,
  onGenerate,
  isGenerating = false,
  selectedPreset,
  onPresetChange,
  className = "",
}: PromptInputProps) {
  const [showNegativePrompt, setShowNegativePrompt] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const { addToast } = useToast()

  const typedPresets = presets as Preset[]
  const currentPreset = typedPresets.find((p) => p.id === selectedPreset)

  // Auto-resize textarea
  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto"
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`
    }
  }, [prompt])

  const handleQuickPrompt = (quickPrompt: string) => {
    const newPrompt = prompt ? `${prompt}, ${quickPrompt}` : quickPrompt
    onPromptChange(newPrompt)
  }

  const handlePresetSelect = (preset: Preset) => {
    onPresetChange?.(preset.id)
    if (preset.parameters.negativePrompt && !negativePrompt) {
      onNegativePromptChange(preset.parameters.negativePrompt)
    }
    setShowPresets(false)
    addToast({
      type: "success",
      title: "Preset applied",
      message: `${preset.name} style has been applied`,
      duration: 3000,
    })
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    addToast({
      type: "success",
      title: "Copied to clipboard",
      message: "Prompt has been copied",
      duration: 2000,
    })
  }

  const handleEnhancePrompt = () => {
    // Simple prompt enhancement - in real app, this could call an AI service
    const enhancements = [
      "highly detailed",
      "professional quality",
      "perfect composition",
      "vibrant colors",
      "sharp focus",
    ]
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)]
    const enhancedPrompt = prompt ? `${prompt}, ${randomEnhancement}` : randomEnhancement
    onPromptChange(enhancedPrompt)
    addToast({
      type: "info",
      title: "Prompt enhanced",
      message: "Added quality improvements to your prompt",
      duration: 3000,
    })
  }

  const canGenerate = prompt.trim().length > 0 && !isGenerating

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preset Selection */}
      <div className="relative">
        <Button variant="outline" onClick={() => setShowPresets(!showPresets)} className="w-full justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>{currentPreset ? currentPreset.name : "Choose a style preset"}</span>
          </div>
          {showPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              className="absolute top-full left-0 right-0 z-10 mt-2 bg-background-surface border border-border-default rounded-lg shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {typedPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="w-full px-4 py-3 text-left hover:bg-background-elevated transition-colors border-b border-border-muted last:border-b-0"
                >
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-xs text-text-muted mt-1">{preset.description}</div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Prompt Input */}
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            ref={promptRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe what you want to generate..."
            className="min-h-[100px] resize-none pr-20"
            maxLength={500}
          />
          <div className="absolute top-3 right-3 flex space-x-1">
            <Button variant="ghost" size="sm" onClick={handleCopyPrompt} className="h-8 w-8 p-0">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEnhancePrompt} className="h-8 w-8 p-0">
              <Wand2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>{prompt.length}/500 characters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNegativePrompt(!showNegativePrompt)}
            className="h-auto p-0 text-xs"
          >
            {showNegativePrompt ? "Hide" : "Add"} negative prompt
          </Button>
        </div>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="space-y-2">
        <p className="text-xs text-text-muted">Quick additions:</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((quickPrompt) => (
            <Button
              key={quickPrompt}
              variant="outline"
              size="sm"
              onClick={() => handleQuickPrompt(quickPrompt)}
              className="h-7 px-3 text-xs"
            >
              {quickPrompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Negative Prompt */}
      <AnimatePresence>
        {showNegativePrompt && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Negative prompt</label>
              <Button variant="ghost" size="sm" onClick={() => setShowNegativePrompt(false)} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={negativePrompt}
              onChange={(e) => onNegativePromptChange(e.target.value)}
              placeholder="What you don't want in the image..."
              className="min-h-[60px] resize-none"
              maxLength={200}
            />
            <div className="text-xs text-text-muted text-right">{negativePrompt.length}/200 characters</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <Button onClick={onGenerate} disabled={!canGenerate} className="w-full h-12 text-base font-medium" size="lg">
        {isGenerating ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Generating...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Generate Image</span>
          </div>
        )}
      </Button>
    </div>
  )
}
