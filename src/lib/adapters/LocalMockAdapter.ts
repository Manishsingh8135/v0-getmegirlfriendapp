import type { ModelAdapter, GenerationParams, EditParams, Job } from "../../types"
import { generateJobId } from "../../utils/imageUtils"
import { jobStore } from "../jobStore"

export class LocalMockAdapter implements ModelAdapter {
  private activeJobs: Map<string, NodeJS.Timeout> = new Map()

  async generate(params: GenerationParams): Promise<Job> {
    const jobId = generateJobId()

    const job: Job = {
      jobId,
      status: "pending",
      progress: 0,
      previewUrls: [],
      modelId: "local-mock",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await jobStore.create(job)

    // Start mock generation process
    this.simulateGeneration(jobId, params)

    return job
  }

  async edit(params: EditParams): Promise<Job> {
    const jobId = generateJobId()

    const job: Job = {
      jobId,
      status: "pending",
      progress: 0,
      previewUrls: [],
      modelId: "local-mock",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await jobStore.create(job)

    // Start mock editing process
    this.simulateEditing(jobId, params)

    return job
  }

  async status(jobId: string): Promise<Job> {
    const job = await jobStore.get(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }
    return job
  }

  async cancel(jobId: string): Promise<boolean> {
    const timeout = this.activeJobs.get(jobId)
    if (timeout) {
      clearTimeout(timeout)
      this.activeJobs.delete(jobId)

      await jobStore.update(jobId, {
        status: "cancelled",
        progress: 0,
      })

      return true
    }
    return false
  }

  private async simulateGeneration(jobId: string, params: GenerationParams) {
    try {
      // Update to processing
      await jobStore.update(jobId, {
        status: "processing",
        progress: 10,
        eta: 30,
      })

      // Generate low-res preview after 2 seconds
      const lowResTimeout = setTimeout(async () => {
        const lowResPreview = this.generatePlaceholderImage(256, 256, "Low-res preview")
        await jobStore.update(jobId, {
          progress: 40,
          previewUrls: [lowResPreview],
          eta: 20,
        })
      }, 2000)

      // Generate mid-res preview after 5 seconds
      const midResTimeout = setTimeout(async () => {
        const midResPreview = this.generatePlaceholderImage(512, 512, "Mid-res preview")
        await jobStore.update(jobId, {
          progress: 70,
          previewUrls: [midResPreview],
          eta: 10,
        })
      }, 5000)

      // Generate final image after 8 seconds
      const finalTimeout = setTimeout(async () => {
        const finalImage = this.generatePlaceholderImage(1024, 1024, "Final image")
        await jobStore.update(jobId, {
          status: "completed",
          progress: 100,
          finalUrl: finalImage,
          eta: 0,
        })

        this.activeJobs.delete(jobId)
      }, 8000)

      this.activeJobs.set(jobId, finalTimeout)
    } catch (error) {
      await jobStore.update(jobId, {
        status: "failed",
        error: "Mock generation failed",
      })
      this.activeJobs.delete(jobId)
    }
  }

  private async simulateEditing(jobId: string, params: EditParams) {
    try {
      // Similar to generation but with editing-specific logic
      await jobStore.update(jobId, {
        status: "processing",
        progress: 15,
        eta: 25,
      })

      const finalTimeout = setTimeout(async () => {
        const editedImage = this.generatePlaceholderImage(1024, 1024, "Edited image")
        await jobStore.update(jobId, {
          status: "completed",
          progress: 100,
          finalUrl: editedImage,
          eta: 0,
        })

        this.activeJobs.delete(jobId)
      }, 6000)

      this.activeJobs.set(jobId, finalTimeout)
    } catch (error) {
      await jobStore.update(jobId, {
        status: "failed",
        error: "Mock editing failed",
      })
      this.activeJobs.delete(jobId)
    }
  }

  private generatePlaceholderImage(width: number, height: number, text: string): string {
    // Generate a placeholder image URL with specified dimensions and text
    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(text)}`
  }
}
