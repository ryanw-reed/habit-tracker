import type { AppData } from "@/types"

export const CURRENT_SCHEMA_VERSION = 5

export type StoredEnvelope = {
  schemaVersion: number
  data: unknown
}

type Migration = (raw: unknown) => unknown

const migrations: Record<number, Migration> = {
  1: (raw) => raw,
  2: (rawV1: unknown) => {
    const v1 = rawV1 as { goals?: Array<Record<string, unknown>> }
    const goals = (v1.goals ?? []).map((goal) => {
      const sections = (goal.sections ?? {}) as Record<string, unknown>
      const migratedSections: Record<string, string[]> = {}
      for (const [key, value] of Object.entries(sections)) {
        if (Array.isArray(value)) {
          migratedSections[key] = value.filter(
            (v): v is string => typeof v === "string"
          )
        } else if (typeof value === "string") {
          const trimmed = value.trim()
          migratedSections[key] = trimmed ? [trimmed] : []
        } else {
          migratedSections[key] = []
        }
      }
      return { ...goal, sections: migratedSections }
    })
    return { goals }
  },
  3: (rawV2: unknown) => {
    const v2 = rawV2 as { goals?: Array<Record<string, unknown>> }
    const goals = (v2.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const { actionItems, ...rest } = route as {
          actionItems?: unknown
          [key: string]: unknown
        }
        return { ...rest, tasks: actionItems ?? [] }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  4: (rawV3: unknown) => {
    const v3 = rawV3 as { goals?: Array<Record<string, unknown>> }
    const goals = (v3.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const { notes, ...rest } = habit as {
            notes?: unknown
            [key: string]: unknown
          }
          return {
            ...rest,
            actions: typeof rest.actions === "string" ? rest.actions : "",
            context: typeof notes === "string" ? notes : "",
          }
        })
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  5: (rawV4: unknown) => {
    const v4 = rawV4 as { goals?: Array<Record<string, unknown>> }
    const goals = (v4.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const { durationMinutes, ...rest } = habit as {
            durationMinutes?: unknown
            [key: string]: unknown
          }
          const quantity =
            typeof durationMinutes === "number" ? durationMinutes : null
          return {
            ...rest,
            quantity,
            baseQuantity: quantity,
            incrementQuantity: null,
            unitId:
              typeof rest.unitId === "string" ? rest.unitId : "minutes",
          }
        })
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
}

export function emptyAppData(): AppData {
  return { goals: [] }
}

export function runMigrations(envelope: StoredEnvelope): AppData {
  let version = envelope.schemaVersion
  let data = envelope.data

  while (version < CURRENT_SCHEMA_VERSION) {
    const next = version + 1
    const migrate = migrations[next]
    if (!migrate) {
      throw new Error(`Missing migration for schema version ${next}`)
    }
    data = migrate(data)
    version = next
  }

  return data as AppData
}

export function wrap(data: AppData): StoredEnvelope {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, data }
}
