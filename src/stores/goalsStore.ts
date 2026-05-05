import { create } from "zustand"
import { nanoid } from "nanoid"
import type {
  ActionItem,
  AppData,
  Experiment,
  Goal,
  Habit,
  MaintenanceItem,
  Route,
} from "@/types"
import { repository } from "@/lib/repository"

type GoalDraft = {
  title: string
  description?: string
  targetDate?: string | null
}

type HabitDraft = Omit<Habit, "id">
type ActionItemDraft = Omit<ActionItem, "id" | "completed"> & {
  completed?: boolean
}
type ExperimentDraft = Omit<Experiment, "id">
type MaintenanceDraft = Omit<MaintenanceItem, "id">

type GoalsState = {
  goals: Goal[]
  hydrated: boolean
  hydrate: () => void

  createGoal: (draft: GoalDraft) => Goal
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addRoute: (goalId: string, name: string) => Route | undefined
  updateRoute: (
    goalId: string,
    routeId: string,
    patch: Partial<Route>
  ) => void
  deleteRoute: (goalId: string, routeId: string) => void

  addHabit: (
    goalId: string,
    routeId: string,
    draft: HabitDraft
  ) => Habit | undefined
  updateHabit: (
    goalId: string,
    routeId: string,
    habitId: string,
    patch: Partial<Habit>
  ) => void
  deleteHabit: (goalId: string, routeId: string, habitId: string) => void

  addActionItem: (
    goalId: string,
    routeId: string,
    draft: ActionItemDraft
  ) => ActionItem | undefined
  updateActionItem: (
    goalId: string,
    routeId: string,
    itemId: string,
    patch: Partial<ActionItem>
  ) => void
  deleteActionItem: (
    goalId: string,
    routeId: string,
    itemId: string
  ) => void

  addExperiment: (
    goalId: string,
    routeId: string,
    draft: ExperimentDraft
  ) => Experiment | undefined
  updateExperiment: (
    goalId: string,
    routeId: string,
    experimentId: string,
    patch: Partial<Experiment>
  ) => void
  deleteExperiment: (
    goalId: string,
    routeId: string,
    experimentId: string
  ) => void

  addMaintenance: (
    goalId: string,
    routeId: string,
    draft: MaintenanceDraft
  ) => MaintenanceItem | undefined
  updateMaintenance: (
    goalId: string,
    routeId: string,
    itemId: string,
    patch: Partial<MaintenanceItem>
  ) => void
  deleteMaintenance: (
    goalId: string,
    routeId: string,
    itemId: string
  ) => void

  replaceAll: (data: AppData) => void
}

function persist(state: { goals: Goal[] }) {
  repository.save({ goals: state.goals })
}

function nowISO() {
  return new Date().toISOString()
}

function patchRoute(
  goals: Goal[],
  goalId: string,
  routeId: string,
  fn: (route: Route) => Route
): Goal[] {
  return goals.map((g) =>
    g.id === goalId
      ? {
          ...g,
          routes: g.routes.map((r) => (r.id === routeId ? fn(r) : r)),
          updatedAt: nowISO(),
        }
      : g
  )
}

export const useGoalsStore = create<GoalsState>((set, get) => {
  function applyRoutePatch(
    goalId: string,
    routeId: string,
    fn: (route: Route) => Route
  ) {
    const next = patchRoute(get().goals, goalId, routeId, fn)
    set({ goals: next })
    persist({ goals: next })
  }

  return {
    goals: [],
    hydrated: false,

    hydrate: () => {
      if (get().hydrated) return
      const data = repository.load()
      set({ goals: data.goals, hydrated: true })
    },

    createGoal: (draft) => {
      const goal: Goal = {
        id: nanoid(),
        title: draft.title,
        description: draft.description ?? "",
        targetDate: draft.targetDate ?? null,
        sections: {},
        routes: [],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }
      const next = [...get().goals, goal]
      set({ goals: next })
      persist({ goals: next })
      return goal
    },

    updateGoal: (id, patch) => {
      const next = get().goals.map((g) =>
        g.id === id ? { ...g, ...patch, updatedAt: nowISO() } : g
      )
      set({ goals: next })
      persist({ goals: next })
    },

    deleteGoal: (id) => {
      const next = get().goals.filter((g) => g.id !== id)
      set({ goals: next })
      persist({ goals: next })
    },

    addRoute: (goalId, name) => {
      const goals = get().goals
      const goal = goals.find((g) => g.id === goalId)
      if (!goal) return
      const route: Route = {
        id: nanoid(),
        name: name.trim() || "Untitled route",
        habits: [],
        actionItems: [],
        experiments: [],
        maintenance: [],
      }
      const next = goals.map((g) =>
        g.id === goalId
          ? { ...g, routes: [...g.routes, route], updatedAt: nowISO() }
          : g
      )
      set({ goals: next })
      persist({ goals: next })
      return route
    },

    updateRoute: (goalId, routeId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({ ...r, ...patch }))
    },

    deleteRoute: (goalId, routeId) => {
      const next = get().goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              routes: g.routes.filter((r) => r.id !== routeId),
              updatedAt: nowISO(),
            }
          : g
      )
      set({ goals: next })
      persist({ goals: next })
    },

    addHabit: (goalId, routeId, draft) => {
      const habit: Habit = { id: nanoid(), ...draft }
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: [...r.habits, habit],
      }))
      return habit
    },

    updateHabit: (goalId, routeId, habitId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: r.habits.map((h) =>
          h.id === habitId ? { ...h, ...patch } : h
        ),
      }))
    },

    deleteHabit: (goalId, routeId, habitId) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: r.habits.filter((h) => h.id !== habitId),
      }))
    },

    addActionItem: (goalId, routeId, draft) => {
      const item: ActionItem = {
        id: nanoid(),
        completed: false,
        ...draft,
      }
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        actionItems: [...r.actionItems, item],
      }))
      return item
    },

    updateActionItem: (goalId, routeId, itemId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        actionItems: r.actionItems.map((i) =>
          i.id === itemId ? { ...i, ...patch } : i
        ),
      }))
    },

    deleteActionItem: (goalId, routeId, itemId) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        actionItems: r.actionItems.filter((i) => i.id !== itemId),
      }))
    },

    addExperiment: (goalId, routeId, draft) => {
      const experiment: Experiment = { id: nanoid(), ...draft }
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        experiments: [...r.experiments, experiment],
      }))
      return experiment
    },

    updateExperiment: (goalId, routeId, experimentId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        experiments: r.experiments.map((e) =>
          e.id === experimentId ? { ...e, ...patch } : e
        ),
      }))
    },

    deleteExperiment: (goalId, routeId, experimentId) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        experiments: r.experiments.filter((e) => e.id !== experimentId),
      }))
    },

    addMaintenance: (goalId, routeId, draft) => {
      const item: MaintenanceItem = { id: nanoid(), ...draft }
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        maintenance: [...r.maintenance, item],
      }))
      return item
    },

    updateMaintenance: (goalId, routeId, itemId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        maintenance: r.maintenance.map((m) =>
          m.id === itemId ? { ...m, ...patch } : m
        ),
      }))
    },

    deleteMaintenance: (goalId, routeId, itemId) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        maintenance: r.maintenance.filter((m) => m.id !== itemId),
      }))
    },

    replaceAll: (data) => {
      set({ goals: data.goals })
      persist({ goals: data.goals })
    },
  }
})

export function useGoal(id: string | undefined): Goal | undefined {
  return useGoalsStore((state) =>
    id ? state.goals.find((g) => g.id === id) : undefined
  )
}
