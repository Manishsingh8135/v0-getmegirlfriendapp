import type { NextApiRequest, NextApiResponse } from "next"
import { jobStore } from "../../../lib/jobStore"
import type { Job } from "../../../types"

export default async function handler(req: NextApiRequest, res: NextApiResponse<Job | { error: string }>) {
  const { id } = req.query

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid job ID" })
  }

  if (req.method === "GET") {
    try {
      const job = await jobStore.get(id)

      if (!job) {
        return res.status(404).json({ error: "Job not found" })
      }

      res.status(200).json(job)
    } catch (error) {
      console.error("Job status error:", error)
      res.status(500).json({ error: "Failed to get job status" })
    }
  } else if (req.method === "DELETE") {
    // Cancel job
    try {
      const success = await jobStore.delete(id)

      if (!success) {
        return res.status(404).json({ error: "Job not found" })
      }

      res.status(200).json({ message: "Job cancelled" } as any)
    } catch (error) {
      console.error("Job cancellation error:", error)
      res.status(500).json({ error: "Failed to cancel job" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}

// TODO: For production, consider implementing WebSocket or Server-Sent Events for real-time updates
/*
// Example WebSocket implementation:
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'

interface NextApiResponseServerIO extends NextApiResponse {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

// In your job processing logic:
function notifyJobUpdate(jobId: string, job: Job) {
  if (global.io) {
    global.io.to(`job-${jobId}`).emit('job-update', job)
  }
}

// Client-side connection:
const socket = io()
socket.emit('join-job', jobId)
socket.on('job-update', (job) => {
  // Update UI with job status
})
*/
