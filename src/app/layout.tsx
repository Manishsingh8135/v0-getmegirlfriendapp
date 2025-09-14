import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ToastProvider } from "../components/Toasts"
import "../styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate and edit images with AI - Mobile-first image generation app",
  keywords: ["AI", "image generation", "photo editing", "artificial intelligence"],
  authors: [{ name: "AI Image Generator" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: "#6366f1",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Image Generator" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans bg-gray-50 text-slate-900 overflow-x-hidden">
        <ToastProvider>
          <div className="min-h-screen flex flex-col">{children}</div>
        </ToastProvider>
      </body>
    </html>
  )
}
