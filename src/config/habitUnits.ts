export type HabitUnitId = "minutes" | "reps"

export type HabitUnit = {
  id: HabitUnitId
  shortLabel: string
  longLabel: string
}

export const HABIT_UNITS: readonly HabitUnit[] = [
  { id: "minutes", shortLabel: "min", longLabel: "Minutes" },
  { id: "reps", shortLabel: "reps", longLabel: "Reps" },
] as const

export const DEFAULT_HABIT_UNIT_ID: HabitUnitId = "minutes"

export function getHabitUnit(id: string): HabitUnit {
  return HABIT_UNITS.find((u) => u.id === id) ?? HABIT_UNITS[0]
}
