import type { ReactNode } from "react"
import { PencilIcon } from "lucide-react"
import { getHabitUnit } from "@/config/habitUnits"
import { formatDays, formatTime } from "@/lib/dates"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { HabitDialog } from "@/components/route/HabitDialog"

type Props = {
  goalId: string
  routeId: string
  habitId: string
}

export function HabitDetailPanel({ goalId, routeId, habitId }: Props) {
  const habit = useGoalsStore((s) => {
    const g = s.goals.find((x) => x.id === goalId)
    const r = g?.routes.find((x) => x.id === routeId)
    return r?.habits.find((x) => x.id === habitId)
  })

  if (!habit) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Habit not found.
      </div>
    )
  }

  const time = formatTime(habit.timeOfDay)
  const unit = getHabitUnit(habit.unitId)
  const links = habit.links.filter((l) => l.trim())

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
        </p>
        {time && (
          <p className="mt-1 text-sm text-muted-foreground">at {time}</p>
        )}
      </Section>

      {habit.quantity !== null && (
        <Section title="Target">
          <p className="text-sm">
            {habit.quantity} {unit.longLabel.toLowerCase()}
          </p>
          {habit.incrementQuantity !== null &&
            habit.incrementQuantity > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Progressive — starts at{" "}
                {habit.baseQuantity ?? habit.quantity}, +
                {habit.incrementQuantity} {unit.shortLabel} each step
              </p>
            )}
        </Section>
      )}

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
                  href={l}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent-action underline underline-offset-2 hover:text-foreground break-all"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}
