"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import { MobileNavigation } from "./MobileNavigation"
import { useMobile } from "../hooks/use-mobile"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  mobileNavigation?: React.ReactNode
  className?: string
}

export function ResponsiveLayout({ children, sidebar, mobileNavigation, className = "" }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const isMobile = useMobile()

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false)
    }
  }, [isMobile])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobile, sidebarOpen])

  return (
    <div className={`flex h-screen ${className}`}>
      {/* Desktop Sidebar */}
      {!isMobile && sidebar && (
        <aside className="w-96 border-r border-border-default bg-background-surface">{sidebar}</aside>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="flex items-center justify-between p-4 border-b border-border-default bg-background-surface">
            <h1 className="text-lg font-semibold">AI Image Generator</h1>
            {sidebar && (
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="h-10 w-10 p-0">
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </header>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">{children}</div>

        {/* Mobile Navigation */}
        {isMobile && mobileNavigation && <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebar && (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-background-overlay z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />

              {/* Sidebar */}
              <motion.aside
                className="fixed top-0 right-0 bottom-0 w-80 bg-background-surface border-l border-border-default z-50 overflow-y-auto"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <div className="p-4 border-b border-border-default flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Controls</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">{sidebar}</div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
