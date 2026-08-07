import { describe, expect, it } from "vitest"

import {
  computeLadder,
  marginAtPrice,
  priceForMargin,
  referralFeeAt,
  UnsellableSkuError,
} from "./pricing"
import { feesFor } from "./fees"
import { clampToGuardrails } from "./guardrails"
import { decide, DEFAULT_STRATEGY } from "./decision"
import { parseCostCsv } from "./costs"
import type { CatalogItem, CostRecord, PricingInputs, StrategyConfig } from "./types"

// The worked example from the spec — the first unit test the engine must pass.
const workedExample: PricingInputs = {
  landedCost: 65.0,
  outboundShipping: 8.0,
  fixedFees: 0.3,
  referralTiers: [{ upTo: null, rate: 0.08 }],
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
    const impossible: PricingInputs = {
      ...workedExample,
      referralTiers: [{ upTo: null, rate: 0.9 }],
    }
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

describe("tiered referral rates (e.g. Amazon watches 16% to $1,500, then 3%)", () => {
  const tiers = [
    { upTo: 1500, rate: 0.16 },
    { upTo: null, rate: 0.03 },
  ]
  const watch = (landedCost: number): PricingInputs => ({
    landedCost,
    outboundShipping: 5,
    fixedFees: 0,
    referralTiers: tiers,
    acosRate: 0,
    returnReserveRate: 0.06,
  })

  it("computes marginal fees correctly across the boundary", () => {
    expect(referralFeeAt(tiers, 1000)).toBeCloseTo(160, 6)
    expect(referralFeeAt(tiers, 1500)).toBeCloseTo(240, 6)
    // $2,000: 16% of 1,500 + 3% of the 500 above = 240 + 15
    expect(referralFeeAt(tiers, 2000)).toBeCloseTo(255, 6)
  })

  it("solves price(m) inside the first tier", () => {
    const price = priceForMargin(watch(126.12), 0.12, "B0WATCHLOW")
    expect(price).toBeLessThan(1500)
    // reverse: realized margin at that price is the requested margin
    expect(marginAtPrice(watch(126.12), price)).toBeCloseTo(0.12, 3)
  })

  it("solves price(m) in the upper tier for high-cost SKUs", () => {
    const price = priceForMargin(watch(1400), 0.12, "B0WATCHHIGH")
    expect(price).toBeGreaterThan(1500)
    expect(marginAtPrice(watch(1400), price)).toBeCloseTo(0.12, 3)
  })

  it("is continuous at the tier boundary", () => {
    const justBelow = referralFeeAt(tiers, 1499.99)
    const justAbove = referralFeeAt(tiers, 1500.01)
    expect(justAbove - justBelow).toBeLessThan(0.01)
  })
})

describe("fee overrides", () => {
  it("replaces the first-tier rate and keeps upper tiers", () => {
    const base = feesFor("amazon", "Apple Watch")
    expect(base.tiers[0].rate).toBeCloseTo(0.16, 6)
    const overridden = feesFor("amazon", "Apple Watch", {
      amazon: { "Apple Watch": { rate: 0.15 } },
    })
    expect(overridden.tiers[0].rate).toBeCloseTo(0.15, 6)
    expect(overridden.tiers[1].rate).toBeCloseTo(0.03, 6)
    expect(overridden.note).toMatch(/customized/)
  })

  it("returns base schedule untouched without overrides", () => {
    const base = feesFor("walmart", "iPad")
    expect(base.tiers).toHaveLength(1)
    expect(base.tiers[0].rate).toBeCloseTo(0.08, 6)
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

describe("price history", async () => {
  const { generateSampleHistory, keepaProductToHistory, keepaSeriesToMonthly, keepaTimeToDate, lastMonths } =
    await import("./history")

  it("converts Keepa timestamps to real dates", () => {
    // Keepa epoch offset: 21564000 minutes. 0 => 2011-01-08ish.
    const d = keepaTimeToDate(0)
    expect(d.getUTCFullYear()).toBe(2011)
  })

  it("takes the last observation per month and skips -1 gaps", () => {
    const jan = Math.floor(Date.UTC(2026, 0, 5) / 60000) - 21564000
    const janLater = Math.floor(Date.UTC(2026, 0, 20) / 60000) - 21564000
    const feb = Math.floor(Date.UTC(2026, 1, 10) / 60000) - 21564000
    const m = keepaSeriesToMonthly([jan, 10000, janLater, 12000, feb, -1])
    expect(m.get("2026-01")).toBe(12000)
    expect(m.has("2026-02")).toBe(false)
  })

  it("maps Keepa csv indices to monthly points in dollars", () => {
    const t = Math.floor(Date.now() / 60000) - 21564000
    const csv: (number[] | null)[] = []
    csv[1] = [t, 9999] // NEW: $99.99
    csv[11] = [t, 12] // COUNT_NEW
    csv[18] = [t, 10499] // BUY_BOX_SHIPPING: $104.99
    const points = keepaProductToHistory({ asin: "B0TESTSKU1", csv }, 3)
    const latest = points[points.length - 1]
    expect(latest.lowestOffer).toBeCloseTo(99.99, 2)
    expect(latest.buyBoxPrice).toBeCloseTo(104.99, 2)
    expect(latest.offerCount).toBe(12)
    expect(latest.ourPrice).toBeNull() // Keepa tracks the market, not our offer
  })

  it("generates deterministic, plausible sample series anchored to the snapshot", () => {
    const it1 = item()
    const a = generateSampleHistory(it1)
    const b = generateSampleHistory(it1)
    expect(a).toEqual(b) // seeded by ASIN — stable across renders
    expect(a).toHaveLength(18)
    const latest = a[a.length - 1]
    // ends near current snapshot values
    expect(Math.abs(latest.ourPrice! - it1.currentPrice!) / it1.currentPrice!).toBeLessThan(0.1)
    for (const p of a) {
      expect(p.lowestOffer!).toBeGreaterThan(0)
      expect(p.offerCount!).toBeGreaterThan(0)
    }
  })

  it("lastMonths returns consecutive month keys ending this month", () => {
    const keys = lastMonths(3, new Date(Date.UTC(2026, 7, 15)))
    expect(keys).toEqual(["2026-06", "2026-07", "2026-08"])
  })
})

describe("sourcing (reverse) math", async () => {
  const { classifyQuery, maxLandedCost, profitBuyingAt } = await import("./sourcing")
  const fees = {
    tiers: [{ upTo: null, rate: 0.08 }],
    fixedFees: 0,
    acosRate: 0,
    returnReserveRate: 0.06,
    outboundShipping: 8,
  }

  it("reverse-checks: buying at max landed cost yields exactly the target margin", () => {
    const price = 168.41 // iPad 9th Gen current Buy Box
    const max = maxLandedCost(price, fees, 0.1)
    const profit = profitBuyingAt(price, max, fees)
    expect(profit / price).toBeCloseTo(0.1, 3)
  })

  it("goes non-positive when the margin is unachievable at the price", () => {
    expect(maxLandedCost(10, fees, 0.5)).toBeLessThanOrEqual(0)
  })

  it("handles tiered referral fees at the known selling price", () => {
    const watchFees = {
      ...fees,
      tiers: [
        { upTo: 1500, rate: 0.16 },
        { upTo: null, rate: 0.03 },
      ],
      outboundShipping: 5,
    }
    const price = 2000 // referral = 240 + 15 = 255
    const max = maxLandedCost(price, watchFees, 0.1)
    // 2000 - 255 - (0.06+0.10)*2000 - 5 = 1420
    expect(max).toBeCloseTo(1420, 2)
    expect(profitBuyingAt(price, max, watchFees) / price).toBeCloseTo(0.1, 3)
  })

  it("classifies queries as ASIN, barcode, or search term", () => {
    expect(classifyQuery("B08264XHCZ")).toBe("asin")
    expect(classifyQuery("194252099537")).toBe("code")
    expect(classifyQuery("0194252099537")).toBe("code")
    expect(classifyQuery("iPad 9th Gen 64GB")).toBe("term")
  })
})
