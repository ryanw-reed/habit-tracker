import { useEffect, useState } from "react"
import { PlusIcon, RouteIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import type { Goal } from "@/types"
import { useGoalsStore } from "@/stores/goalsStore"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { RouteName } from "./RouteName"
import { HabitsPanel } from "./HabitsPanel"
import { ActionItemsPanel } from "./ActionItemsPanel"
import { ExperimentsPanel } from "./ExperimentsPanel"
import { MaintenancePanel } from "./MaintenancePanel"

type Props = { goal: Goal }

export function RoutesTabs({ goal }: Props) {
  const addRoute = useGoalsStore((s) => s.addRoute)
  const deleteRoute = useGoalsStore((s) => s.deleteRoute)
  const [activeId, setActiveId] = useState<string | undefined>(
    goal.routes[0]?.id
  )

  useEffect(() => {
    if (!goal.routes.find((r) => r.id === activeId)) {
      setActiveId(goal.routes[0]?.id)
    }
  }, [goal.routes, activeId])

  function handleAdd() {
    const created = addRoute(goal.id, `Route ${goal.routes.length + 1}`)
    if (created) {
      setActiveId(created.id)
      toast.success("Route added")
    }
  }

  if (goal.routes.length === 0) {
    return <RoutesEmptyState onAdd={handleAdd} />
  }

  return (
    <Tabs
      value={activeId}
      onValueChange={(v) => setActiveId(v)}
      className="w-full"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border">
        <TabsList variant="line" className="h-auto p-0">
          {goal.routes.map((route) => (
            <TabsTrigger
              key={route.id}
              value={route.id}
              className="rounded-none px-4 py-2.5 text-sm font-medium group-data-horizontal/tabs:after:bottom-[-2px]"
            >
              {route.name || "Untitled route"}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button variant="ghost" size="sm" onClick={handleAdd}>
          <PlusIcon className="size-4" />
          Add route
        </Button>
      </div>

      {goal.routes.map((route) => (
        <TabsContent
          key={route.id}
          value={route.id}
          className="mt-6 flex flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-3">
            <RouteName
              goalId={goal.id}
              routeId={route.id}
              value={route.name}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                if (
                  confirm(
                    `Delete route "${route.name || "Untitled route"}"? This cannot be undone.`
                  )
                ) {
                  deleteRoute(goal.id, route.id)
                  toast.success("Route deleted")
                }
              }}
            >
              <Trash2Icon className="size-4" />
              Delete route
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <HabitsPanel
              goalId={goal.id}
              routeId={route.id}
              habits={route.habits}
            />
            <ActionItemsPanel
              goalId={goal.id}
              routeId={route.id}
              items={route.actionItems}
            />
            <ExperimentsPanel
              goalId={goal.id}
              routeId={route.id}
              experiments={route.experiments}
            />
            <MaintenancePanel
              goalId={goal.id}
              routeId={route.id}
              items={route.maintenance}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

function RoutesEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-8 py-12 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-accent-action/10 text-accent-action">
        <RouteIcon className="size-5" />
      </div>
      <h2 className="text-base font-semibold tracking-tight">
        Map your first route
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        A route is one path towards a goal. Goals can, and should, be
        approached by multiple routes.
      </p>
      <Button className="mt-5" onClick={onAdd}>
        <PlusIcon className="size-4" />
        Add a route
      </Button>
    </div>
  )
}
