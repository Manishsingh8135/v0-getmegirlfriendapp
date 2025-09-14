export async function getSignedUploadUrl(filename: string, contentType: string): Promise<string> {
  // TODO: Replace with actual signed URL generation
  // This would typically call your backend API to get a signed URL from S3/CloudFlare R2/etc

  try {
    const response = await fetch("/api/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename,
        contentType,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get upload URL")
    }

    const data = await response.json()
    return data.uploadUrl
  } catch (error) {
    console.error("Error getting signed upload URL:", error)
    throw error
  }
}

export async function uploadFileToSignedUrl(file: File, signedUrl: string): Promise<void> {
  try {
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to upload file")
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export function generateThumbnail(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const { width, height } = img
      const ratio = Math.min(maxSize / width, maxSize / height)

      canvas.width = width * ratio
      canvas.height = height * ratio

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)

      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8)
      resolve(thumbnailUrl)
    }

    img.onerror = () => reject(new Error("Failed to load image for thumbnail"))
    img.src = URL.createObjectURL(file)
  })
}
