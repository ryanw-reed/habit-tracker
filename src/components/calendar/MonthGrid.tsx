import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import type { CalendarModel } from "@/lib/calendar/events"
import { itemsForDate } from "@/lib/calendar/events"
import { CalendarDayCell } from "./CalendarDayCell"

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

type Props = {
  month: Date
  model: CalendarModel
  onSelectDay: (date: Date) => void
}

export function MonthGrid({ month, model, onSelectDay }: Props) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today = new Date()

  return (
    <div className="overflow-hidden rounded-lg border-l border-t border-border">
      <div className="grid grid-cols-7">
        {WEEKDAY_HEADERS.map((label) => (
          <div
            key={label}
            className="border-b border-r border-border bg-muted/40 px-2 py-1.5 text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const items = itemsForDate(model, day)
          return (
            <CalendarDayCell
              key={day.toISOString()}
              date={day}
              inCurrentMonth={isSameMonth(day, month)}
              isToday={isSameDay(day, today)}
              habits={items.habits}
              onSelect={onSelectDay}
            />
          )
        })}
      </div>
    </div>
  )
}
