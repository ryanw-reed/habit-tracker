import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"
import type { DayOfWeek, Habit } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Props = {
  goalId: string
  routeId: string
  trigger: ReactNode
  existing?: Habit
}

const DAY_LABELS: { value: DayOfWeek; label: string; full: string }[] = [
  { value: 1, label: "M", full: "Monday" },
  { value: 2, label: "T", full: "Tuesday" },
  { value: 3, label: "W", full: "Wednesday" },
  { value: 4, label: "T", full: "Thursday" },
  { value: 5, label: "F", full: "Friday" },
  { value: 6, label: "S", full: "Saturday" },
  { value: 0, label: "S", full: "Sunday" },
]

const emptyDraft = {
  name: "",
  daysOfWeek: [] as DayOfWeek[],
  timeOfDay: "" as string,
  durationMinutes: "" as string,
  linksText: "" as string,
  notes: "" as string,
}

function fromHabit(h: Habit) {
  return {
    name: h.name,
    daysOfWeek: h.daysOfWeek,
    timeOfDay: h.timeOfDay ?? "",
    durationMinutes:
      h.durationMinutes !== null ? String(h.durationMinutes) : "",
    linksText: h.links.join("\n"),
    notes: h.notes,
  }
}

export function HabitDialog({ goalId, routeId, trigger, existing }: Props) {
  const addHabit = useGoalsStore((s) => s.addHabit)
  const updateHabit = useGoalsStore((s) => s.updateHabit)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(
    existing ? fromHabit(existing) : emptyDraft
  )

  useEffect(() => {
    if (open) {
      setDraft(existing ? fromHabit(existing) : emptyDraft)
    }
  }, [open, existing])

  function toggleDay(day: DayOfWeek) {
    setDraft((d) => ({
      ...d,
      daysOfWeek: d.daysOfWeek.includes(day)
        ? d.daysOfWeek.filter((x) => x !== day)
        : [...d.daysOfWeek, day].sort((a, b) => a - b) as DayOfWeek[],
    }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = draft.name.trim()
    if (!name) return

    const links = draft.linksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    const duration = draft.durationMinutes.trim()
      ? Math.max(0, Number.parseInt(draft.durationMinutes, 10) || 0)
      : null

    const payload = {
      name,
      daysOfWeek: draft.daysOfWeek,
      timeOfDay: draft.timeOfDay || null,
      durationMinutes: duration,
      links,
      notes: draft.notes.trim(),
    }

    if (existing) {
      updateHabit(goalId, routeId, existing.id, payload)
      toast.success("Habit updated")
    } else {
      addHabit(goalId, routeId, payload)
      toast.success("Habit added")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            Habits are the recurring practices that build the goal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              autoFocus
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="e.g. Pull-up practice"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Days of week</Label>
            <div className="flex gap-1">
              {DAY_LABELS.map((d) => {
                const active = draft.daysOfWeek.includes(d.value)
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    aria-pressed={active}
                    title={d.full}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-time">Time of day</Label>
              <Input
                id="habit-time"
                type="time"
                value={draft.timeOfDay}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeOfDay: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-duration">Duration (min)</Label>
              <Input
                id="habit-duration"
                type="number"
                min={0}
                value={draft.durationMinutes}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    durationMinutes: e.target.value,
                  }))
                }
                placeholder="e.g. 30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-links">Links (one per line)</Label>
            <Textarea
              id="habit-links"
              value={draft.linksText}
              onChange={(e) =>
                setDraft((d) => ({ ...d, linksText: e.target.value }))
              }
              placeholder="https://..."
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-notes">Notes</Label>
            <Textarea
              id="habit-notes"
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
              placeholder="Cues, form notes, modifications…"
              rows={3}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!draft.name.trim()}>
              {existing ? "Save changes" : "Add habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
