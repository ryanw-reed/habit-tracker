import type { Habit } from "@/types"
import { getHabitUnit } from "@/config/habitUnits"

/** The measurement fields shared by a habit template and a performance record. */
type Measurement = {
  quantity: number | null
  unitId: string | null
  restQuantity: number | null
  restUnitId: string | null
  totalQuantity: number | null
  totalUnitId: string | null
}

function formatPair(quantity: number, unitId: string): string {
  return `${quantity} ${getHabitUnit(unitId).shortLabel}`
}

function formatMeasurement(m: Measurement): string | null {
  const parts: string[] = []

  // Work and rest are resolved independently so that neither can hide the
  // other. The form now forbids rest-without-work, but data saved before that
  // rule existed may still violate it — show what we have rather than drop it.
  const on =
    m.quantity !== null && m.unitId !== null
      ? formatPair(m.quantity, m.unitId)
      : null
  const off =
    m.restQuantity !== null && m.restUnitId !== null
      ? formatPair(m.restQuantity, m.restUnitId)
      : null

  if (on && off) {
    parts.push(`${on} on / ${off} off`)
  } else if (on) {
    parts.push(on)
  } else if (off) {
    parts.push(`${off} off`)
  }

  if (m.totalQuantity !== null && m.totalUnitId !== null) {
    parts.push(`${formatPair(m.totalQuantity, m.totalUnitId)} total`)
  }

  return parts.length > 0 ? parts.join(" · ") : null
}

/**
 * The habit's *plan* — what the template says to do going forward.
 *
 * Examples: "5 min" · "10 reps" · "1 min on / 30 sec off · 20 min total"
 * Returns null when the habit has no target set at all.
 */
export function formatHabitTarget(habit: Habit): string | null {
  return formatMeasurement(habit)
}
