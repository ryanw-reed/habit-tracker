import type { AppData } from "@/types"

export const CURRENT_SCHEMA_VERSION = 2

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
