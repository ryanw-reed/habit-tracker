import { differenceInCalendarDays, parseISO, format } from "date-fns"

export function daysUntil(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null
  return differenceInCalendarDays(parseISO(isoDate), new Date())
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
