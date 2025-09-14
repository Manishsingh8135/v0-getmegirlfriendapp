import type { ModelAdapter } from "../types"
import { LocalMockAdapter } from "./adapters/LocalMockAdapter"
import { GeminiAdapter } from "./adapters/GeminiAdapter"
import { BananaAdapter } from "./adapters/BananaAdapter"

interface ModelRegistryEntry {
  id: string
  name: string
  provider: string
  capabilities: {
    textToImage: boolean
    imageToImage: boolean
    inpainting: boolean
    maxResolution: string
    supportedFormats: string[]
  }
  pricing?: {
    costPerImage: number
    currency: string
  }
  adapter: ModelAdapter
}

class ModelRegistry {
  private models: Map<string, ModelRegistryEntry> = new Map()

  constructor() {
    this.initializeModels()
  }

  private initializeModels() {
    // Local Mock Adapter (for development)
    this.registerModel({
      id: "local-mock",
      name: "Local Mock Generator",
      provider: "local",
      capabilities: {
        textToImage: true,
        imageToImage: true,
        inpainting: true,
        maxResolution: "1024x1024",
        supportedFormats: ["png", "jpg", "webp"],
      },
      adapter: new LocalMockAdapter(),
    })

    // Gemini Adapter (requires GEMINI_API_KEY)
    if (process.env.GEMINI_API_KEY) {
      this.registerModel({
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        provider: "google",
        capabilities: {
          textToImage: true,
          imageToImage: true,
          inpainting: true,
          maxResolution: "1536x1536",
          supportedFormats: ["png", "jpg", "webp"],
        },
        pricing: {
          costPerImage: 0.05,
          currency: "USD",
        },
        adapter: new GeminiAdapter(),
      })
    }

    // Banana Adapter (requires BANANA_API_KEY)
    if (process.env.BANANA_API_KEY) {
      this.registerModel({
        id: "banana-stable-diffusion",
        name: "Stable Diffusion XL",
        provider: "banana",
        capabilities: {
          textToImage: true,
          imageToImage: true,
          inpainting: true,
          maxResolution: "1024x1024",
          supportedFormats: ["png", "jpg"],
        },
        pricing: {
          costPerImage: 0.02,
          currency: "USD",
        },
        adapter: new BananaAdapter(),
      })
    }
  }

  private registerModel(entry: ModelRegistryEntry) {
    this.models.set(entry.id, entry)
  }

  getAdapterForMode(mode: string): ModelAdapter {
    // Default to local mock for development
    const defaultModelId = process.env.NODE_ENV === "production" ? "gemini-pro-vision" : "local-mock"

    // Mode-specific model selection logic
    const modelId = this.selectModelForMode(mode) || defaultModelId
    const model = this.models.get(modelId)

    if (!model) {
      console.warn(`Model ${modelId} not found, falling back to local mock`)
      return this.models.get("local-mock")!.adapter
    }

    return model.adapter
  }

  private selectModelForMode(mode: string): string | null {
    // Mode-specific model selection logic
    switch (mode) {
      case "add-girlfriend":
        return "gemini-pro-vision" // Better for people generation
      case "studio-portrait":
        return "banana-stable-diffusion" // Good for portraits
      case "cartoonize":
        return "gemini-pro-vision" // Better for style transfer
      default:
        return null
    }
  }

  getAvailableModels(): ModelRegistryEntry[] {
    return Array.from(this.models.values())
  }

  getModel(modelId: string): ModelRegistryEntry | null {
    return this.models.get(modelId) || null
  }

  isModelAvailable(modelId: string): boolean {
    return this.models.has(modelId)
  }
}

export const modelRegistry = new ModelRegistry()
