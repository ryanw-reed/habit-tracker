import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import type { Experiment, ExperimentStatus } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatTargetDate } from "@/lib/dates"
import { PanelShell, PanelEmptyState } from "./PanelShell"
import { ExperimentDialog } from "./ExperimentDialog"

type Props = {
  goalId: string
  routeId: string
  experiments: Experiment[]
}

const STATUS_LABEL: Record<ExperimentStatus, string> = {
  planned: "Planned",
  running: "Running",
  completed: "Completed",
}

const STATUS_CLASSES: Record<ExperimentStatus, string> = {
  planned: "bg-muted text-muted-foreground",
  running: "bg-accent-action/15 text-accent-action",
  completed: "bg-foreground/85 text-background",
}

export function ExperimentsPanel({ goalId, routeId, experiments }: Props) {
  return (
    <PanelShell
      title="Experiments"
      hint="Hypotheses to test along the way."
      count={experiments.length}
      action={
        experiments.length > 0 && (
          <ExperimentDialog
            goalId={goalId}
            routeId={routeId}
            trigger={
              <Button variant="ghost" size="sm">
                <PlusIcon className="size-4" />
                Add
              </Button>
            }
          />
        )
      }
    >
      {experiments.length === 0 ? (
        <PanelEmptyState
          message="No experiments yet."
          action={
            <ExperimentDialog
              goalId={goalId}
              routeId={routeId}
              trigger={
                <Button variant="outline" size="sm">
                  <PlusIcon className="size-4" />
                  Add experiment
                </Button>
              }
            />
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {experiments.map((experiment) => (
            <ExperimentRow
              key={experiment.id}
              goalId={goalId}
              routeId={routeId}
              experiment={experiment}
            />
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function ExperimentRow({
  goalId,
  routeId,
  experiment,
}: {
  goalId: string
  routeId: string
  experiment: Experiment
}) {
  const deleteExperiment = useGoalsStore((s) => s.deleteExperiment)

  const dateRange =
    experiment.startDate && experiment.endDate
      ? `${formatTargetDate(experiment.startDate)} – ${formatTargetDate(experiment.endDate)}`
      : experiment.startDate
        ? `from ${formatTargetDate(experiment.startDate)}`
        : experiment.endDate
          ? `until ${formatTargetDate(experiment.endDate)}`
          : null

  return (
    <li className="group/exp relative rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
      <ExperimentDialog
        goalId={goalId}
        routeId={routeId}
        existing={experiment}
        trigger={
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer rounded-lg"
            aria-label={`Edit experiment ${experiment.name}`}
          />
        }
      />
      <div className="relative z-0 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {experiment.name}
            </span>
            <Badge className={cn("text-[10px]", STATUS_CLASSES[experiment.status])}>
              {STATUS_LABEL[experiment.status]}
            </Badge>
          </div>
          {experiment.hypothesis && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              {experiment.hypothesis}
            </p>
          )}
          {dateRange && (
            <p className="mt-1.5 text-xs text-muted-foreground">{dateRange}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative z-20 shrink-0 opacity-0 transition-opacity group-hover/exp:opacity-100 focus-visible:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Experiment actions"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-30">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (confirm(`Delete experiment "${experiment.name}"?`)) {
                  deleteExperiment(goalId, routeId, experiment.id)
                  toast.success("Experiment deleted")
                }
              }}
            >
              Delete experiment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}
