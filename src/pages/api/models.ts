import type { NextApiRequest, NextApiResponse } from "next"
import { modelRegistry } from "../../lib/modelRegistry"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const models = modelRegistry.getAvailableModels()

    // Remove sensitive adapter information
    const publicModels = models.map((model) => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      capabilities: model.capabilities,
      pricing: model.pricing,
    }))

    res.status(200).json({
      models: publicModels,
      count: publicModels.length,
    })
  } catch (error) {
    console.error("Models API error:", error)
    res.status(500).json({ error: "Failed to get models" })
  }
}
