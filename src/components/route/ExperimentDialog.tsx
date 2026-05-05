import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { toast } from "sonner"
import type { Experiment, ExperimentStatus } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  goalId: string
  routeId: string
  trigger: ReactNode
  existing?: Experiment
}

const emptyDraft = {
  name: "",
  hypothesis: "",
  result: "",
  status: "planned" as ExperimentStatus,
  startDate: "" as string,
  endDate: "" as string,
}

function fromExperiment(e: Experiment) {
  return {
    name: e.name,
    hypothesis: e.hypothesis,
    result: e.result,
    status: e.status,
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? "",
  }
}

export function ExperimentDialog({
  goalId,
  routeId,
  trigger,
  existing,
}: Props) {
  const addExperiment = useGoalsStore((s) => s.addExperiment)
  const updateExperiment = useGoalsStore((s) => s.updateExperiment)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(
    existing ? fromExperiment(existing) : emptyDraft
  )

  useEffect(() => {
    if (open) {
      setDraft(existing ? fromExperiment(existing) : emptyDraft)
    }
  }, [open, existing])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = draft.name.trim()
    if (!name) return

    const payload = {
      name,
      hypothesis: draft.hypothesis.trim(),
      result: draft.result.trim(),
      status: draft.status,
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
    }

    if (existing) {
      updateExperiment(goalId, routeId, existing.id, payload)
      toast.success("Experiment updated")
    } else {
      addExperiment(goalId, routeId, payload)
      toast.success("Experiment added")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit experiment" : "New experiment"}
          </DialogTitle>
          <DialogDescription>
            Test a hypothesis. Track what happened.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="experiment-name">Name</Label>
            <Input
              id="experiment-name"
              autoFocus
              value={draft.name}
              onChange={(e) =>
                setDraft((d) => ({ ...d, name: e.target.value }))
              }
              placeholder="e.g. Switch to neutral grip pull-ups"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="experiment-hypothesis">Hypothesis</Label>
            <Textarea
              id="experiment-hypothesis"
              value={draft.hypothesis}
              onChange={(e) =>
                setDraft((d) => ({ ...d, hypothesis: e.target.value }))
              }
              placeholder="What you think will happen and why."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="experiment-status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    status: v as ExperimentStatus,
                  }))
                }
              >
                <SelectTrigger id="experiment-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="experiment-start">Start</Label>
              <Input
                id="experiment-start"
                type="date"
                value={draft.startDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, startDate: e.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="experiment-end">End</Label>
              <Input
                id="experiment-end"
                type="date"
                value={draft.endDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, endDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="experiment-result">Result</Label>
            <Textarea
              id="experiment-result"
              value={draft.result}
              onChange={(e) =>
                setDraft((d) => ({ ...d, result: e.target.value }))
              }
              placeholder="What actually happened. Fill in when complete."
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
              {existing ? "Save changes" : "Add experiment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
