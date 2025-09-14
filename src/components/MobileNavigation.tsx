"use client"

import { motion } from "framer-motion"
import { Upload, History, Settings, Sparkles } from "lucide-react"
import { Button } from "./ui/button"

interface MobileNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

export function MobileNavigation({ activeTab, onTabChange, className = "" }: MobileNavigationProps) {
  const tabs = [
    { id: "generate", label: "Generate", icon: Sparkles },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className={`bg-background-surface border-t border-border-default ${className}`}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center space-y-1 h-auto py-2 px-3 min-w-[60px] relative
                ${isActive ? "text-brand-primary" : "text-text-muted"}
              `}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 w-1 h-1 bg-brand-primary rounded-full"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ transform: "translateX(-50%)" }}
                />
              )}
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
