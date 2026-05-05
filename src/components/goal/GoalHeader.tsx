import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeftIcon, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
import type { Goal } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { describeCountdown, daysUntil, formatTargetDate } from "@/lib/dates"
import { cn } from "@/lib/utils"

type Props = { goal: Goal }

export function GoalHeader({ goal }: Props) {
  const navigate = useNavigate()
  const updateGoal = useGoalsStore((s) => s.updateGoal)
  const deleteGoal = useGoalsStore((s) => s.deleteGoal)

  const [title, setTitle] = useState(goal.title)
  const [description, setDescription] = useState(goal.description)
  const [targetDate, setTargetDate] = useState(goal.targetDate ?? "")

  useEffect(() => {
    setTitle(goal.title)
    setDescription(goal.description)
    setTargetDate(goal.targetDate ?? "")
  }, [goal.id, goal.title, goal.description, goal.targetDate])

  const days = daysUntil(goal.targetDate)
  const countdown = describeCountdown(days)
  const isOverdue = days !== null && days < 0

  function commitTitle() {
    const trimmed = title.trim()
    if (trimmed === goal.title) return
    updateGoal(goal.id, { title: trimmed || "Untitled goal" })
    if (!trimmed) setTitle("Untitled goal")
  }

  function commitDescription() {
    if (description === goal.description) return
    updateGoal(goal.id, { description })
  }

  function commitTargetDate() {
    const next = targetDate || null
    if (next === (goal.targetDate ?? null)) return
    updateGoal(goal.id, { targetDate: next })
  }

  return (
    <header className="bg-background">
      <div className="mx-auto max-w-5xl px-8">
        <div className="border-b border-border pb-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="-ml-2 text-muted-foreground"
          >
            <ChevronLeftIcon className="size-4" />
            All goals
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Goal actions">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => {
                  if (
                    confirm(
                      `Delete "${goal.title || "this goal"}"? This cannot be undone.`
                    )
                  ) {
                    deleteGoal(goal.id)
                    toast.success("Goal deleted")
                    navigate("/")
                  }
                }}
              >
                Delete goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          placeholder="Untitled goal"
          aria-label="Goal title"
          className="!h-auto !border-0 !bg-transparent !p-0 !text-3xl !font-semibold !tracking-tight !shadow-none focus-visible:!ring-0"
        />

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={commitDescription}
          placeholder="Describe what success looks like and why this matters."
          rows={2}
          aria-label="Goal description"
          className="mt-3 resize-none !border-0 !bg-transparent !px-0 !py-1 !text-base !text-muted-foreground !shadow-none focus-visible:!ring-0"
        />

        <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="goal-target-date"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Target date
            </Label>
            <Input
              id="goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              onBlur={commitTargetDate}
              className="h-8 w-[160px]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Countdown
            </span>
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-md px-2.5 text-sm",
                goal.targetDate
                  ? isOverdue
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent-action/10 text-accent-action"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {countdown}
              {goal.targetDate && (
                <span className="ml-2 text-xs text-muted-foreground">
                  · {formatTargetDate(goal.targetDate)}
                </span>
              )}
            </span>
          </div>
        </div>
        </div>
      </div>
    </header>
  )
}
