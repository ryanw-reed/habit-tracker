import { Link, useParams } from "react-router-dom"
import { useGoal, useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { GoalHeader } from "@/components/goal/GoalHeader"
import { SectionsAccordion } from "@/components/goal/SectionsAccordion"
import { RoutesTabs } from "@/components/route/RoutesTabs"

export function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>()
  const goal = useGoal(goalId)
  const hydrated = useGoalsStore((s) => s.hydrated)

  if (!hydrated) {
    return null
  }

  if (!goal) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-8 py-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Goal not found</h1>
        <p className="text-sm text-muted-foreground">
          It may have been deleted or the link is wrong.
        </p>
        <Button asChild>
          <Link to="/">Back to goals</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <GoalHeader goal={goal} />

      <div className="mx-auto w-full max-w-5xl px-8 py-8">
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sections
          </h2>
          <SectionsAccordion goal={goal} />
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Routes
          </h2>
          <RoutesTabs goal={goal} />
        </section>
      </div>
    </div>
  )
}
