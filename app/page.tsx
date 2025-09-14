import { GenerationWorkspace } from "../src/components/GenerationWorkspace"
import { ToastProvider } from "../src/components/Toasts"

export default function HomePage() {
  return (
    <main className="flex-1">
      <ToastProvider>
        <GenerationWorkspace />
      </ToastProvider>
    </main>
  )
}
