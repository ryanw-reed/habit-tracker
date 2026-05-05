import { useEffect, useRef, useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import type { MaintenanceFrequency, MaintenanceItem } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PanelShell, PanelEmptyState } from "./PanelShell"

type Props = {
  goalId: string
  routeId: string
  items: MaintenanceItem[]
}

export function MaintenancePanel({ goalId, routeId, items }: Props) {
  const addMaintenance = useGoalsStore((s) => s.addMaintenance)
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)

  function handleAdd() {
    const created = addMaintenance(goalId, routeId, {
      text: "",
      frequency: "weekly",
    })
    if (created) setPendingFocusId(created.id)
  }

  return (
    <PanelShell
      title="Maintenance"
      hint="Things to keep healthy so the route works."
      count={items.length}
      action={
        items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleAdd}>
            <PlusIcon className="size-4" />
            Add
          </Button>
        )
      }
    >
      {items.length === 0 ? (
        <PanelEmptyState
          message="No maintenance tasks yet."
          action={
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <PlusIcon className="size-4" />
              Add maintenance
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <MaintenanceRow
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

function MaintenanceRow({
  goalId,
  routeId,
  item,
  autoFocus,
  onFocused,
}: {
  goalId: string
  routeId: string
  item: MaintenanceItem
  autoFocus: boolean
  onFocused: () => void
}) {
  const updateMaintenance = useGoalsStore((s) => s.updateMaintenance)
  const deleteMaintenance = useGoalsStore((s) => s.deleteMaintenance)
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
      deleteMaintenance(goalId, routeId, item.id)
      return
    }
    updateMaintenance(goalId, routeId, item.id, { text: trimmed })
    setText(trimmed)
  }

  return (
    <li className="group/row flex items-start gap-2 rounded-md px-1 hover:bg-muted/40">
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
        placeholder="What needs upkeep?"
        rows={1}
        className="!min-h-8 flex-1 resize-none !border-0 !bg-transparent !px-0 !py-1 !text-sm !shadow-none focus-visible:!ring-0"
      />
      <Select
        value={item.frequency}
        onValueChange={(v) =>
          updateMaintenance(goalId, routeId, item.id, {
            frequency: v as MaintenanceFrequency,
          })
        }
      >
        <SelectTrigger size="sm" className="mt-0.5 h-7 w-[110px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="mt-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100"
        onMouseDown={(e) => {
          e.preventDefault()
          deleteMaintenance(goalId, routeId, item.id)
        }}
        aria-label="Remove"
      >
        <XIcon className="size-3.5" />
      </Button>
    </li>
  )
}
