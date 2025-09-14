import type { Job } from "../types"

// In-memory job storage for MVP
// TODO: Replace with Postgres/Redis for production
// CREATE TABLE jobs (
//   id VARCHAR(255) PRIMARY KEY,
//   status VARCHAR(50) NOT NULL,
//   progress INTEGER DEFAULT 0,
//   preview_urls TEXT[],
//   final_url TEXT,
//   model_id VARCHAR(255),
//   created_at TIMESTAMP DEFAULT NOW(),
//   updated_at TIMESTAMP DEFAULT NOW(),
//   error_message TEXT,
//   eta INTEGER
// );

class JobStore {
  private jobs: Map<string, Job> = new Map()

  async create(job: Job): Promise<Job> {
    this.jobs.set(job.jobId, job)
    return job
  }

  async get(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null
  }

  async update(jobId: string, updates: Partial<Job>): Promise<Job | null> {
    const job = this.jobs.get(jobId)
    if (!job) return null

    const updatedJob = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    }

    this.jobs.set(jobId, updatedJob)
    return updatedJob
  }

  async delete(jobId: string): Promise<boolean> {
    return this.jobs.delete(jobId)
  }

  async list(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async cleanup(): Promise<void> {
    // Remove jobs older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff) {
        this.jobs.delete(jobId)
      }
    }
  }
}

export const jobStore = new JobStore()

// Cleanup old jobs every hour
setInterval(
  () => {
    jobStore.cleanup()
  },
  60 * 60 * 1000,
)
