import { describe, expect, it } from "vitest"

import { computeLadder, marginAtPrice, priceForMargin, UnsellableSkuError } from "./pricing"
import { clampToGuardrails } from "./guardrails"
import { decide, DEFAULT_STRATEGY } from "./decision"
import { parseCostCsv } from "./costs"
import type { CatalogItem, CostRecord, PricingInputs, StrategyConfig } from "./types"

// The worked example from the spec — the first unit test the engine must pass.
const workedExample: PricingInputs = {
  landedCost: 65.0,
  outboundShipping: 8.0,
  fixedFees: 0.3,
  referralRate: 0.08,
  acosRate: 0.05,
  returnReserveRate: 0.06,
}

describe("pricing math", () => {
  it("reproduces the spec's worked example", () => {
    expect(priceForMargin(workedExample, 0.12)).toBeCloseTo(106.23, 2)
    expect(priceForMargin(workedExample, 0.18)).toBeCloseTo(116.35, 2)
  })

  it("reverses: margin at the floor price is the floor margin", () => {
    const floor = priceForMargin(workedExample, 0.12)
    expect(marginAtPrice(workedExample, floor)).toBeCloseTo(0.12, 3)
  })

  it("guards the denominator with a clear domain error", () => {
    const impossible: PricingInputs = { ...workedExample, referralRate: 0.9 }
    expect(() => priceForMargin(impossible, 0.12, "B0TESTSKU1")).toThrow(UnsellableSkuError)
    expect(() => priceForMargin(impossible, 0.12, "B0TESTSKU1")).toThrow(/B0TESTSKU1/)
  })

  it("never returns a negative or infinite price", () => {
    for (let m = 0; m < 0.8; m += 0.05) {
      const p = priceForMargin(workedExample, m)
      expect(Number.isFinite(p)).toBe(true)
      expect(p).toBeGreaterThan(0)
    }
  })

  it("defaults the ceiling to max(target * 1.25, market high)", () => {
    const low = computeLadder(workedExample, {
      floorMargin: 0.12,
      targetMargin: 0.18,
      ceilingMultiplier: 1.25,
      marketHigh: 10,
    })
    expect(low.ceilingPrice).toBeCloseTo(low.targetPrice * 1.25, 2)
    const high = computeLadder(workedExample, {
      floorMargin: 0.12,
      targetMargin: 0.18,
      ceilingMultiplier: 1.25,
      marketHigh: 999,
    })
    expect(high.ceilingPrice).toBe(999)
  })
})

