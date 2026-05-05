import { ClockIcon, PlusIcon, TimerIcon, Trash2Icon } from "lucide-react"
import { format, parse } from "date-fns"
import { toast } from "sonner"
import type { DayOfWeek, Habit } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { PanelShell, PanelEmptyState } from "./PanelShell"
import { HabitDialog } from "./HabitDialog"

type Props = {
  goalId: string
  routeId: string
  habits: Habit[]
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 1, label: "M" },
  { value: 2, label: "T" },
  { value: 3, label: "W" },
  { value: 4, label: "T" },
  { value: 5, label: "F" },
  { value: 6, label: "S" },
  { value: 0, label: "S" },
]

function formatTime(time: string | null): string | null {
  if (!time) return null
  try {
    return format(parse(time, "HH:mm", new Date()), "h:mm a")
  } catch {
    return time
  }
}

export function HabitsPanel({ goalId, routeId, habits }: Props) {
  return (
    <PanelShell
      title="Habits"
      hint="Recurring practices that build the goal."
      count={habits.length}
      action={
        habits.length > 0 && (
          <HabitDialog
            goalId={goalId}
            routeId={routeId}
            trigger={
              <Button variant="ghost" size="sm">
                <PlusIcon className="size-4" />
                Add
              </Button>
            }
          />
        )
      }
    >
      {habits.length === 0 ? (
        <PanelEmptyState
          message="No habits yet."
          action={
            <HabitDialog
              goalId={goalId}
              routeId={routeId}
              trigger={
                <Button variant="outline" size="sm">
                  <PlusIcon className="size-4" />
                  Add habit
                </Button>
              }
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              goalId={goalId}
              routeId={routeId}
              habit={habit}
            />
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function HabitRow({
  goalId,
  routeId,
  habit,
}: {
  goalId: string
  routeId: string
  habit: Habit
}) {
  const deleteHabit = useGoalsStore((s) => s.deleteHabit)
  const time = formatTime(habit.timeOfDay)

  return (
    <li className="group/habit relative rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
      <HabitDialog
        goalId={goalId}
        routeId={routeId}
        existing={habit}
        trigger={
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer rounded-lg"
            aria-label={`Edit habit ${habit.name}`}
          />
        }
      />
      <div className="relative z-0 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{habit.name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {DAYS.map((d) => {
                const active = habit.daysOfWeek.includes(d.value)
                return (
                  <span
                    key={d.value}
                    className={cn(
                      "flex size-5 items-center justify-center rounded-sm text-[10px] font-medium",
                      active
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground/60"
                    )}
                    title={d.label}
                  >
                    {d.label}
                  </span>
                )
              })}
            </div>
            {time && (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                {time}
              </span>
            )}
            {habit.durationMinutes !== null && (
              <span className="inline-flex items-center gap-1">
                <TimerIcon className="size-3.5" />
                {habit.durationMinutes} min
              </span>
            )}
          </div>
          {habit.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {habit.notes}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative z-20 shrink-0 opacity-0 transition-opacity group-hover/habit:opacity-100 focus-visible:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Habit actions"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-30">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (confirm(`Delete habit "${habit.name}"?`)) {
                  deleteHabit(goalId, routeId, habit.id)
                  toast.success("Habit deleted")
                }
              }}
            >
              Delete habit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
