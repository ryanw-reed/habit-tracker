import { useMemo, useState } from "react"
import { addMonths, format, subMonths } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useGoalsStore } from "@/stores/goalsStore"
import { buildCalendarModel, itemsForDate } from "@/lib/calendar/events"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MonthGrid } from "@/components/calendar/MonthGrid"
import { DayHabitsOverlay } from "@/components/calendar/DayHabitsOverlay"

export function CalendarPage() {
  const goals = useGoalsStore((s) => s.goals)
  const [month, setMonth] = useState(() => new Date())
  const [filter, setFilter] = useState<string>("all")

  const model = useMemo(
    () => buildCalendarModel(goals, filter),
    [goals, filter]
  )

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const selectedHabits = useMemo(
    () => (selectedDate ? itemsForDate(model, selectedDate).habits : []),
    [model, selectedDate]
  )

  return (
    <div className="px-8 py-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Habits, tasks, and experiments across all goals.
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All goals</SelectItem>
            {goals.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.title || "Untitled goal"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMonth(new Date())}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
        <span className="ml-2 text-lg font-medium">
          {format(month, "MMMM yyyy")}
        </span>
      </div>

      <MonthGrid month={month} model={model} onSelectDay={setSelectedDate} />

      <DayHabitsOverlay
        date={selectedDate}
        habits={selectedHabits}
        onOpenChange={(open) => {
          if (!open) setSelectedDate(null)
        }}
      />
    </div>
  )
}
