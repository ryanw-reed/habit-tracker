import type { ReactNode } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type Props = {
  /** The tooltip copy. */
  text: ReactNode
  /** The element that triggers the tooltip on hover. */
  children: ReactNode
  /** Optional overrides for the tooltip box (e.g. a wider `max-w-*`). */
  className?: string
}

/**
 * The app's single tooltip pattern: wrap any element to give it our styled
 * tooltip. Hand-written (not a shadcn primitive).
 *
 * Always prefer this over the native `title` attribute — `title` renders the
 * OS tooltip, which is ~1s delayed, unstyleable, and looks different on every
 * browser/OS.
 */
export function Hint({ text, children, className }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={className}>{text}</TooltipContent>
    </Tooltip>
  )
}
