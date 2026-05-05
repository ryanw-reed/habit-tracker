export const GOAL_SECTIONS = [
  { id: "symptoms", label: "Symptoms" },
  { id: "educationalSources", label: "Educational Sources" },
] as const

export type GoalSectionId = (typeof GOAL_SECTIONS)[number]["id"]
