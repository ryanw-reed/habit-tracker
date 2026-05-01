import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function App() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Habit Tracker</CardTitle>
          <CardDescription>
            Setup verified. Ready to build features.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            React + Vite + TypeScript + Tailwind + shadcn/ui are all wired up.
            Supabase backend lands in the next phase.
          </p>
          <Button className="self-start">Looks good</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
