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

export type Habit = {
  id: ID
  name: string
  daysOfWeek: DayOfWeek[]
  timeOfDay: string | null
  quantity: number | null
  baseQuantity: number | null
  incrementQuantity: number | null
  unitId: HabitUnitId
  actions: string
  context: string
  links: string[]
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
