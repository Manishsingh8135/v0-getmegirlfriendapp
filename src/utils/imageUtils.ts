export function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Invalid file type. Please use JPEG, PNG, or WebP." }
  }

  if (file.size > maxSize) {
    return { valid: false, error: "File too large. Maximum size is 10MB." }
  }

  return { valid: true }
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const { width, height } = img
      const ratio = Math.min(maxWidth / width, maxHeight / height)

      canvas.width = width * ratio
      canvas.height = height * ratio

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Failed to resize image"))
        },
        file.type,
        quality,
      )
    }

    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = URL.createObjectURL(file)
  })
}

export function createMaskFromCanvas(canvas: HTMLCanvasElement): string {
  // Convert canvas to base64 PNG for mask data
  return canvas.toDataURL("image/png")
}

export function downloadImage(url: string, filename: string): void {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
