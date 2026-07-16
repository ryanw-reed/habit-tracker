import type { ReactNode } from "react"
import { PencilIcon } from "lucide-react"
import type { HabitPerformance } from "@/types"
import {
  type HabitUnitId,
  DEFAULT_HABIT_UNIT_ID,
  DEFAULT_REST_UNIT_ID,
  DEFAULT_TOTAL_UNIT_ID,
  DURATION_UNIT_CATEGORIES,
  REST_UNIT_CATEGORIES,
  TOTAL_UNIT_CATEGORIES,
  getHabitUnit,
  unitsForCategories,
} from "@/config/habitUnits"
import { formatDays, formatTime } from "@/lib/dates"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HabitDialog } from "@/components/route/HabitDialog"
import { cn } from "@/lib/utils"

type Props = {
  goalId: string
  routeId: string
  habitId: string
  /** yyyy-MM-dd of the day being viewed. */
  dateKey: string
  /** What was actually done on that date; null if not completed. */
  performance: HabitPerformance | null
}

export function HabitDetailPanel({
  goalId,
  routeId,
  habitId,
  dateKey,
  performance,
}: Props) {
  const habit = useGoalsStore((s) => {
    const g = s.goals.find((x) => x.id === goalId)
    const r = g?.routes.find((x) => x.id === routeId)
    return r?.habits.find((x) => x.id === habitId)
  })
  const updateHabitPerformance = useGoalsStore((s) => s.updateHabitPerformance)
  const toggleIncrement = useGoalsStore((s) => s.toggleIncrement)

  if (!habit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Habit not found.
      </div>
    )
  }

  const time = formatTime(habit.timeOfDay)
  const links = habit.links.filter((l) => l.url.trim())

  // Completed days show their own frozen record and are editable; days that
  // haven't happened have no record, so they show the template's plan, locked.
  const source = performance ?? habit
  const editable = performance !== null
  const hasRest = source.restQuantity !== null

  const patch = (p: Partial<Omit<HabitPerformance, "date">>) =>
    updateHabitPerformance(goalId, routeId, habitId, dateKey, p)

  const num = (raw: string) => {
    const v = raw.trim()
    return v ? Math.max(0, Number.parseInt(v, 10) || 0) : null
  }

  // Active shows the frozen amount that's actually contributing; inactive
  // shows the live setting. They differ if you change Increment after
  // activating — which is the honest reading, not a bug.
  const applied = performance?.appliedIncrement ?? null
  const isActive = applied !== null
  const offerable =
    habit.incrementQuantity !== null &&
    habit.incrementQuantity > 0 &&
    habit.quantity !== null
  // Still render when active but no longer offerable, or setting Increment to
  // 0 would strand you: active with no way to deactivate.
  const showOverload = performance !== null && (isActive || offerable)
  const shownIncrement = isActive ? applied : habit.incrementQuantity

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold tracking-tight">{habit.name}</h2>
          {habit.calendarAlias?.trim() && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Calendar label: {habit.calendarAlias}
            </p>
          )}
        </div>
        <HabitDialog
          goalId={goalId}
          routeId={routeId}
          existing={habit}
          trigger={
            <Button variant="outline" size="sm" className="shrink-0">
              <PencilIcon className="size-4" />
              Edit
            </Button>
          }
        />
      </div>

      <Section title="Schedule">
        <p className="text-sm">
          {habit.daysOfWeek.length > 0
            ? formatDays(habit.daysOfWeek)
            : "No days set"}
          {time && (
            <span className="text-muted-foreground"> at {time}</span>
          )}
        </p>
      </Section>

      <Section title="Measurement">
        {editable && performance && !hasMeasurement(performance) && (
          <p className="mb-2 text-sm text-muted-foreground">
            No detail was recorded for this day — fill it in below.
          </p>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Duration</span>
            <div className="flex items-center gap-2">
              <div className="flex">
                <Input
                  type="number"
                  min={1}
                  aria-label="Duration"
                  disabled={!editable}
                  value={source.quantity ?? ""}
                  onChange={(e) => patch({ quantity: num(e.target.value) })}
                  placeholder="0"
                  className="w-16 rounded-r-none focus-visible:z-10"
                />
                <Select
                  value={source.unitId ?? DEFAULT_HABIT_UNIT_ID}
                  disabled={!editable}
                  onValueChange={(v) => patch({ unitId: v as HabitUnitId })}
                >
                  <SelectTrigger
                    aria-label="Duration unit"
                    className="w-[72px] rounded-l-none border-l-0 focus-visible:z-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitsForCategories(DURATION_UNIT_CATEGORIES).map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.shortLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasRest && (
                <>
                  <span className="text-sm text-muted-foreground">/</span>
                  <div className="flex">
                    <Input
                      type="number"
                      min={1}
                      aria-label="Rest duration"
                      disabled={!editable}
                      value={source.restQuantity ?? ""}
                      onChange={(e) =>
                        patch({ restQuantity: num(e.target.value) })
                      }
                      placeholder="0"
                      className="w-16 rounded-r-none focus-visible:z-10"
                    />
                    <Select
                      value={source.restUnitId ?? DEFAULT_REST_UNIT_ID}
                      disabled={!editable}
                      onValueChange={(v) =>
                        patch({ restUnitId: v as HabitUnitId })
                      }
                    >
                      <SelectTrigger
                        aria-label="Rest unit"
                        className="w-[64px] rounded-l-none border-l-0 focus-visible:z-10"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitsForCategories(REST_UNIT_CATEGORIES).map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.shortLabel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Total</span>
            <div className="flex">
              <Input
                type="number"
                min={1}
                aria-label="Total"
                disabled={!editable}
                value={source.totalQuantity ?? ""}
                onChange={(e) => patch({ totalQuantity: num(e.target.value) })}
                placeholder="0"
                className="w-16 rounded-r-none focus-visible:z-10"
              />
              <Select
                value={source.totalUnitId ?? DEFAULT_TOTAL_UNIT_ID}
                disabled={!editable}
                onValueChange={(v) => patch({ totalUnitId: v as HabitUnitId })}
              >
                <SelectTrigger
                  aria-label="Total unit"
                  className="w-[88px] rounded-l-none border-l-0 focus-visible:z-10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitsForCategories(TOTAL_UNIT_CATEGORIES).map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.shortLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {showOverload && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Progressive overload set at {habit.incrementQuantity ?? 0}{" "}
              {getHabitUnit(habit.unitId).shortLabel} — increment next instance
              of habit?
            </span>
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleIncrement(goalId, routeId, habitId, dateKey)}
              className={cn(
                "shrink-0 rounded-md border px-2 py-0.5 text-sm transition-colors",
                isActive
                  ? "border-accent-overload text-accent-overload hover:bg-accent-overload/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              +{shownIncrement} {getHabitUnit(habit.unitId).shortLabel}{" "}
              {isActive ? "active" : "inactive"}
            </button>
          </div>
        )}
      </Section>

      {habit.actions.trim() && (
        <Section title="Actions">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {habit.actions}
          </p>
        </Section>
      )}

      {habit.context.trim() && (
        <Section title="Context">
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {habit.context}
          </p>
        </Section>
      )}

      {links.length > 0 && (
        <Section title="Links">
          <ul className="flex flex-col gap-1">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  title={l.url}
                  className="text-sm text-accent-action underline underline-offset-2 hover:text-foreground break-all"
                >
                  {/* Unnamed links (migrated, or not yet named) fall back to
                      the URL — better than rendering an empty link. */}
                  {l.label.trim() || l.url}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function hasMeasurement(p: HabitPerformance): boolean {
  return (
    p.quantity !== null || p.restQuantity !== null || p.totalQuantity !== null
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-foreground/70">
        {title}
      </h3>
      {children}
    </div>
  )
}
