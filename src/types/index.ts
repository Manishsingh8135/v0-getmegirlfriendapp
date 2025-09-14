export interface Job {
  jobId: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  progress: number
  previewUrls: string[]
  finalUrl?: string
  modelId: string
  createdAt: Date
  updatedAt: Date
  error?: string
  eta?: number
}

export interface GenerationParams {
  prompt: string
  negativePrompt?: string
  mode: string
  size: string
  aspectRatio: string
  strength?: number
  seed?: number
}

export interface EditParams extends GenerationParams {
  imageUrl: string
  maskUrl: string
}

export interface ModelAdapter {
  generate(params: GenerationParams): Promise<Job>
  edit(params: EditParams): Promise<Job>
  status(jobId: string): Promise<Job>
  cancel(jobId: string): Promise<boolean>
}

export interface Mode {
  id: string
  name: string
  description: string
  promptTemplate: string
  preserveFaces: boolean
  defaultAspect: string
  recommendedSize: string
  strengthDefault: number
  category: string
}

export interface Preset {
  id: string
  name: string
  description: string
  parameters: {
    style: string
    negativePrompt: string
    steps: number
    guidance: number
  }
}
