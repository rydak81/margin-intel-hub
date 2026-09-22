// The single choke point every emitted price passes through.
// No code path may produce a price below the floor — decision.ts must route
// every candidate price through clampToGuardrails before emitting it.

import type { PriceLadder } from "./types"
import { roundPrice } from "./pricing"

export class FloorBreachError extends Error {
  constructor(sku: string, price: number, floor: number) {
    super(`Guardrail breach on ${sku}: attempted to emit ${price} below floor ${floor}`)
    this.name = "FloorBreachError"
  }
}

/**
 * Clamp a candidate price into [floor, ceiling]. The floor is absolute; the
 * ceiling yields only if it is somehow below the floor (misconfiguration),
 * in which case the floor still wins.
 */
export function clampToGuardrails(candidate: number, ladder: PriceLadder): number {
  const ceiling = Math.max(ladder.ceilingPrice, ladder.floorPrice)
  const clamped = Math.min(Math.max(candidate, ladder.floorPrice), ceiling)
  const result = roundPrice(clamped)
  // Belt and braces: rounding must never land under the floor.
  return result < ladder.floorPrice ? ladder.floorPrice : result
}

/** Assert an already-emitted price respects the floor. Used by tests and callers. */
export function assertAboveFloor(sku: string, price: number, ladder: PriceLadder): void {
  if (price < ladder.floorPrice) {
    throw new FloorBreachError(sku, price, ladder.floorPrice)
  }
}
