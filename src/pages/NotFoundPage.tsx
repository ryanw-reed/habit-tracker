import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 py-10 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist (yet).
      </p>
      <Button asChild>
        <Link to="/">Back to goals</Link>
      </Button>
    </div>
  )
}
