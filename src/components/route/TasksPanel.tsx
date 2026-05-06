import { useEffect, useRef, useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import type { Task } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { describeCountdown, daysUntil, formatTargetDate } from "@/lib/dates"
import { PanelShell, PanelEmptyState } from "./PanelShell"

type Props = {
  goalId: string
  routeId: string
  tasks: Task[]
}

export function TasksPanel({ goalId, routeId, tasks }: Props) {
  const addTask = useGoalsStore((s) => s.addTask)
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)

  const completed = tasks.filter((t) => t.completed).length

  function handleAdd() {
    const created = addTask(goalId, routeId, {
      text: "",
      dueDate: null,
    })
    if (created) setPendingFocusId(created.id)
  }

  return (
    <PanelShell
      title="Tasks"
      hint="One-off things to check off."
      count={tasks.length}
      action={
        tasks.length > 0 && (
          <div className="flex items-center gap-3">
            {tasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completed}/{tasks.length} done
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              <PlusIcon className="size-4" />
              Add
            </Button>
          </div>
        )
      }
    >
      {tasks.length === 0 ? (
        <PanelEmptyState
          message="No tasks yet."
          action={
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <PlusIcon className="size-4" />
              Add task
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              goalId={goalId}
              routeId={routeId}
              task={task}
              autoFocus={pendingFocusId === task.id}
              onFocused={() => setPendingFocusId(null)}
            />
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function TaskRow({
  goalId,
  routeId,
  task,
  autoFocus,
  onFocused,
}: {
  goalId: string
  routeId: string
  task: Task
  autoFocus: boolean
  onFocused: () => void
}) {
  const updateTask = useGoalsStore((s) => s.updateTask)
  const deleteTask = useGoalsStore((s) => s.deleteTask)
  const [text, setText] = useState(task.text)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(task.text)
  }, [task.text])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
      onFocused()
    }
  }, [autoFocus, onFocused])

  function commitText() {
    const trimmed = text.trim()
    if (trimmed === task.text) return
    if (trimmed === "") {
      deleteTask(goalId, routeId, task.id)
      return
    }
    updateTask(goalId, routeId, task.id, { text: trimmed })
    setText(trimmed)
  }

  const days = daysUntil(task.dueDate)
  const isOverdue = days !== null && days < 0 && !task.completed

  return (
    <li className="group/row flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-muted/40">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) =>
          updateTask(goalId, routeId, task.id, {
            completed: checked === true,
          })
        }
        className="mt-2 shrink-0"
      />
      <Textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commitText}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            ;(e.target as HTMLTextAreaElement).blur()
          }
        }}
        placeholder="What needs doing?"
        rows={1}
        className={cn(
          "!min-h-8 flex-1 resize-none !border-0 !bg-transparent !px-0 !py-1 !text-sm !shadow-none focus-visible:!ring-0",
          task.completed && "text-muted-foreground line-through"
        )}
      />
      <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
        <Input
          type="date"
          value={task.dueDate ?? ""}
          onChange={(e) =>
            updateTask(goalId, routeId, task.id, {
              dueDate: e.target.value || null,
            })
          }
          className={cn(
            "h-7 w-[140px] text-xs",
            !task.dueDate && "text-muted-foreground"
          )}
        />
        {task.dueDate && (
          <span
            className={cn(
              "hidden text-xs sm:inline",
              isOverdue
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            title={formatTargetDate(task.dueDate)}
          >
            {describeCountdown(days)}
          </span>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="mt-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
        onMouseDown={(e) => {
          e.preventDefault()
          deleteTask(goalId, routeId, task.id)
        }}
        aria-label="Remove"
      >
        <XIcon className="size-3.5" />
      </Button>
    </li>
  )
}
