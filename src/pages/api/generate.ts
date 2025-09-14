import type { NextApiRequest, NextApiResponse } from "next"
import { modelRegistry } from "../../lib/modelRegistry"
import type { GenerationParams, Job } from "../../types"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Job | { error: string }>) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const params: GenerationParams = req.body

    // Validate required fields
    if (!params.prompt || !params.mode) {
      return res.status(400).json({ error: "Missing required fields: prompt, mode" })
    }

    // Sanitize prompt (remove PII, inappropriate content)
    const sanitizedParams = {
      ...params,
      prompt: sanitizePrompt(params.prompt),
      negativePrompt: params.negativePrompt ? sanitizePrompt(params.negativePrompt) : undefined,
    }

    // Get appropriate adapter for the mode
    const adapter = modelRegistry.getAdapterForMode(params.mode)

    // Start generation
    const job = await adapter.generate(sanitizedParams)

    // Log generation request (without PII)
    console.log(`Generation started: ${job.jobId}, mode: ${params.mode}, model: ${job.modelId}`)

    res.status(200).json(job)
  } catch (error) {
    console.error("Generation error:", error)
    res.status(500).json({
      error: error instanceof Error ? error.message : "Generation failed",
    })
  }
}

function sanitizePrompt(prompt: string): string {
  // Remove potential PII and inappropriate content
  let sanitized = prompt.trim()

  // Remove email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]")

  // Remove phone numbers (basic pattern)
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")

  // Remove potential credit card numbers
  sanitized = sanitized.replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, "[CARD]")

  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500) + "..."
  }

  return sanitized
}
