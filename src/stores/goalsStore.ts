import { create } from "zustand"
import { nanoid } from "nanoid"
import type {
  AppData,
  Experiment,
  Goal,
  Habit,
  HabitPerformance,
  MaintenanceItem,
  Route,
  Task,
} from "@/types"
import { repository } from "@/lib/repository"

type GoalDraft = {
  title: string
  description?: string
  targetDate?: string | null
}

type HabitDraft = Omit<Habit, "id" | "performances">
type TaskDraft = Omit<Task, "id" | "completed"> & {
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
  moveHabit: (
    goalId: string,
    routeId: string,
    habitId: string,
    direction: -1 | 1
  ) => void
  toggleHabitCompletion: (
    goalId: string,
    routeId: string,
    habitId: string,
    dateKey: string
  ) => void
  /** Edit what was actually done on a date. Never touches the template. */
  updateHabitPerformance: (
    goalId: string,
    routeId: string,
    habitId: string,
    dateKey: string,
    patch: Partial<Omit<HabitPerformance, "date">>
  ) => void
  /** Activate/deactivate the progressive-overload offer for a completed date. */
  toggleIncrement: (
    goalId: string,
    routeId: string,
    habitId: string,
    dateKey: string
  ) => void

  addTask: (
    goalId: string,
    routeId: string,
    draft: TaskDraft
  ) => Task | undefined
  updateTask: (
    goalId: string,
    routeId: string,
    taskId: string,
    patch: Partial<Task>
  ) => void
  deleteTask: (
    goalId: string,
    routeId: string,
    taskId: string
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
        tasks: [],
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
      const habit: Habit = { id: nanoid(), performances: [], ...draft }
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

    moveHabit: (goalId, routeId, habitId, direction) => {
      applyRoutePatch(goalId, routeId, (r) => {
        const idx = r.habits.findIndex((h) => h.id === habitId)
        if (idx === -1) return r
        const target = idx + direction
        if (target < 0 || target >= r.habits.length) return r
        const next = [...r.habits]
        ;[next[idx], next[target]] = [next[target], next[idx]]
        return { ...r, habits: next }
      })
    },

    toggleHabitCompletion: (goalId, routeId, habitId, dateKey) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: r.habits.map((h) => {
          if (h.id !== habitId) return h
          const existingRecord = h.performances.find((p) => p.date === dateKey)
          if (existingRecord) {
            // Unchecking deletes the record — existence is completion.
            return {
              ...h,
              performances: h.performances.filter((p) => p.date !== dateKey),
            }
          }
          // Freeze what the habit is right now. This copy is what makes
          // history immutable: later template edits cannot reach into it.
          const snapshot: HabitPerformance = {
            date: dateKey,
            quantity: h.quantity,
            unitId: h.unitId,
            restQuantity: h.restQuantity,
            restUnitId: h.restUnitId,
            totalQuantity: h.totalQuantity,
            totalUnitId: h.totalUnitId,
            appliedIncrement: null,
          }
          return { ...h, performances: [...h.performances, snapshot] }
        }),
      }))
    },

    updateHabitPerformance: (goalId, routeId, habitId, dateKey, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: r.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                performances: h.performances.map((p) =>
                  p.date === dateKey ? { ...p, ...patch } : p
                ),
              }
            : h
        ),
      }))
    },

    toggleIncrement: (goalId, routeId, habitId, dateKey) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        habits: r.habits.map((h) => {
          if (h.id !== habitId) return h
          const performance = h.performances.find((p) => p.date === dateKey)
          if (!performance) return h

          const setApplied = (amount: number | null) =>
            h.performances.map((p) =>
              p.date === dateKey ? { ...p, appliedIncrement: amount } : p
            )

          // Deactivate: subtract exactly what was added, not whatever the
          // Increment setting happens to be now.
          if (performance.appliedIncrement !== null) {
            return {
              ...h,
              quantity:
                h.quantity === null
                  ? null
                  : Math.max(0, h.quantity - performance.appliedIncrement),
              performances: setApplied(null),
            }
          }

          // Activate: nothing to offer without an increment and a duration.
          if (h.incrementQuantity === null || h.incrementQuantity <= 0) return h
          if (h.quantity === null) return h
          return {
            ...h,
            // Advances the template only — frozen records are untouched.
            quantity: h.quantity + h.incrementQuantity,
            performances: setApplied(h.incrementQuantity),
          }
        }),
      }))
    },

    addTask: (goalId, routeId, draft) => {
      const task: Task = {
        id: nanoid(),
        completed: false,
        ...draft,
      }
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        tasks: [...r.tasks, task],
      }))
      return task
    },

    updateTask: (goalId, routeId, taskId, patch) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        tasks: r.tasks.map((t) =>
          t.id === taskId ? { ...t, ...patch } : t
        ),
      }))
    },

    deleteTask: (goalId, routeId, taskId) => {
      applyRoutePatch(goalId, routeId, (r) => ({
        ...r,
        tasks: r.tasks.filter((t) => t.id !== taskId),
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
