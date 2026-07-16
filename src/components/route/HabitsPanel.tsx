import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  PlusIcon,
  TimerIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"
import type { Habit } from "@/types"
import { formatDays, formatTime } from "@/lib/dates"
import { formatHabitTarget } from "@/lib/habits"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PanelShell, PanelEmptyState } from "./PanelShell"
import { HabitDialog } from "./HabitDialog"

type Props = {
  goalId: string
  routeId: string
  habits: Habit[]
}

export function HabitsPanel({ goalId, routeId, habits }: Props) {
  return (
    <PanelShell
      title="Habits"
      hint="Repeated actions."
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
          {habits.map((habit, index) => (
            <HabitRow
              key={habit.id}
              goalId={goalId}
              routeId={routeId}
              habit={habit}
              index={index}
              total={habits.length}
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
  index,
  total,
}: {
  goalId: string
  routeId: string
  habit: Habit
  index: number
  total: number
}) {
  const deleteHabit = useGoalsStore((s) => s.deleteHabit)
  const moveHabit = useGoalsStore((s) => s.moveHabit)
  const time = formatTime(habit.timeOfDay)
  const target = formatHabitTarget(habit)

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
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{habit.name}</div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {habit.daysOfWeek.length > 0 && (
              <span className="font-medium text-foreground">
                {formatDays(habit.daysOfWeek)}
              </span>
            )}
            {time && (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="size-3.5" />
                {time}
              </span>
            )}
            {target && (
              <span className="inline-flex items-center gap-1">
                <TimerIcon className="size-3.5" />
                {target}
              </span>
            )}
          </div>
          {(habit.actions || habit.context) && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {habit.actions || habit.context}
            </p>
          )}
        </div>
        <div className="relative z-20 flex shrink-0 flex-col opacity-0 transition-opacity group-hover/habit:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation()
              moveHabit(goalId, routeId, habit.id, -1)
            }}
            aria-label="Move habit up"
            className="flex size-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronUpIcon className="size-3" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation()
              moveHabit(goalId, routeId, habit.id, 1)
            }}
            aria-label="Move habit down"
            className="flex size-4 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronDownIcon className="size-3" />
          </button>
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
