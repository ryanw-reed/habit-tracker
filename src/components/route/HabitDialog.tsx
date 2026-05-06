import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { InfoIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import type { DayOfWeek, Habit } from "@/types"
import {
  DEFAULT_HABIT_UNIT_ID,
  HABIT_UNITS,
  type HabitUnitId,
} from "@/config/habitUnits"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  quantity: "" as string,
  unitId: DEFAULT_HABIT_UNIT_ID as HabitUnitId,
  incrementQuantity: "" as string,
  actions: "" as string,
  context: "" as string,
  linksText: "" as string,
}

function fromHabit(h: Habit) {
  return {
    name: h.name,
    daysOfWeek: h.daysOfWeek,
    timeOfDay: h.timeOfDay ?? "",
    quantity: h.quantity !== null ? String(h.quantity) : "",
    unitId: h.unitId,
    incrementQuantity:
      h.incrementQuantity !== null ? String(h.incrementQuantity) : "",
    actions: h.actions,
    context: h.context,
    linksText: h.links.join("\n"),
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

    const quantity = draft.quantity.trim()
      ? Math.max(0, Number.parseInt(draft.quantity, 10) || 0)
      : null

    const incrementQuantity = draft.incrementQuantity.trim()
      ? Math.max(0, Number.parseInt(draft.incrementQuantity, 10) || 0)
      : null

    const baseQuantity = existing ? existing.baseQuantity : quantity

    const payload = {
      name,
      daysOfWeek: draft.daysOfWeek,
      timeOfDay: draft.timeOfDay || null,
      quantity,
      baseQuantity,
      incrementQuantity,
      unitId: draft.unitId,
      actions: draft.actions.trim(),
      context: draft.context.trim(),
      links,
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            Habits are the repeated actions, seemingly insignificant, that gradually, almost invisibly, lead to incremental progress to the goal. Simple daily actions, consistently repeated over enough time is the formula, and nature, of all progress.
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

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-time">Time of day</Label>
              <Input
                id="habit-time"
                type="time"
                value={draft.timeOfDay}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeOfDay: e.target.value }))
                }
                className="w-32"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-quantity">Duration</Label>
              <div className="flex">
                <Input
                  id="habit-quantity"
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, quantity: e.target.value }))
                  }
                  placeholder="0"
                  className="w-20 rounded-r-none focus-visible:z-10"
                />
                <Select
                  value={draft.unitId}
                  onValueChange={(v) =>
                    setDraft((d) => ({ ...d, unitId: v as HabitUnitId }))
                  }
                >
                  <SelectTrigger
                    aria-label="Unit"
                    className="h-9 w-20 rounded-l-none border-l-0 focus-visible:z-10"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_UNITS.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.shortLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="habit-increment"
                className="flex items-center gap-1.5"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="About increment"
                      className="inline-flex size-3.5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <InfoIcon className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent />
                </Tooltip>
                Increment
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="habit-increment"
                  type="number"
                  min={0}
                  value={draft.incrementQuantity}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      incrementQuantity: e.target.value,
                    }))
                  }
                  placeholder="0"
                  className="w-16"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Advance duration by increment"
                  title="Advance duration by increment"
                  disabled={
                    !draft.quantity.trim() ||
                    !draft.incrementQuantity.trim() ||
                    Number.parseInt(draft.incrementQuantity, 10) <= 0
                  }
                  onClick={() => {
                    const current =
                      Number.parseInt(draft.quantity, 10) || 0
                    const inc =
                      Number.parseInt(draft.incrementQuantity, 10) || 0
                    setDraft((d) => ({
                      ...d,
                      quantity: String(current + inc),
                    }))
                  }}
                  className="shrink-0"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-actions">Actions</Label>
            <Textarea
              id="habit-actions"
              value={draft.actions}
              onChange={(e) =>
                setDraft((d) => ({ ...d, actions: e.target.value }))
              }
              placeholder="What to do, step by step…"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-context">Context</Label>
            <Textarea
              id="habit-context"
              value={draft.context}
              onChange={(e) =>
                setDraft((d) => ({ ...d, context: e.target.value }))
              }
              placeholder="Cues, form notes, modifications…"
              rows={3}
            />
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
