import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import type { DayOfWeek, Habit, HabitLink } from "@/types"
import {
  DEFAULT_HABIT_UNIT_ID,
  DEFAULT_REST_UNIT_ID,
  DEFAULT_TOTAL_UNIT_ID,
  DURATION_UNIT_CATEGORIES,
  REST_UNIT_CATEGORIES,
  TOTAL_UNIT_CATEGORIES,
  unitsForCategories,
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
import { Hint } from "@/components/ui/hint"
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
  intervalOn: false,
  restQuantity: "" as string,
  restUnitId: DEFAULT_REST_UNIT_ID as HabitUnitId,
  totalQuantity: "" as string,
  totalUnitId: DEFAULT_TOTAL_UNIT_ID as HabitUnitId,
  incrementQuantity: "" as string,
  actions: "" as string,
  context: "" as string,
  links: [] as HabitLink[],
}

function fromHabit(h: Habit) {
  return {
    name: h.name,
    daysOfWeek: h.daysOfWeek,
    timeOfDay: h.timeOfDay ?? "",
    quantity: h.quantity !== null ? String(h.quantity) : "",
    unitId: h.unitId,
    // Interval mode is inferred — no separate persisted flag to disagree with.
    intervalOn: h.restQuantity !== null,
    restQuantity: h.restQuantity !== null ? String(h.restQuantity) : "",
    restUnitId: h.restUnitId ?? DEFAULT_REST_UNIT_ID,
    totalQuantity: h.totalQuantity !== null ? String(h.totalQuantity) : "",
    totalUnitId: h.totalUnitId ?? DEFAULT_TOTAL_UNIT_ID,
    incrementQuantity:
      h.incrementQuantity !== null ? String(h.incrementQuantity) : "",
    actions: h.actions,
    context: h.context,
    links: h.links.map((l) => ({ ...l })),
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

  // Derived during render — no effect/state syncing.
  // Blank means "no target set" and stays valid; 0 does not (you have to start
  // somewhere). Increment is exempt: 0 is how you say "no progression".
  const errors: string[] = []
  {
    const atLeastOne = (raw: string, label: string) => {
      const v = raw.trim()
      if (v && (Number.parseInt(v, 10) || 0) < 1) {
        errors.push(`${label} must be at least 1.`)
      }
    }
    if (draft.intervalOn && !draft.quantity.trim()) {
      errors.push("Add a duration to use on/off.")
    }
    if (draft.intervalOn && !draft.restQuantity.trim()) {
      errors.push("Add a rest value to use on/off.")
    }
    atLeastOne(draft.quantity, "Duration")
    atLeastOne(draft.restQuantity, "Rest")
    atLeastOne(draft.totalQuantity, "Total")
  }

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
    if (!name || errors.length > 0) return

    // A row with no URL has nothing to link to — drop it, matching the
    // "empty values remove the row" convention used elsewhere.
    const links: HabitLink[] = draft.links
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter((l) => l.url)

    const quantity = draft.quantity.trim()
      ? Math.max(0, Number.parseInt(draft.quantity, 10) || 0)
      : null

    const incrementQuantity = draft.incrementQuantity.trim()
      ? Math.max(0, Number.parseInt(draft.incrementQuantity, 10) || 0)
      : null

    const baseQuantity = existing ? existing.baseQuantity : quantity

    const restQuantity =
      draft.intervalOn && draft.restQuantity.trim()
        ? Math.max(0, Number.parseInt(draft.restQuantity, 10) || 0)
        : null

    const totalQuantity = draft.totalQuantity.trim()
      ? Math.max(0, Number.parseInt(draft.totalQuantity, 10) || 0)
      : null

    const payload = {
      name,
      daysOfWeek: draft.daysOfWeek,
      timeOfDay: draft.timeOfDay || null,
      quantity,
      baseQuantity,
      incrementQuantity,
      unitId: draft.unitId,
      restQuantity,
      restUnitId: restQuantity !== null ? draft.restUnitId : null,
      totalQuantity,
      totalUnitId: totalQuantity !== null ? draft.totalUnitId : null,
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
      <DialogContent className="sm:max-w-4xl">
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
                  <Hint key={d.value} text={d.full}>
                    <button
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      aria-pressed={active}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {d.label}
                    </button>
                  </Hint>
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
              <Label htmlFor="habit-quantity" className="flex items-center gap-2">
                Duration
                <Hint text="Add a rest interval (work / rest)">
                  <button
                    type="button"
                    aria-pressed={draft.intervalOn}
                    onClick={() =>
                      setDraft((d) => ({ ...d, intervalOn: !d.intervalOn }))
                    }
                    className={cn(
                      "rounded-md border border-border px-1.5 py-0.5 text-[10px] leading-none font-medium transition-colors",
                      draft.intervalOn
                        ? "bg-muted text-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    on/off
                  </button>
                </Hint>
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Input
                    id="habit-quantity"
                    type="number"
                    min={1}
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
                      aria-label="Duration unit"
                      className="h-9 w-20 rounded-l-none border-l-0 focus-visible:z-10"
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

                {draft.intervalOn && (
                  <>
                    <span className="text-sm text-muted-foreground">/</span>
                    <div className="flex">
                      <Input
                        type="number"
                        min={1}
                        aria-label="Rest duration"
                        value={draft.restQuantity}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            restQuantity: e.target.value,
                          }))
                        }
                        placeholder="0"
                        className="w-20 rounded-r-none focus-visible:z-10"
                      />
                      <Select
                        value={draft.restUnitId}
                        onValueChange={(v) =>
                          setDraft((d) => ({
                            ...d,
                            restUnitId: v as HabitUnitId,
                          }))
                        }
                      >
                        <SelectTrigger
                          aria-label="Rest unit"
                          className="h-9 w-20 rounded-l-none border-l-0 focus-visible:z-10"
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
              <Hint
                className="max-w-sm"
                text="Method to implement the concept of progressive overload. Each time you complete a Habit on the calendar, you'll be asked whether to increase the Duration by this amount for the next instance. Leave at 0 for no progression."
              >
                <Label htmlFor="habit-increment">Increment</Label>
              </Hint>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="habit-total">Total</Label>
              <div className="flex">
                <Input
                  id="habit-total"
                  type="number"
                  min={1}
                  value={draft.totalQuantity}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, totalQuantity: e.target.value }))
                  }
                  placeholder="0"
                  className="w-20 rounded-r-none focus-visible:z-10"
                />
                <Select
                  value={draft.totalUnitId}
                  onValueChange={(v) =>
                    setDraft((d) => ({ ...d, totalUnitId: v as HabitUnitId }))
                  }
                >
                  <SelectTrigger
                    aria-label="Total unit"
                    className="h-9 w-24 rounded-l-none border-l-0 focus-visible:z-10"
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

          {errors.length > 0 && (
            <ul className="-mt-2 flex flex-col gap-0.5">
              {errors.map((message) => (
                <li key={message} className="text-xs text-destructive">
                  {message}
                </li>
              ))}
            </ul>
          )}

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
            <Label>Links</Label>
            {draft.links.length > 0 && (
              <div className="flex flex-col gap-2">
                {draft.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      aria-label="Link name"
                      value={link.label}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          links: d.links.map((l, i) =>
                            i === index ? { ...l, label: e.target.value } : l
                          ),
                        }))
                      }
                      placeholder="Name"
                      className="w-48 shrink-0"
                    />
                    <Input
                      aria-label="Link URL"
                      value={link.url}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          links: d.links.map((l, i) =>
                            i === index ? { ...l, url: e.target.value } : l
                          ),
                        }))
                      }
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove link"
                      className="shrink-0 text-muted-foreground"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          links: d.links.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start text-muted-foreground"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  links: [...d.links, { label: "", url: "" }],
                }))
              }
            >
              <PlusIcon className="size-4" />
              Add link
            </Button>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!draft.name.trim() || errors.length > 0}
            >
              {existing ? "Save changes" : "Add habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
