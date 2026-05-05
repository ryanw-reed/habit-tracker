import type { AppData } from "@/types"

export interface Repository {
  load(): AppData
  save(data: AppData): void
  exportJSON(): string
  importJSON(json: string): AppData
}
