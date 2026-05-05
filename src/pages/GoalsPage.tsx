import { PlusIcon, TargetIcon } from "lucide-react"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { NewGoalDialog } from "@/components/goal/NewGoalDialog"
import { GoalCard } from "@/components/goal/GoalCard"

export function GoalsPage() {
  const goals = useGoalsStore((s) => s.goals)
  const sorted = [...goals].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : -1
  )

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The end outcomes you're working toward.
          </p>
        </div>
        {goals.length > 0 && (
          <NewGoalDialog
            trigger={
              <Button>
                <PlusIcon className="size-4" />
                New goal
              </Button>
            }
          />
        )}
      </header>

      {goals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent-action/10 text-accent-action">
        <TargetIcon className="size-6" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight">
        Define your first goal
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        A goal is the outcome you want — like &ldquo;do 10 pull-ups in one
        set&rdquo;. You'll add routes and habits underneath it.
      </p>
      <NewGoalDialog
        trigger={
          <Button className="mt-6">
            <PlusIcon className="size-4" />
            Create your first goal
          </Button>
        }
      />
    </div>
  )
}
