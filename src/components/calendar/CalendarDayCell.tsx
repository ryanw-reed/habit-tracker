import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { DayHabit } from "@/lib/calendar/events"

type Props = {
  date: Date
  inCurrentMonth: boolean
  isToday: boolean
  habits: DayHabit[]
  onSelect: (date: Date) => void
}

export function CalendarDayCell({
  date,
  inCurrentMonth,
  isToday,
  habits,
  onSelect,
}: Props) {
  const total = habits.length
  const done = habits.filter((h) => h.completed).length
  const allDone = total > 0 && done === total

  return (
    <div
      className={cn(
        "flex min-h-24 flex-col gap-1 border-b border-r border-border p-1.5",
        !inCurrentMonth && "bg-muted/30"
      )}
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full text-xs",
          isToday && "bg-accent-action font-medium text-accent-action-foreground",
          !isToday && !inCurrentMonth && "text-muted-foreground",
          !isToday && inCurrentMonth && "text-foreground"
        )}
      >
        {format(date, "d")}
      </span>

      {total > 0 && (
        <button
          type="button"
          onClick={() => onSelect(date)}
          className={cn(
            "mt-auto w-full truncate rounded-md px-1.5 py-1 text-left text-[11px] font-medium transition-colors",
            allDone
              ? "bg-accent-done/15 text-accent-done hover:bg-accent-done/25"
              : "bg-muted text-foreground hover:bg-muted/70"
          )}
        >
          Habits completed · {done}/{total}
        </button>
      )}
    </div>
  )
}
