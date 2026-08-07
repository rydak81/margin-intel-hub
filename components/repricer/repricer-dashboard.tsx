"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Crown,
  DollarSign,
  FileUp,
  ShieldAlert,
  Percent,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"

import { SEED_CATALOG, summarizeCatalog } from "@/lib/repricer/catalog"
import { decide, DEFAULT_STRATEGY, pricingInputsFor } from "@/lib/repricer/decision"
import { estimateCost, parseCostCsv } from "@/lib/repricer/costs"
import {
  describeTiers,
  FEE_SCHEDULES,
  feesFor,
  MARKETPLACE_LABELS,
  MARKETPLACES,
  type FeeOverrides,
} from "@/lib/repricer/fees"
import {
  computeLadder,
  effectiveReferralRateAt,
  marginAtPrice,
  profitAtPrice,
  referralFeeAt,
} from "@/lib/repricer/pricing"
import type {
  CatalogItem,
  CostRecord,
  Decision,
  Marketplace,
  StrategyConfig,
} from "@/lib/repricer/types"

const COSTS_KEY = "repricer.costs.v1"
const STRATEGY_KEY = "repricer.strategy.v1"
const FEES_KEY = "repricer.fees.v1"

const fmt = (n: number | null | undefined, dash = "—") =>
  n === null || n === undefined || !Number.isFinite(n) ? dash : `$${n.toFixed(2)}`
const pct = (n: number | null | undefined, dash = "—") =>
  n === null || n === undefined || !Number.isFinite(n) ? dash : `${(n * 100).toFixed(1)}%`

const ACTION_META: Record<
  Decision["action"],
  { label: string; className: string }
