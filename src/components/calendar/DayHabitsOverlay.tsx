import { useState } from "react"
import { format } from "date-fns"
import { CheckIcon } from "lucide-react"
import type { DayHabit } from "@/lib/calendar/events"
import { formatDateKey } from "@/lib/calendar/events"
import { useGoalsStore } from "@/stores/goalsStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { HabitDetailPanel } from "./HabitDetailPanel"

type Props = {
  date: Date | null
  habits: DayHabit[]
  onOpenChange: (open: boolean) => void
}

export function DayHabitsOverlay({ date, habits, onOpenChange }: Props) {
  const toggleHabitCompletion = useGoalsStore((s) => s.toggleHabitCompletion)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  const dateKey = date ? formatDateKey(date) : ""
  const done = habits.filter((h) => h.completed).length

  // Derive the effective selection (falls back to the first habit) without
  // a state-syncing effect, so a stale id from a previous day is ignored.
  const effectiveId =
    selectedHabitId && habits.some((h) => h.habitId === selectedHabitId)
      ? selectedHabitId
      : habits[0]?.habitId ?? null
  const selected = habits.find((h) => h.habitId === effectiveId) ?? null

  return (
    <Dialog open={date !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogDescription className="sr-only">
          Habit checklist and details for the selected day.
        </DialogDescription>

        {/* Left: checklist */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border">
          <DialogHeader className="space-y-1 border-b border-border p-4 text-left">
            <DialogTitle>
              {date ? format(date, "EEEE, MMMM d") : ""}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {habits.length > 0
                ? `${done}/${habits.length} habits done`
                : "No habits scheduled"}
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 overflow-y-auto p-3">
            {habits.map((h) => {
              const isSelected = h.habitId === effectiveId
              return (
                <div
                  key={h.habitId}
                  className={cn(
                    "flex items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                    isSelected
                      ? "border-foreground/30 bg-muted/60"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleHabitCompletion(
                        h.goalId,
                        h.routeId,
                        h.habitId,
                        dateKey
                      )
                    }
                    aria-label={h.completed ? "Mark not done" : "Mark done"}
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                      h.completed
                        ? "border-accent-done bg-accent-done text-accent-done-foreground"
                        : "border-muted-foreground/40 hover:border-muted-foreground"
                    )}
                  >
                    {h.completed && <CheckIcon className="size-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHabitId(h.habitId)}
                    className={cn(
                      "flex-1 truncate text-left",
                      h.completed && "text-accent-done"
                    )}
                  >
                    {h.displayName}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: polished detail */}
        <div className="flex-1 overflow-y-auto p-6 pt-10">
          {selected ? (
            <HabitDetailPanel
              goalId={selected.goalId}
              routeId={selected.routeId}
              habitId={selected.habitId}
              dateKey={dateKey}
              performance={selected.performance}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              No habits scheduled for this day.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
