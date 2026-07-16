import type { GoalSectionId } from "@/config/goalSections"
import type { HabitUnitId } from "@/config/habitUnits"

export type ID = string

export type ISODateString = string

export type Goal = {
  id: ID
  title: string
  description: string
  targetDate: ISODateString | null
  sections: Partial<Record<GoalSectionId, string[]>>
  routes: Route[]
  createdAt: ISODateString
  updatedAt: ISODateString
}

export type Route = {
  id: ID
  name: string
  habits: Habit[]
  tasks: Task[]
  experiments: Experiment[]
  maintenance: MaintenanceItem[]
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * A reference link. `label` is a short alias shown instead of the raw URL;
 * when it's blank (a link migrated from before aliases existed, or one you
 * haven't named), consumers fall back to showing the URL itself.
 */
export type HabitLink = {
  label: string
  url: string
}

/**
 * What was actually done on a specific date — frozen at check-off time.
 *
 * A record exists if and only if the habit was completed that date; existence
 * IS completion, so there is no separate flag that could disagree with it.
 *
 * Every measurement is nullable: all-null means "no detail recorded" (a
 * completion migrated from before we tracked detail, or a habit that had no
 * target when it was performed). We never invent values we didn't observe.
 */
export type HabitPerformance = {
  date: ISODateString
  quantity: number | null
  unitId: HabitUnitId | null
  restQuantity: number | null
  restUnitId: HabitUnitId | null
  totalQuantity: number | null
  totalUnitId: HabitUnitId | null
  /**
   * How much this completion's progressive overload added to the habit's
   * Duration, or null if not applied.
   *
   * We store the *amount* rather than a boolean so that deactivating always
   * subtracts exactly what was added — even if the Increment setting has since
   * changed. A flag would force us to subtract the current setting, silently
   * corrupting the Duration.
   */
  appliedIncrement: number | null
}

export type Habit = {
  id: ID
  name: string
  calendarAlias?: string
  daysOfWeek: DayOfWeek[]
  timeOfDay: string | null
  quantity: number | null
  baseQuantity: number | null
  incrementQuantity: number | null
  unitId: HabitUnitId
  restQuantity: number | null
  restUnitId: HabitUnitId | null
  totalQuantity: number | null
  totalUnitId: HabitUnitId | null
  actions: string
  context: string
  links: HabitLink[]
  performances: HabitPerformance[]
}

export type Task = {
  id: ID
  text: string
  completed: boolean
  dueDate: ISODateString | null
}

export type ExperimentStatus = "planned" | "running" | "completed"

export type Experiment = {
  id: ID
  name: string
  hypothesis: string
  result: string
  status: ExperimentStatus
  startDate: ISODateString | null
  endDate: ISODateString | null
}

export type MaintenanceFrequency = "weekly" | "monthly"

export type MaintenanceItem = {
  id: ID
  text: string
  frequency: MaintenanceFrequency
}

export type AppData = {
  goals: Goal[]
}
