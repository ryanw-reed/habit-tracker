import { format } from "date-fns"
import type { DayOfWeek, ExperimentStatus, Goal } from "@/types"

/** "all" shows every goal; any other value is a goalId to restrict to. */
export type CalendarFilter = string

export type CalendarHabit = {
  habitId: string
  goalId: string
  routeId: string
  displayName: string
  timeOfDay: string | null
  completedDates: string[]
}

/** A habit resolved for a specific date, with completion determined. */
export type DayHabit = CalendarHabit & { completed: boolean }

export type CalendarTask = {
  taskId: string
  goalId: string
  routeId: string
  text: string
  completed: boolean
}

export type CalendarExperiment = {
  experimentId: string
  goalId: string
  routeId: string
  name: string
  startDate: string | null
  endDate: string | null
  status: ExperimentStatus
}

export type CalendarModel = {
  habitsByWeekday: Record<DayOfWeek, CalendarHabit[]>
  tasksByDate: Map<string, CalendarTask[]>
  experiments: CalendarExperiment[]
}

/** Normalizes any stored date string (date-only or full ISO) to a yyyy-MM-dd key. */
function toDateKey(value: string): string {
  return value.slice(0, 10)
}

export function formatDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function emptyByWeekday(): Record<DayOfWeek, CalendarHabit[]> {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
}

export function buildCalendarModel(
  goals: Goal[],
  filter: CalendarFilter
): CalendarModel {
  const habitsByWeekday = emptyByWeekday()
  const tasksByDate = new Map<string, CalendarTask[]>()
  const experiments: CalendarExperiment[] = []

  const scoped = filter === "all" ? goals : goals.filter((g) => g.id === filter)

  for (const goal of scoped) {
    for (const route of goal.routes) {
      for (const habit of route.habits) {
        const displayName = habit.calendarAlias?.trim() || habit.name
        const entry: CalendarHabit = {
          habitId: habit.id,
          goalId: goal.id,
          routeId: route.id,
          displayName,
          timeOfDay: habit.timeOfDay,
          completedDates: habit.completedDates,
        }
        for (const day of habit.daysOfWeek) {
          habitsByWeekday[day].push(entry)
        }
      }

      for (const task of route.tasks) {
        if (!task.dueDate) continue
        const key = toDateKey(task.dueDate)
        const list = tasksByDate.get(key) ?? []
        list.push({
          taskId: task.id,
          goalId: goal.id,
          routeId: route.id,
          text: task.text,
          completed: task.completed,
        })
        tasksByDate.set(key, list)
      }

      for (const experiment of route.experiments) {
        if (!experiment.startDate && !experiment.endDate) continue
        experiments.push({
          experimentId: experiment.id,
          goalId: goal.id,
          routeId: route.id,
          name: experiment.name,
          startDate: experiment.startDate
            ? toDateKey(experiment.startDate)
            : null,
          endDate: experiment.endDate ? toDateKey(experiment.endDate) : null,
          status: experiment.status,
        })
      }
    }
  }

  return { habitsByWeekday, tasksByDate, experiments }
}

export function itemsForDate(
  model: CalendarModel,
  date: Date
): {
  habits: DayHabit[]
  tasks: CalendarTask[]
  experiments: CalendarExperiment[]
} {
  const weekday = date.getDay() as DayOfWeek
  const key = formatDateKey(date)

  const habits: DayHabit[] = model.habitsByWeekday[weekday].map((h) => ({
    ...h,
    completed: h.completedDates.includes(key),
  }))

  const experiments = model.experiments.filter((e) => {
    const start = e.startDate ?? e.endDate
    const end = e.endDate ?? e.startDate
    if (!start || !end) return false
    return start <= key && key <= end
  })

  return {
    habits,
    tasks: model.tasksByDate.get(key) ?? [],
    experiments,
  }
}
