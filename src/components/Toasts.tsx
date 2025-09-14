"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react"
import { Button } from "../../components/ui/button"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove toast after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-status-success" />
      case "error":
        return <XCircle className="w-5 h-5 text-status-danger" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-status-warning" />
      case "info":
        return <Info className="w-5 h-5 text-status-info" />
    }
  }

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-status-success/20 bg-status-success/5"
      case "error":
        return "border-status-danger/20 bg-status-danger/5"
      case "warning":
        return "border-status-warning/20 bg-status-warning/5"
      case "info":
        return "border-status-info/20 bg-status-info/5"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`border rounded-lg p-4 shadow-lg backdrop-blur-sm ${getBackgroundColor(toast.type)}`}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-high">{toast.title}</p>
                {toast.message && <p className="text-sm text-text-muted mt-1">{toast.message}</p>}
                {toast.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toast.action.onClick}
                    className="mt-2 h-auto p-0 text-brand-primary hover:text-brand-primary"
                  >
                    {toast.action.label}
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(toast.id)}
                className="h-6 w-6 p-0 text-text-muted hover:text-text-high"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
