import type { AppData } from "@/types"

export const CURRENT_SCHEMA_VERSION = 11

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
  6: (rawV5: unknown) => {
    const v5 = rawV5 as { goals?: Array<Record<string, unknown>> }
    const goals = (v5.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => ({
          ...habit,
          completedDates: Array.isArray(habit.completedDates)
            ? habit.completedDates
            : [],
        }))
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  7: (rawV6: unknown) => {
    const v6 = rawV6 as { goals?: Array<Record<string, unknown>> }
    const goals = (v6.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        // Defaults first so any already-present value wins.
        const migratedHabits = habits.map((habit) => ({
          restQuantity: null,
          restUnitId: null,
          totalQuantity: null,
          totalUnitId: null,
          ...habit,
        }))
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  8: (rawV7: unknown) => {
    const v7 = rawV7 as { goals?: Array<Record<string, unknown>> }
    const goals = (v7.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const { completedDates, ...rest } = habit as {
            completedDates?: unknown
            [key: string]: unknown
          }
          const dates = Array.isArray(completedDates)
            ? completedDates.filter((d): d is string => typeof d === "string")
            : []
          // We never recorded what values were in effect on these dates, so we
          // say so rather than fabricate them from the current template.
          return {
            ...rest,
            performances: dates.map((date) => ({
              date,
              quantity: null,
              unitId: null,
              restQuantity: null,
              restUnitId: null,
              totalQuantity: null,
              totalUnitId: null,
            })),
          }
        })
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  9: (rawV8: unknown) => {
    const v8 = rawV8 as { goals?: Array<Record<string, unknown>> }
    const goals = (v8.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const performances = Array.isArray(habit.performances)
            ? (habit.performances as Array<Record<string, unknown>>)
            : []
          return {
            ...habit,
            performances: performances.map((p) => ({
              incrementApplied: false,
              ...p,
            })),
          }
        })
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  10: (rawV9: unknown) => {
    const v9 = rawV9 as { goals?: Array<Record<string, unknown>> }
    const goals = (v9.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const performances = Array.isArray(habit.performances)
            ? (habit.performances as Array<Record<string, unknown>>)
            : []
          // incrementApplied: boolean -> appliedIncrement: number | null.
          // An already-applied record backfills to the habit's current
          // increment: that's the amount it was applied at, since v9 shipped
          // immediately before this change.
          const inc =
            typeof habit.incrementQuantity === "number"
              ? habit.incrementQuantity
              : null
          return {
            ...habit,
            performances: performances.map((p) => {
              const { incrementApplied, ...rest } = p as {
                incrementApplied?: unknown
                [key: string]: unknown
              }
              return {
                ...rest,
                appliedIncrement: incrementApplied === true ? inc : null,
              }
            }),
          }
        })
        return { ...route, habits: migratedHabits }
      })
      return { ...goal, routes: migratedRoutes }
    })
    return { goals }
  },
  11: (rawV10: unknown) => {
    const v10 = rawV10 as { goals?: Array<Record<string, unknown>> }
    const goals = (v10.goals ?? []).map((goal) => {
      const routes = (goal.routes ?? []) as Array<Record<string, unknown>>
      const migratedRoutes = routes.map((route) => {
        const habits = (route.habits ?? []) as Array<Record<string, unknown>>
        const migratedHabits = habits.map((habit) => {
          const links = Array.isArray(habit.links) ? habit.links : []
          // links: string[] -> { label, url }[]. Existing links have no alias
          // yet, so label stays blank and consumers fall back to the URL —
          // rather than fabricating a name the user never chose.
          return {
            ...habit,
            links: links.map((l) =>
              typeof l === "string"
                ? { label: "", url: l }
                : (l as Record<string, unknown>)
            ),
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
