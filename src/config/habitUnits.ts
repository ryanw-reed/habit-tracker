/**
 * Units are tagged with an invisible `category`. Categories never appear in the
 * UI — they only decide which options populate each field's dropdown, so rules
 * like "you can't rest in reps" fall out of the model instead of being
 * special-cased in the form.
 */
export type HabitUnitCategory = "time" | "reps" | "rounds" | "distance"

export type HabitUnitId =
  | "minutes"
  | "seconds"
  | "reps"
  | "rounds"
  | "miles"
  | "kilometers"

export type HabitUnit = {
  id: HabitUnitId
  shortLabel: string
  longLabel: string
  category: HabitUnitCategory
}

// `minutes` must stay first — getHabitUnit() falls back to HABIT_UNITS[0].
export const HABIT_UNITS: readonly HabitUnit[] = [
  { id: "minutes", shortLabel: "min", longLabel: "Minutes", category: "time" },
  { id: "seconds", shortLabel: "sec", longLabel: "Seconds", category: "time" },
  { id: "reps", shortLabel: "reps", longLabel: "Reps", category: "reps" },
  { id: "rounds", shortLabel: "rounds", longLabel: "Rounds", category: "rounds" },
  { id: "miles", shortLabel: "mi", longLabel: "Miles", category: "distance" },
  {
    id: "kilometers",
    shortLabel: "km",
    longLabel: "Kilometers",
    category: "distance",
  },
] as const

export const DEFAULT_HABIT_UNIT_ID: HabitUnitId = "minutes"
export const DEFAULT_REST_UNIT_ID: HabitUnitId = "seconds"
export const DEFAULT_TOTAL_UNIT_ID: HabitUnitId = "rounds"

/** Work duration: time or reps. */
export const DURATION_UNIT_CATEGORIES: HabitUnitCategory[] = ["time", "reps"]
/** Rest duration: time only — you can't rest in reps. */
export const REST_UNIT_CATEGORIES: HabitUnitCategory[] = ["time"]
/** Total: how much overall — rounds, distance, or clock time. */
export const TOTAL_UNIT_CATEGORIES: HabitUnitCategory[] = [
  "rounds",
  "distance",
  "time",
]

export function getHabitUnit(id: string): HabitUnit {
  return HABIT_UNITS.find((u) => u.id === id) ?? HABIT_UNITS[0]
}

export function unitsForCategories(
  categories: HabitUnitCategory[]
): HabitUnit[] {
  return HABIT_UNITS.filter((u) => categories.includes(u.category))
}