> = {
  REPRICE: {
    label: "Reprice",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  HOLD_ABOVE_MARKET: {
    label: "Hold above market",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  EXCLUDED_NO_COST: {
    label: "Needs cost",
    className: "border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300",
  },
  NO_MARKET_DATA: {
    label: "No market data",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
}

export function RepricerDashboard() {
  const [marketplace, setMarketplace] = useState<Marketplace>("amazon")
  const [strategy, setStrategy] = useState<StrategyConfig>(DEFAULT_STRATEGY)
  const [costs, setCosts] = useState<Record<string, CostRecord>>({})
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedAsin, setSelectedAsin] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [feesOpen, setFeesOpen] = useState(false)
  const [feeOverrides, setFeeOverrides] = useState<FeeOverrides>({})
  const [importText, setImportText] = useState("")
  const [importReport, setImportReport] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const c = localStorage.getItem(COSTS_KEY)
      if (c) setCosts(JSON.parse(c))
      const s = localStorage.getItem(STRATEGY_KEY)
      if (s) setStrategy({ ...DEFAULT_STRATEGY, ...JSON.parse(s) })
      const f = localStorage.getItem(FEES_KEY)
      if (f) setFeeOverrides(JSON.parse(f))
    } catch {
      // corrupted local state — fall back to defaults
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(COSTS_KEY, JSON.stringify(costs))
  }, [costs, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(STRATEGY_KEY, JSON.stringify(strategy))
  }, [strategy, hydrated])
  useEffect(() => {
    if (hydrated) localStorage.setItem(FEES_KEY, JSON.stringify(feeOverrides))
  }, [feeOverrides, hydrated])

  const decisions = useMemo(() => {
    const map = new Map<string, Decision>()
    for (const it of SEED_CATALOG) {
      map.set(it.asin, decide(it, costs[it.asin] ?? null, marketplace, strategy, feeOverrides))
    }
    return map
  }, [costs, marketplace, strategy, feeOverrides])

  const summary = useMemo(() => summarizeCatalog(SEED_CATALOG), [])
  const counts = useMemo(() => {
    const c = { REPRICE: 0, HOLD_ABOVE_MARKET: 0, EXCLUDED_NO_COST: 0, NO_MARKET_DATA: 0 }
    decisions.forEach((d) => c[d.action]++)
    return c
  }, [decisions])

  const categories = useMemo(
    () => Array.from(new Set(SEED_CATALOG.map((i) => i.category))),
    [],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SEED_CATALOG.filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false
      const d = decisions.get(i.asin)!
      if (actionFilter !== "all" && d.action !== actionFilter) return false
      if (q && !i.title.toLowerCase().includes(q) && !i.asin.toLowerCase().includes(q))
        return false
      return true
    })
  }, [categoryFilter, actionFilter, search, decisions])

  const selected = selectedAsin
    ? SEED_CATALOG.find((i) => i.asin === selectedAsin) ?? null
    : null

  const loadEstimates = () => {
    const today = new Date().toISOString().slice(0, 10)
    const next = { ...costs }
    for (const it of SEED_CATALOG) {
      if (next[it.asin] && !next[it.asin].estimated) continue // keep real costs
      const est = estimateCost(it, today)
      if (est) next[it.asin] = est
    }
    setCosts(next)
  }

  const runImport = () => {
    const result = parseCostCsv(importText, SEED_CATALOG)
    const next = { ...costs }
    for (const rec of result.accepted) next[rec.asin] = rec
    setCosts(next)
    const report: string[] = [`Imported ${result.accepted.length} cost record(s).`]
    for (const r of result.rejected) report.push(`Rejected line ${r.line}: ${r.reason}`)
    for (const w of result.warnings) report.push(`Warning ${w.asin}: ${w.message}`)
    if (result.unmatched.length)
      report.push(`Unmatched ASINs (not in catalog): ${result.unmatched.join(", ")}`)
    setImportReport(report)
  }

  const kpis = [
    {
      icon: Crown,
      label: "Buy Box win rate",
      value: `${summary.buyboxWins}/${summary.totalSkus}`,
      sub: pct(summary.buyboxWinRate),
    },
    {
      icon: ArrowUp,
      label: "Priced above market",
      value: `${summary.pricedAboveMarket}`,
      sub: `median gap ${pct(summary.medianGapPct)}`,
    },
    {
      icon: Target,
      label: "Repriceable now",
      value: `${counts.REPRICE}`,
      sub: "inside margin band",
    },
    {
      icon: ShieldAlert,
      label: "Market below floor",
      value: `${counts.HOLD_ABOVE_MARKET}`,
      sub: "hold — can't compete profitably",
    },
    {
      icon: AlertTriangle,
      label: "Missing cost data",
      value: `${counts.EXCLUDED_NO_COST}`,
      sub: "excluded from repricing",
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
              <k.icon className="h-4 w-4 text-sky-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                {k.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Strategy + cost controls */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-1.5">
              <Label className="text-xs">Marketplace</Label>
              <Select value={marketplace} onValueChange={(v) => setMarketplace(v as Marketplace)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {MARKETPLACE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              label="Target margin %"
              value={strategy.targetMargin * 100}
              onChange={(v) => setStrategy({ ...strategy, targetMargin: v / 100 })}
              step={0.5}
            />
            <NumberField
              label="Floor margin %"
              value={strategy.floorMargin * 100}
              onChange={(v) => setStrategy({ ...strategy, floorMargin: v / 100 })}
              step={0.5}
            />
            <NumberField
              label="Proximity %"
              value={strategy.proximityTarget * 100}
              onChange={(v) => setStrategy({ ...strategy, proximityTarget: v / 100 })}
              step={0.5}
            />
            <NumberField
              label="Return reserve %"
              value={strategy.returnReserveRate * 100}
              onChange={(v) => setStrategy({ ...strategy, returnReserveRate: v / 100 })}
              step={0.5}
            />
            <NumberField
              label="ACoS %"
              value={strategy.acosRate * 100}
              onChange={(v) => setStrategy({ ...strategy, acosRate: v / 100 })}
              step={0.5}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Fee rates are placeholders per marketplace/category and must be verified against
            current published schedules before acting on any price. Dry-run only — this tool
            never submits price changes.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <Button size="sm" variant="outline" onClick={loadEstimates}>
            <Sparkles className="mr-2 h-4 w-4" />
            Load estimated costs
          </Button>
          <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Import cost CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFeesOpen(true)}>
            <Percent className="mr-2 h-4 w-4" />
            Edit platform fees
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => setCosts({})}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all costs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search title or ASIN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-64"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="REPRICE">Reprice</SelectItem>
            <SelectItem value="HOLD_ABOVE_MARKET">Hold above market</SelectItem>
            <SelectItem value="EXCLUDED_NO_COST">Needs cost</SelectItem>
            <SelectItem value="NO_MARKET_DATA">No market data</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {rows.length} of {SEED_CATALOG.length} SKUs
        </span>
      </div>

      {/* Catalog table */}
      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/84 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">Market low</TableHead>
              <TableHead className="text-right">Gap</TableHead>
              <TableHead className="text-right">Floor</TableHead>
              <TableHead className="text-right">Target</TableHead>
              <TableHead className="text-right">Recommended</TableHead>
              <TableHead className="text-right">Margin @ rec</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((it) => {
              const d = decisions.get(it.asin)!
              const gap =
                it.currentPrice !== null && it.lowestCompetitor !== null
                  ? (it.currentPrice - it.lowestCompetitor) / it.lowestCompetitor
                  : null
              const meta = ACTION_META[d.action]
              const delta =
                d.newPrice !== null && it.currentPrice !== null
                  ? d.newPrice - it.currentPrice
                  : null
              return (
                <TableRow
                  key={it.asin}
                  className="cursor-pointer"
                  onClick={() => setSelectedAsin(it.asin)}
                >
                  <TableCell className="max-w-[340px]">
                    <div className="flex items-center gap-2">
                      {it.hasBuybox && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{it.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {it.asin} · {it.category}
                          {it.monthlySalesBand ? ` · ${it.monthlySalesBand}/mo` : ""}
                          {d.estimatedCost ? " · est. cost" : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(it.currentPrice)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmt(it.lowestCompetitor)}</TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      gap !== null && gap > 0.2
                        ? "text-red-600 dark:text-red-400"
                        : gap !== null && gap > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {pct(gap)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmt(d.ladder?.floorPrice ?? null)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmt(d.ladder?.targetPrice ?? null)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    <span className="inline-flex items-center gap-1">
                      {delta !== null &&
                        (delta < -0.005 ? (
                          <ArrowDown className="h-3 w-3 text-red-500" />
                        ) : delta > 0.005 ? (
                          <ArrowUp className="h-3 w-3 text-emerald-500" />
                        ) : null)}
                      {fmt(d.newPrice)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(d.marginAtNewPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={meta.className}>
                      {meta.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* SKU analyzer */}
      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelectedAsin(null)}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] sm:max-w-4xl lg:max-w-5xl overflow-y-auto">
          {selected && (
            <SkuAnalyzer
              item={selected}
              cost={costs[selected.asin] ?? null}
              marketplace={marketplace}
              strategy={strategy}
              feeOverrides={feeOverrides}
              onCostChange={(rec) =>
                setCosts((prev) => {
                  const next = { ...prev }
                  if (rec) next[selected.asin] = rec
                  else delete next[selected.asin]
                  return next
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Fee schedule editor */}
      <Dialog open={feesOpen} onOpenChange={setFeesOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] sm:max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Platform fee schedules</DialogTitle>
            <DialogDescription>
              Rates change quickly and often — Walmart cut 14 categories in June 2026 with
              little notice. Edit any rate the moment a platform changes it; every floor,
              target, and decision recomputes instantly. Edits persist in this browser.
            </DialogDescription>
          </DialogHeader>
          <FeeEditor overrides={feeOverrides} onChange={setFeeOverrides} />
        </DialogContent>
      </Dialog>

      {/* Cost import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import landed costs</DialogTitle>
            <DialogDescription>
              Paste CSV with columns: asin, landed_cost, outbound_shipping, effective_date
              (optional). Landed cost = purchase + inbound freight + refurb parts + labor.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={8}
            placeholder={"asin,landed_cost,outbound_shipping\nB08264XHCZ,65.00,8.00"}
            className="font-mono text-xs"
          />
          <div className="flex items-center gap-2">
            <Button onClick={runImport}>Import</Button>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>
              Close
            </Button>
          </div>
          {importReport.length > 0 && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs">
              {importReport.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  step?: number
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        className="h-9"
        step={step}
        value={Number.isFinite(value) ? Number(value.toFixed(2)) : 0}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (Number.isFinite(v)) onChange(v)
        }}
      />
    </div>
  )
}

function SkuAnalyzer({
  item,
  cost,
  marketplace,
  strategy,
  feeOverrides,
  onCostChange,
}: {
  item: CatalogItem
  cost: CostRecord | null
  marketplace: Marketplace
  strategy: StrategyConfig
  feeOverrides: FeeOverrides
  onCostChange: (rec: CostRecord | null) => void
}) {
  const [landed, setLanded] = useState(cost?.landedCost ?? 0)
  const [shipping, setShipping] = useState(cost?.outboundShipping ?? 0)

  useEffect(() => {
    setLanded(cost?.landedCost ?? 0)
    setShipping(cost?.outboundShipping ?? 0)
  }, [cost, item.asin])

  const workingCost: CostRecord | null =
    landed > 0
      ? {
          asin: item.asin,
          landedCost: landed,
          outboundShipping: shipping,
          effectiveDate: cost?.effectiveDate ?? new Date().toISOString().slice(0, 10),
          estimated: cost?.estimated ?? false,
        }
      : null

  const decision = decide(item, workingCost, marketplace, strategy, feeOverrides)
  const meta = ACTION_META[decision.action]
  const fees = feesFor(marketplace, item.category, feeOverrides)
  const inputs = workingCost
    ? pricingInputsFor(item, workingCost, marketplace, strategy, feeOverrides)
    : null

  const saveCost = () => onCostChange(workingCost && { ...workingCost, estimated: false })

  return (
    <div>
      <DialogHeader>
        <DialogTitle className="pr-8 text-lg leading-snug">{item.title}</DialogTitle>
        <DialogDescription>
          {item.asin} · {item.category} · {item.competingSellers ?? "?"} competing sellers ·{" "}
          Buy Box: {item.buyboxHolder ?? "unknown"} {item.hasBuybox ? "(us)" : ""}
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-5">
        {/* Cost editor */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-sky-600" />
            <h4 className="text-sm font-semibold">Landed cost (COGS)</h4>
            {workingCost?.estimated && (
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-700 dark:text-amber-300"
              >
                Estimated
              </Badge>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Landed cost $" value={landed} onChange={setLanded} step={1} />
            <NumberField label="Outbound shipping $" value={shipping} onChange={setShipping} step={0.5} />
            <div className="flex items-end">
              <Button size="sm" onClick={saveCost} disabled={landed <= 0}>
                Save as real cost
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Purchase price + inbound freight + refurb parts + refurb labor. Changing values here
            recomputes everything below live.
          </p>
        </div>

        {/* Decision breakdown */}
        <div className="rounded-xl border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold">Decision — {MARKETPLACE_LABELS[marketplace]}</h4>
            <Badge variant="outline" className={meta.className}>
              {meta.label}
            </Badge>
          </div>
          {decision.ladder && inputs ? (
            <div className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              <Row k="Referral rate" v={describeTiers(fees.tiers)} />
              <Row
                k="Referral fee @ recommended"
                v={
                  decision.newPrice !== null
                    ? `${fmt(referralFeeAt(fees.tiers, decision.newPrice))} (${pct(
                        effectiveReferralRateAt(fees.tiers, decision.newPrice),
                      )} eff.)`
                    : "—"
                }
              />
              <Row k="Fixed fees" v={fmt(fees.fixedFees)} />
              <Row k="ACoS" v={pct(strategy.acosRate)} />
              <Row k="Return reserve" v={pct(strategy.returnReserveRate)} />
              <Row k="Variable rate (total)" v={pct(decision.ladder.variableRate)} />
              <Row k="Fixed costs (total)" v={fmt(decision.ladder.fixedCosts)} />
              <Row k="Floor price" v={fmt(decision.ladder.floorPrice)} strong />
              <Row k="Target price" v={fmt(decision.ladder.targetPrice)} strong />
              <Row k="Ceiling price" v={fmt(decision.ladder.ceilingPrice)} />
              <Row k="Market low" v={fmt(item.lowestCompetitor)} />
              <Row k="Competitive price" v={fmt(decision.competitivePrice)} />
              <Row k="Recommended price" v={fmt(decision.newPrice)} strong />
              <Row k="Margin @ recommended" v={pct(decision.marginAtNewPrice)} strong />
              <Row
                k="Profit @ recommended"
                v={
                  decision.newPrice !== null && inputs
                    ? fmt(profitAtPrice(inputs, decision.newPrice))
                    : "—"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter a landed cost above to compute the floor, target, and repricing decision.
              SKUs without cost data are excluded from repricing — guessing a floor is worse
              than not repricing.
            </p>
          )}
          {decision.flags.length > 0 && (
            <div className="mt-3 space-y-1">
              {decision.flags.map((f, i) => (
                <p
                  key={i}
                  className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {f}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Cross-platform comparison */}
        {workingCost && (
          <div className="rounded-xl border p-4">
            <h4 className="mb-3 text-sm font-semibold">
              Platform comparison at this landed cost
            </h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Referral</TableHead>
                    <TableHead className="text-right">Floor</TableHead>
                    <TableHead className="text-right">Target</TableHead>
                    <TableHead className="text-right">Margin @ market low</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MARKETPLACES.map((m) => {
                    const f = feesFor(m, item.category, feeOverrides)
                    const inp = pricingInputsFor(item, workingCost, m, strategy, feeOverrides)
                    let ladder = null
                    try {
                      ladder = computeLadder(
                        inp,
                        {
                          floorMargin: strategy.floorMargin,
                          targetMargin: strategy.targetMargin,
                          ceilingMultiplier: strategy.ceilingMultiplier,
                          marketHigh: item.buyboxPrice,
                        },
                        item.asin,
                      )
                    } catch {
                      // unsellable at these rates — render dashes
                    }
                    const mAtLow =
                      item.lowestCompetitor !== null
                        ? marginAtPrice(inp, item.lowestCompetitor)
                        : null
                    return (
                      <TableRow key={m} className={m === marketplace ? "bg-sky-500/5" : ""}>
                        <TableCell className="font-medium">{MARKETPLACE_LABELS[m]}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {describeTiers(f.tiers)}
                          {f.fixedFees > 0 ? ` + ${fmt(f.fixedFees)}` : ""}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(ladder?.floorPrice ?? null)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(ladder?.targetPrice ?? null)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums ${
                            mAtLow !== null && mAtLow < strategy.floorMargin
                              ? "text-red-600 dark:text-red-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {pct(mAtLow)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Same landed cost across every channel's fee schedule — where the floor sits below
              the market low, the channel can win the sale profitably. Verify rates against each
              platform's own fee preview; edit them under "Edit platform fees".
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ k, v, strong = false }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-muted py-1 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={`tabular-nums ${strong ? "font-semibold" : ""}`}>{v}</span>
    </div>
  )
}

function FeeEditor({
  overrides,
  onChange,
}: {
  overrides: FeeOverrides
  onChange: (next: FeeOverrides) => void
}) {
  const categories = Object.keys(FEE_SCHEDULES.amazon) as (keyof typeof FEE_SCHEDULES.amazon)[]

  const setOverride = (
    m: Marketplace,
    c: (typeof categories)[number],
    field: "rate" | "fixedFees",
    value: number | undefined,
  ) => {
    const next: FeeOverrides = JSON.parse(JSON.stringify(overrides))
    next[m] = next[m] ?? {}
    const cell = { ...(next[m]![c] ?? {}) }
    if (value === undefined) delete cell[field]
    else cell[field] = value
    if (cell.rate === undefined && cell.fixedFees === undefined) delete next[m]![c]
    else next[m]![c] = cell
    if (Object.keys(next[m]!).length === 0) delete next[m]
    onChange(next)
  }

  return (
    <div className="space-y-4">
      {MARKETPLACES.map((m) => (
        <div key={m} className="rounded-xl border p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold">{MARKETPLACE_LABELS[m]}</h4>
            {overrides[m] && (
              <Badge variant="outline" className="border-sky-400/40 text-sky-700 dark:text-sky-300">
                customized
              </Badge>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-32 text-right">Rate %</TableHead>
                  <TableHead className="w-32 text-right">Fixed fee $</TableHead>
                  <TableHead>Schedule &amp; last verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => {
                  const base = FEE_SCHEDULES[m][c]
                  const eff = feesFor(m, c, overrides)
                  const o = overrides[m]?.[c]
                  return (
                    <TableRow key={c}>
                      <TableCell className="font-medium">{c}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step={0.1}
                          className="h-8 w-24 text-right tabular-nums"
                          value={Number(((o?.rate ?? base.tiers[0].rate) * 100).toFixed(2))}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            if (Number.isFinite(v) && v >= 0 && v < 100)
                              setOverride(m, c, "rate", v / 100)
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step={0.05}
                          className="h-8 w-24 text-right tabular-nums"
                          value={Number((o?.fixedFees ?? base.fixedFees).toFixed(2))}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            if (Number.isFinite(v) && v >= 0) setOverride(m, c, "fixedFees", v)
                          }}
                        />
                      </TableCell>
                      <TableCell className="max-w-[300px] text-xs text-muted-foreground">
                        <p>
                          {describeTiers(eff.tiers)}
                          {eff.fixedFees > 0 ? ` + $${eff.fixedFees.toFixed(2)}/order` : ""} ·
                          verified {base.lastVerified}
                        </p>
                        {base.note && <p className="text-amber-700 dark:text-amber-400">{base.note}</p>}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Editing the rate changes the first tier only; upper tiers (e.g. watches 3% above
          $1,500) keep their defaults. Tier structures themselves live in lib/repricer/fees.ts.
        </p>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onChange({})}>
          Reset all to defaults
        </Button>
      </div>
    </div>
  )
}
