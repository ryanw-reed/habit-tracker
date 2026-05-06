import { Link } from "react-router-dom"
import { MoreHorizontalIcon, RouteIcon } from "lucide-react"
import { useGoalsStore } from "@/stores/goalsStore"
import type { Goal } from "@/types"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { daysUntil, describeCountdown, formatTargetDate } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Props = { goal: Goal }

function progress(goal: Goal): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const route of goal.routes) {
    for (const task of route.tasks) {
      total += 1
      if (task.completed) done += 1
    }
  }
  return { done, total }
}

export function GoalCard({ goal }: Props) {
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)
  const days = daysUntil(goal.targetDate)
  const countdown = describeCountdown(days)
  const isOverdue = days !== null && days < 0
  const { done, total } = progress(goal)
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link
        to={`/goals/${goal.id}`}
        className="absolute inset-0 z-10"
        aria-label={`Open goal ${goal.title}`}
      />
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">
            {goal.title || "Untitled goal"}
          </CardTitle>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {goal.description || "No description yet."}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative z-20 size-8 shrink-0 opacity-60 transition-opacity hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontalIcon className="size-4" />
              <span className="sr-only">Goal actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-30">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (confirm(`Delete "${goal.title || "this goal"}"?`)) {
                  deleteGoal(goal.id)
                  toast.success("Goal deleted")
                }
              }}
            >
              Delete goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              goal.targetDate
                ? isOverdue
                  ? "bg-destructive/10 text-destructive"
                  : "bg-accent-action/10 text-accent-action"
                : "bg-muted text-muted-foreground"
            )}
          >
            {countdown}
          </span>
          {goal.targetDate && (
            <span className="text-xs text-muted-foreground">
              {formatTargetDate(goal.targetDate)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <RouteIcon className="size-3.5" />
            {goal.routes.length === 1
              ? "1 route"
              : `${goal.routes.length} routes`}
          </span>
          <span>
            {total > 0 ? `${done}/${total} tasks` : "No tasks"}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-accent-action transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
