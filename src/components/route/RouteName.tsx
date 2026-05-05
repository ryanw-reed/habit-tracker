import { useEffect, useState } from "react"
import { useGoalsStore } from "@/stores/goalsStore"
import { Input } from "@/components/ui/input"

type Props = {
  goalId: string
  routeId: string
  value: string
}

export function RouteName({ goalId, routeId, value }: Props) {
  const updateRoute = useGoalsStore((s) => s.updateRoute)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value, routeId])

  function commit() {
    const trimmed = draft.trim() || "Untitled route"
    if (trimmed === value) return
    updateRoute(goalId, routeId, { name: trimmed })
    setDraft(trimmed)
  }

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          ;(e.target as HTMLInputElement).blur()
        }
      }}
      placeholder="Untitled route"
      aria-label="Route name"
      className="!h-auto !border-0 !bg-transparent !p-0 !text-xl !font-semibold !shadow-none focus-visible:!ring-0"
    />
  )
}
