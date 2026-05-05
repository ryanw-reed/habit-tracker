import { NavLink, Outlet } from "react-router-dom"
import { TargetIcon, CalendarDaysIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoalsStore } from "@/stores/goalsStore"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { to: "/", label: "Goals", icon: TargetIcon, end: true },
  { to: "/calendar", label: "Calendar", icon: CalendarDaysIcon, end: false },
]

export function AppShell() {
  const goals = useGoalsStore((s) => s.goals)
  const recentGoals = [...goals]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center px-5">
          <span className="text-base font-semibold tracking-tight">
            Habit<span className="text-accent-action">.</span>
          </span>
        </div>
        <Separator />
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {recentGoals.length > 0 && (
          <>
            <div className="px-5 pt-4 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recent goals
            </div>
            <nav className="flex flex-col gap-0.5 px-3 pb-3">
              {recentGoals.map((g) => (
                <NavLink
                  key={g.id}
                  to={`/goals/${g.id}`}
                  className={({ isActive }) =>
                    cn(
                      "truncate rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )
                  }
                >
                  {g.title || "Untitled goal"}
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
