import type { AppData } from "@/types"
import type { Repository } from "./types"
import {
  CURRENT_SCHEMA_VERSION,
  emptyAppData,
  runMigrations,
  wrap,
  type StoredEnvelope,
} from "./migrations"

const STORAGE_KEY = "habit-achieving-project:v1"

function readEnvelope(): StoredEnvelope | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.schemaVersion === "number"
    ) {
      return parsed as StoredEnvelope
    }
    return null
  } catch {
    return null
  }
}

function writeEnvelope(envelope: StoredEnvelope): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
}

export class LocalStorageRepository implements Repository {
  load(): AppData {
    const envelope = readEnvelope()
    if (!envelope) {
      const fresh = emptyAppData()
      writeEnvelope(wrap(fresh))
      return fresh
    }
    const migrated = runMigrations(envelope)
    if (envelope.schemaVersion < CURRENT_SCHEMA_VERSION) {
      writeEnvelope(wrap(migrated))
    }
    return migrated
  }

  save(data: AppData): void {
    writeEnvelope(wrap(data))
  }

  exportJSON(): string {
    const envelope = readEnvelope() ?? wrap(emptyAppData())
    return JSON.stringify(envelope, null, 2)
  }

  importJSON(json: string): AppData {
    const parsed = JSON.parse(json) as StoredEnvelope
    if (typeof parsed.schemaVersion !== "number") {
      throw new Error("Invalid import: missing schemaVersion")
    }
    const migrated = runMigrations(parsed)
    writeEnvelope(wrap(migrated))
    return migrated
  }
}
