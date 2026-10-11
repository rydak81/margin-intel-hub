import { z } from 'zod'
import { DEFAULT_STRATEGY } from './decision'

const nonnegative = z.number().finite().nonnegative()
const rate = nonnegative.lt(1)
const strategySchema = z.object({
  targetMargin: rate, floorMargin: rate, proximityTarget: nonnegative,
  ceilingMultiplier: nonnegative.min(1), acosRate: rate, returnReserveRate: rate,
  circuitBreakerPct: nonnegative, minCompetitorReviews: nonnegative,
  cooldownHours: nonnegative, maxDailyChanges: nonnegative,
})
const costSchema = z.object({ asin: z.string(), landedCost: nonnegative,
  outboundShipping: nonnegative, effectiveDate: z.string(), estimated: z.boolean() })
const feesSchema = z.record(z.record(z.object({ rate: rate.optional(), fixedFees: nonnegative.optional() })))

/** Browser state is untrusted; old, corrupt or incomplete values reset to defaults. */
export function readSavedSettings() {
  const read = (key: string): unknown => {
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') } catch { return null }
  }
  const costs = z.record(costSchema).safeParse(read('repricer.costs.v1'))
  const strategy = strategySchema.safeParse(read('repricer.strategy.v1'))
  const fees = feesSchema.safeParse(read('repricer.fees.v1'))
  return { costs: costs.success ? costs.data : {}, strategy: strategy.success ? strategy.data : DEFAULT_STRATEGY,
    feeOverrides: fees.success ? fees.data : {} }
}
