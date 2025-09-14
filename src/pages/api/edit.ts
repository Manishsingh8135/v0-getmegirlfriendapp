import type { NextApiRequest, NextApiResponse } from "next"
import { modelRegistry } from "../../lib/modelRegistry"
import type { EditParams, Job } from "../../types"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Job | { error: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const params: EditParams = req.body

    // Validate required fields
    if (!params.prompt || !params.mode || !params.imageUrl || !params.maskUrl) {
      return res.status(400).json({
        error: "Missing required fields: prompt, mode, imageUrl, maskUrl",
      })
    }

    // Sanitize prompt
    const sanitizedParams = {
      ...params,
      prompt: sanitizePrompt(params.prompt),
      negativePrompt: params.negativePrompt ? sanitizePrompt(params.negativePrompt) : undefined,
    }

    // Get appropriate adapter for the mode
    const adapter = modelRegistry.getAdapterForMode(params.mode)

    // Start editing
    const job = await adapter.edit(sanitizedParams)

    // Log editing request (without PII)
    console.log(`Editing started: ${job.jobId}, mode: ${params.mode}, model: ${job.modelId}`)

    res.status(200).json(job)
  } catch (error) {
    console.error("Editing error:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Editing failed",
    })
  }
}

function sanitizePrompt(prompt: string): string {
  // Same sanitization logic as generate.ts
  let sanitized = prompt.trim()

  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
  sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CARD]")

  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + "..."
  }

  return sanitized
}
