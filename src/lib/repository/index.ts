import { LocalStorageRepository } from "./localStorage"
import type { Repository } from "./types"

export const repository: Repository = new LocalStorageRepository()

export type { Repository } from "./types"
