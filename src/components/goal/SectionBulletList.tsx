import { useEffect, useRef, useState } from "react"
import { PlusIcon, XIcon } from "lucide-react"
import type { GoalSectionId } from "@/config/goalSections"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  goalId: string
  sectionId: GoalSectionId
  label: string
  bullets: string[]
}

export function SectionBulletList({
  goalId,
  sectionId,
  label,
  bullets,
}: Props) {
  const updateGoal = useGoalsStore((s) => s.updateGoal)
  const goals = useGoalsStore((s) => s.goals)

  const [drafts, setDrafts] = useState<string[]>(bullets)
  const inputsRef = useRef<(HTMLTextAreaElement | null)[]>([])
  const [pendingFocus, setPendingFocus] = useState<number | null>(null)

  useEffect(() => {
    setDrafts(bullets)
  }, [bullets, goalId])

  useEffect(() => {
    if (pendingFocus !== null) {
      inputsRef.current[pendingFocus]?.focus()
      setPendingFocus(null)
    }
  }, [pendingFocus, drafts.length])

  function commit(next: string[]) {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return
    updateGoal(goalId, {
      sections: { ...goal.sections, [sectionId]: next },
    })
  }

  function addBullet(afterIndex?: number) {
    const insertAt =
      afterIndex !== undefined ? afterIndex + 1 : drafts.length
    const next = [...drafts]
    next.splice(insertAt, 0, "")
    setDrafts(next)
    commit(next)
    setPendingFocus(insertAt)
  }

  function removeBullet(index: number, focusNeighbor = false) {
    const next = drafts.filter((_, i) => i !== index)
    setDrafts(next)
    commit(next)
    if (focusNeighbor && next.length > 0) {
      setPendingFocus(Math.max(0, index - 1))
    }
  }

  function updateDraft(index: number, value: string) {
    const next = [...drafts]
    next[index] = value
    setDrafts(next)
  }

  function handleBlur(index: number) {
    if (drafts[index].trim() === "") {
      removeBullet(index)
      return
    }
    const trimmed = [...drafts]
    trimmed[index] = drafts[index].trim()
    setDrafts(trimmed)
    commit(trimmed)
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const value = drafts[index].trim()
      if (value === "") return
      const trimmed = [...drafts]
      trimmed[index] = value
      setDrafts(trimmed)
      commit(trimmed)
      addBullet(index)
    } else if (
      e.key === "Backspace" &&
      drafts[index] === "" &&
      drafts.length > 0
    ) {
      e.preventDefault()
      removeBullet(index, true)
    }
  }

  if (drafts.length === 0) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="self-start text-muted-foreground"
        onClick={() => addBullet()}
      >
        <PlusIcon className="size-4" />
        Add {label.toLowerCase()}
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      {drafts.map((bullet, index) => (
        <div
          key={index}
          className="group/bullet flex items-start gap-2 rounded-md px-1 hover:bg-muted/40"
        >
          <span
            className="mt-1.5 select-none text-muted-foreground"
            aria-hidden="true"
          >
            •
          </span>
          <Textarea
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            value={bullet}
            onChange={(e) => updateDraft(index, e.target.value)}
            onBlur={() => handleBlur(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            placeholder="Type and press Enter for another…"
            rows={1}
            className="!min-h-8 resize-none !border-0 !bg-transparent !px-0 !py-1 !text-sm !shadow-none focus-visible:!ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="mt-0.5 opacity-0 transition-opacity group-hover/bullet:opacity-100 focus-visible:opacity-100"
            onMouseDown={(e) => {
              e.preventDefault()
              removeBullet(index)
            }}
            aria-label="Remove bullet"
          >
            <XIcon className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 self-start text-muted-foreground"
        onClick={() => addBullet()}
      >
        <PlusIcon className="size-4" />
        Add another
      </Button>
    </div>
  )
}
