import { differenceInCalendarDays, parseISO, format, parse } from "date-fns"
import type { DayOfWeek } from "@/types"

export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  return differenceInCalendarDays(parseISO(isoDate), new Date())
}

export function formatTime(time: string | null | undefined): string | null {
  if (!time) return null
  try {
    return format(parse(time, "HH:mm", new Date()), "h:mm a")
  } catch {
    return time
  }
}

export function formatTargetDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ""
  return format(parseISO(isoDate), "MMM d, yyyy")
}

export function describeCountdown(days: number | null): string {
  if (days === null) return "No target date"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days === -1) return "Yesterday"
  if (days > 0) return `${days} days away`
  return `${Math.abs(days)} days overdue`
}

const FULL_DAY_NAMES: Record<DayOfWeek, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  0: "Sunday",
}

const ORDERED_DAYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0]

export function formatDays(days: DayOfWeek[]): string {
  if (days.length === 0) return ""
  if (days.length === 7) return "Every day"
  return ORDERED_DAYS.filter((d) => days.includes(d))
    .map((d) => FULL_DAY_NAMES[d])
    .join(", ")
}