describe("guardrails", () => {
  const ladder = computeLadder(workedExample, {
    floorMargin: 0.12,
    targetMargin: 0.18,
    ceilingMultiplier: 1.25,
    marketHigh: null,
  })

  it("clamps below-floor candidates up to the floor", () => {
    expect(clampToGuardrails(1, ladder)).toBe(ladder.floorPrice)
    expect(clampToGuardrails(ladder.floorPrice - 0.01, ladder)).toBe(ladder.floorPrice)
  })

  it("clamps above-ceiling candidates down to the ceiling", () => {
    expect(clampToGuardrails(99999, ladder)).toBe(ladder.ceilingPrice)
  })

  it("cannot be bypassed: fuzzed candidates never land below the floor", () => {
    let seed = 42
    const rand = () => {
      // deterministic LCG so the property check is reproducible
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    for (let i = 0; i < 5000; i++) {
      const candidate = rand() * 2000 - 500
      const emitted = clampToGuardrails(candidate, ladder)
      expect(emitted).toBeGreaterThanOrEqual(ladder.floorPrice)
      expect(emitted).toBeLessThanOrEqual(Math.max(ladder.ceilingPrice, ladder.floorPrice))
    }
  })
})

const item = (overrides: Partial<CatalogItem> = {}): CatalogItem => ({
  asin: "B0TESTSKU1",
  title: "iPad 7th Gen 10.2in 2019, 32GB Wi-Fi Space Gray",
  category: "iPad",
  currentPrice: 99.52,
  lowestCompetitor: 89.0,
  competingSellers: 119,
  buyboxHolder: "Ewaste Zone",
  buyboxPrice: 101,
  hasBuybox: false,
  rating: 4.1,
  reviewCount: 15500,
  monthlySalesBand: "7K+",
  ...overrides,
})

const cost = (overrides: Partial<CostRecord> = {}): CostRecord => ({
  asin: "B0TESTSKU1",
  landedCost: 65,
  outboundShipping: 8,
  effectiveDate: "2026-08-05",
  estimated: false,
  ...overrides,
})

describe("decision engine", () => {
  it("excludes SKUs with no cost data from repricing entirely", () => {
    const d = decide(item(), null, "amazon", DEFAULT_STRATEGY)
    expect(d.action).toBe("EXCLUDED_NO_COST")
    expect(d.newPrice).toBeNull()
  })

  it("holds at floor when the market is below it — the iPad 7th Gen case", () => {
    // landed 65 + shipping 8 on Amazon (8% referral, 6% reserve): floor ≈ 88.66.
    // Competing at 89.00 * 1.02 = 90.78 is fine, but at a deeper market low the
    // engine must refuse to chase.
    const d = decide(item({ lowestCompetitor: 71.28 }), cost(), "amazon", DEFAULT_STRATEGY)
    expect(d.action).toBe("HOLD_ABOVE_MARKET")
    expect(d.newPrice).toBe(d.ladder!.floorPrice)
    expect(d.flags.join(" ")).toMatch(/below our floor/)
  })

  it("reprices to lowest * (1 + proximity) inside the band", () => {
    const d = decide(item(), cost({ landedCost: 55 }), "amazon", DEFAULT_STRATEGY)
    expect(d.action).toBe("REPRICE")
    expect(d.newPrice).toBeCloseTo(89.0 * 1.02, 2)
    expect(d.marginAtNewPrice!).toBeGreaterThanOrEqual(DEFAULT_STRATEGY.floorMargin - 1e-9)
  })

  it("race to the bottom terminates at the floor", () => {
    const c = cost()
    let competitor = 140
    let lastPrice = Number.POSITIVE_INFINITY
    for (let round = 0; round < 50; round++) {
      const d = decide(item({ lowestCompetitor: competitor }), c, "amazon", DEFAULT_STRATEGY)
      expect(d.newPrice!).toBeGreaterThanOrEqual(d.ladder!.floorPrice)
      expect(d.newPrice!).toBeLessThanOrEqual(lastPrice)
      lastPrice = d.newPrice!
      competitor = Math.max(1, d.newPrice! - 5) // competitor undercuts us every round
    }
    const final = decide(item({ lowestCompetitor: competitor }), c, "amazon", DEFAULT_STRATEGY)
    expect(final.action).toBe("HOLD_ABOVE_MARKET")
    expect(final.newPrice).toBe(final.ladder!.floorPrice)
  })

  it("marks estimated costs so they are never mistaken for a real floor", () => {
    const d = decide(item(), cost({ estimated: true }), "amazon", DEFAULT_STRATEGY)
    expect(d.estimatedCost).toBe(true)
    expect(d.flags.join(" ")).toMatch(/ESTIMATED/)
  })

  it("prices at target when no usable competitor offer exists", () => {
    const d = decide(item({ lowestCompetitor: null }), cost(), "amazon", DEFAULT_STRATEGY)
    expect(d.action).toBe("NO_MARKET_DATA")
    expect(d.newPrice).toBe(d.ladder!.targetPrice)
  })

  it("raises the circuit-breaker flag on >10% market moves", () => {
    const d = decide(
      item({ currentPrice: 100.2, lowestCompetitor: 71.28 }),
      cost(),
      "amazon",
      DEFAULT_STRATEGY,
    )
    expect(d.flags.join(" ")).toMatch(/Circuit breaker/)
  })

  it("upward repricing: recovers toward target when competitors raise prices", () => {
    const strategy: StrategyConfig = { ...DEFAULT_STRATEGY }
    const cheap = decide(item({ lowestCompetitor: 95 }), cost(), "amazon", strategy)
    const raised = decide(item({ lowestCompetitor: 140 }), cost(), "amazon", strategy)
    expect(raised.newPrice!).toBeGreaterThan(cheap.newPrice!)
    expect(raised.newPrice!).toBeLessThanOrEqual(raised.ladder!.ceilingPrice)
  })
})

describe("cost CSV import", () => {
  const catalog = [item()]

  it("accepts valid rows and defaults the effective date", () => {
    const r = parseCostCsv("asin,landed_cost,outbound_shipping\nB0TESTSKU1,65,8", catalog)
    expect(r.accepted).toHaveLength(1)
    expect(r.accepted[0].landedCost).toBe(65)
    expect(r.accepted[0].estimated).toBe(false)
  })

  it("rejects negative costs", () => {
    const r = parseCostCsv("B0TESTSKU1,-5,8", catalog)
    expect(r.accepted).toHaveLength(0)
    expect(r.rejected).toHaveLength(1)
  })

  it("warns when cost exceeds the current selling price", () => {
    const r = parseCostCsv("B0TESTSKU1,150,8", catalog)
    expect(r.accepted).toHaveLength(1)
    expect(r.warnings).toHaveLength(1)
  })

  it("reports unmatched SKUs instead of silently skipping", () => {
    const r = parseCostCsv("B0NOTINCAT,65,8", catalog)
    expect(r.unmatched).toEqual(["B0NOTINCAT"])
  })
})
