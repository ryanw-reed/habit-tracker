import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  hint?: string
  count?: number
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PanelShell({
  title,
  hint,
  count,
  action,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-background p-5",
        className
      )}
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            {count !== undefined && count > 0 && (
              <span className="text-xs text-muted-foreground">{count}</span>
            )}
          </div>
          {hint && (
            <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  )
}

export function PanelEmptyState({
  message,
  action,
}: {
  message: string
  action: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <p className="text-xs text-muted-foreground">{message}</p>
      {action}
    </div>
  )
}
