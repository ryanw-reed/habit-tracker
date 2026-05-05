import { useEffect, useRef, useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import type { ActionItem } from "@/types"
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
  items: ActionItem[]
}

export function ActionItemsPanel({ goalId, routeId, items }: Props) {
  const addActionItem = useGoalsStore((s) => s.addActionItem)
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)

  const completed = items.filter((i) => i.completed).length

  function handleAdd() {
    const created = addActionItem(goalId, routeId, {
      text: "",
      dueDate: null,
    })
    if (created) setPendingFocusId(created.id)
  }

  return (
    <PanelShell
      title="Action items"
      hint="One-off things to check off."
      count={items.length}
      action={
        items.length > 0 && (
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completed}/{items.length} done
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
      {items.length === 0 ? (
        <PanelEmptyState
          message="No action items yet."
          action={
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <PlusIcon className="size-4" />
              Add action item
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <ActionItemRow
              key={item.id}
              goalId={goalId}
              routeId={routeId}
              item={item}
              autoFocus={pendingFocusId === item.id}
              onFocused={() => setPendingFocusId(null)}
            />
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function ActionItemRow({
  goalId,
  routeId,
  item,
  autoFocus,
  onFocused,
}: {
  goalId: string
  routeId: string
  item: ActionItem
  autoFocus: boolean
  onFocused: () => void
}) {
  const updateActionItem = useGoalsStore((s) => s.updateActionItem)
  const deleteActionItem = useGoalsStore((s) => s.deleteActionItem)
  const [text, setText] = useState(item.text)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setText(item.text)
  }, [item.text])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
      onFocused()
    }
  }, [autoFocus, onFocused])

  function commitText() {
    const trimmed = text.trim()
    if (trimmed === item.text) return
    if (trimmed === "") {
      deleteActionItem(goalId, routeId, item.id)
      return
    }
    updateActionItem(goalId, routeId, item.id, { text: trimmed })
    setText(trimmed)
  }

  const days = daysUntil(item.dueDate)
  const isOverdue = days !== null && days < 0 && !item.completed

  return (
    <li className="group/row flex items-start gap-2 rounded-md px-1 py-0.5 hover:bg-muted/40">
      <Checkbox
        checked={item.completed}
        onCheckedChange={(checked) =>
          updateActionItem(goalId, routeId, item.id, {
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
          item.completed && "text-muted-foreground line-through"
        )}
      />
      <div className="mt-0.5 flex shrink-0 items-center gap-1.5">
        <Input
          type="date"
          value={item.dueDate ?? ""}
          onChange={(e) =>
            updateActionItem(goalId, routeId, item.id, {
              dueDate: e.target.value || null,
            })
          }
          className={cn(
            "h-7 w-[140px] text-xs",
            !item.dueDate && "text-muted-foreground"
          )}
        />
        {item.dueDate && (
          <span
            className={cn(
              "hidden text-xs sm:inline",
              isOverdue
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            title={formatTargetDate(item.dueDate)}
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
          deleteActionItem(goalId, routeId, item.id)
        }}
        aria-label="Remove"
      >
        <XIcon className="size-3.5" />
      </Button>
    </li>
  )
}
