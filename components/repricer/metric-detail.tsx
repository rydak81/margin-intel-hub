"use client"

// Deep-dive page for one chart: full-width interactive view of a single
// metric (price / sellers / sales) with stat tiles, zoom, strategy overlays,
// a synced data table with CSV export — and for the sales metric, an ML
// forecast with price scenarios and a P10-P90 confidence band.

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { AlertTriangle, ArrowLeft, Download } from "lucide-react"

import { SEED_CATALOG } from "@/lib/repricer/catalog"
import { decide, DEFAULT_STRATEGY } from "@/lib/repricer/decision"
import {
  forecastSales,
  type ForecastOk,
} from "@/lib/repricer/forecast"
import {
  generateSampleHistory,
  trimLeadingEmpty,
  type HistoryPoint,
} from "@/lib/repricer/history"
import type { CostRecord, PriceLadder, StrategyConfig } from "@/lib/repricer/types"
import type { FeeOverrides } from "@/lib/repricer/fees"
import { CHROME, SERIES, useDarkMode } from "./chart-theme"

export type Metric = "price" | "sellers" | "sales"

const METRIC_META: Record<Metric, { title: string; unit: string }> = {
  price: { title: "Price history", unit: "$" },
  sellers: { title: "Competing sellers", unit: "" },
  sales: { title: "Monthly sales (units)", unit: "" },
}

const RANGES = [3, 6, 12, 18, 36] as const

const fmtVal = (metric: Metric, v: number | null | undefined) =>
  v === null || v === undefined || !Number.isFinite(v)
    ? "—"
    : metric === "price"
      ? `$${v.toFixed(2)}`
      : `${Math.round(v)}`

export function MetricDetail({
  asin: initialAsin,
  metric,
  basePath = "/history",
}: {
  asin: string
  metric: Metric
  basePath?: string
}) {
  const router = useRouter()
  const [asin, setAsin] = useState(initialAsin)
  const [allPoints, setAllPoints] = useState<HistoryPoint[]>([])
  const [source, setSource] = useState<"keepa" | "sample">("sample")
  const [range, setRange] = useState<number>(18)
  const [showStrategy, setShowStrategy] = useState(true)
  const [ladder, setLadder] = useState<PriceLadder | null>(null)
  const [scenario, setScenario] = useState<"current" | "floor" | "target" | "custom">("current")
  const [customPrice, setCustomPrice] = useState(0)
  const dark = useDarkMode()
  const colors = dark ? SERIES.dark : SERIES.light
  const chrome = dark ? CHROME.dark : CHROME.light

  const item = SEED_CATALOG.find((i) => i.asin === asin) ?? SEED_CATALOG[0]

  // keep the URL shareable when switching SKUs
  useEffect(() => {
    if (asin !== initialAsin) router.replace(`${basePath}/${asin}?metric=${metric}`)
  }, [asin, initialAsin, metric, router, basePath])

  useEffect(() => {
    try {
      const costs = JSON.parse(localStorage.getItem("repricer.costs.v1") ?? "{}") as Record<
        string,
        CostRecord
      >
      const strategy = {
        ...DEFAULT_STRATEGY,
        ...JSON.parse(localStorage.getItem("repricer.strategy.v1") ?? "{}"),
      } as StrategyConfig
      const feeOverrides = JSON.parse(
        localStorage.getItem("repricer.fees.v1") ?? "{}",
      ) as FeeOverrides
      const d = decide(item, costs[asin] ?? null, "amazon", strategy, feeOverrides)
      setLadder(d.ladder)
    } catch {
      setLadder(null)
    }
  }, [asin, item])

  useEffect(() => {
    let cancelled = false
    fetch(`/api/history?asin=${asin}&months=36`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.configured && data.points) {
          setAllPoints(trimLeadingEmpty(data.points as HistoryPoint[]))
          setSource("keepa")
        } else {
          setAllPoints(generateSampleHistory(item, 36))
          setSource("sample")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAllPoints(generateSampleHistory(item, 36))
          setSource("sample")
        }
      })
    return () => {
      cancelled = true
    }
  }, [asin, item])

  const points = useMemo(() => allPoints.slice(-range), [allPoints, range])

  const metricValue = (p: HistoryPoint): number | null =>
    metric === "price" ? p.buyBoxPrice : metric === "sellers" ? p.offerCount : p.monthlySold

  // ---- stat tiles ----
  const values = points.map(metricValue).filter((v): v is number => v !== null)
  const latest = [...points].reverse().find((p) => metricValue(p) !== null)
  const latestVal = latest ? metricValue(latest) : null
  const changeOver = (monthsBack: number): number | null => {
    const past = points[points.length - 1 - monthsBack]
    const pv = past ? metricValue(past) : null
    return latestVal !== null && pv !== null && pv !== 0 ? (latestVal - pv) / pv : null
  }
  const minIdx = values.length ? values.indexOf(Math.min(...values)) : -1
  const maxIdx = values.length ? values.indexOf(Math.max(...values)) : -1
  const withVals = points.filter((p) => metricValue(p) !== null)
  const monthsBelowFloor =
    metric === "price" && ladder
      ? points.filter((p) => p.buyBoxPrice !== null && p.buyBoxPrice < ladder.floorPrice).length
      : null

  // ---- forecast (sales metric, live data only) ----
  const scenarioPrice =
    scenario === "current"
      ? (item.currentPrice ?? ladder?.targetPrice ?? 0)
      : scenario === "floor"
        ? (ladder?.floorPrice ?? 0)
        : scenario === "target"
          ? (ladder?.targetPrice ?? 0)
          : customPrice

  const forecast = useMemo(() => {
    if (metric !== "sales" || source !== "keepa" || !(scenarioPrice > 0)) return null
    return forecastSales(allPoints, { scenarioPrice, seed: 42, simulations: 8000 })
  }, [metric, source, allPoints, scenarioPrice])

  // ---- chart rows (history + optional forecast extension) ----
  const chartRows = useMemo(() => {
    const rows: Record<string, unknown>[] = points.map((p) => ({
      month: p.month,
      value: metricValue(p),
      lowest: metric === "price" ? p.lowestOffer : undefined,
      ourPrice: metric === "price" && source === "sample" ? p.ourPrice : undefined,
    }))
    if (forecast?.ok) {
      for (const m of forecast.months) {
        rows.push({
          month: m.month,
          forecastP50: m.unitsP50,
          band: [m.unitsP10, m.unitsP90],
        })
      }
    }
    return rows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, forecast, metric, source])

  const exportCsv = () => {
    const header = `month,${metric}${metric === "price" ? ",lowest_offer" : ""},mom_change_pct\n`
    const lines = withVals.map((p, i) => {
      const v = metricValue(p)!
      const prev = i > 0 ? metricValue(withVals[i - 1]) : null
      const mom = prev ? (((v - prev) / prev) * 100).toFixed(1) : ""
      return `${p.month},${v}${metric === "price" ? `,${p.lowestOffer ?? ""}` : ""},${mom}`
    })
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${asin}-${metric}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const pct = (v: number | null) =>
    v === null ? "—" : `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header row: back, SKU, metric tabs, source */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All charts
        </Link>
        <Select value={asin} onValueChange={setAsin}>
          <SelectTrigger className="h-9 w-[380px] max-w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEED_CATALOG.map((i) => (
              <SelectItem key={i.asin} value={i.asin}>
                {i.title.length > 55 ? `${i.title.slice(0, 55)}…` : i.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          {(Object.keys(METRIC_META) as Metric[]).map((m) => (
            <Link
              key={m}
              href={`${basePath}/${asin}?metric=${m}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                m === metric
                  ? "bg-sky-500/10 font-medium text-sky-700 dark:text-sky-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              {METRIC_META[m].title}
            </Link>
          ))}
        </div>
        {source === "sample" ? (
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Sample data
          </Badge>
        ) : (
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
            Live · Keepa
          </Badge>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Tile label="Current" value={fmtVal(metric, latestVal)} />
        <Tile label="3-month change" value={pct(changeOver(3))} />
        <Tile label="12-month change" value={pct(changeOver(12))} />
        <Tile
          label="Low / High"
          value={
            values.length
              ? `${fmtVal(metric, Math.min(...values))} / ${fmtVal(metric, Math.max(...values))}`
              : "—"
          }
          sub={
            minIdx >= 0 && maxIdx >= 0
              ? `${withVals[minIdx]?.month ?? ""} · ${withVals[maxIdx]?.month ?? ""}`
              : undefined
          }
        />
        {monthsBelowFloor !== null ? (
          <Tile
            label="Months below floor"
            value={`${monthsBelowFloor}`}
            sub="Buy Box under your floor"
            warn={monthsBelowFloor > 0}
          />
        ) : (
          <Tile label="Months of data" value={`${withVals.length}`} />
        )}
      </div>

      {/* Range + overlays + export */}
      <div className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? "default" : "outline"}
            className="h-8 px-3"
            onClick={() => setRange(r)}
          >
            {r === 36 ? "All" : `${r}M`}
          </Button>
        ))}
        {metric === "price" && (
          <Button
            size="sm"
            variant={showStrategy ? "default" : "outline"}
            className="h-8 px-3"
            onClick={() => setShowStrategy((v) => !v)}
          >
            Floor / Target
          </Button>
        )}
        <Button size="sm" variant="outline" className="h-8 px-3" onClick={exportCsv}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          CSV
        </Button>
      </div>

      {/* The chart */}
      <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <div className="h-[440px]">
          <ResponsiveContainer>
            <ComposedChart data={chartRows} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid stroke={chrome.grid} strokeWidth={1} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: chrome.axis }}
                tickLine={false}
                axisLine={{ stroke: chrome.grid }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: chrome.axis }}
                tickLine={false}
                axisLine={false}
                width={52}
                allowDecimals={false}
                tickFormatter={(v: number) => (metric === "price" ? `$${v}` : `${v}`)}
                domain={
                  metric === "price"
                    ? [
                        (dataMin: number) =>
                          Number.isFinite(dataMin) ? Math.floor((dataMin * 0.96) / 5) * 5 : 0,
                        (dataMax: number) =>
                          Number.isFinite(dataMax) ? Math.ceil((dataMax * 1.03) / 5) * 5 : 1,
                      ]
                    : [0, "auto"]
                }
              />
              <Tooltip
                formatter={(value, name) => {
                  if (Array.isArray(value))
                    return [`${value[0]} – ${value[1]}`, "P10–P90 band"]
                  return [
                    metric === "price" ? `$${Number(value).toFixed(2)}` : `${value}`,
                    String(name),
                  ]
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              {metric === "price" && showStrategy && ladder && (
                <ReferenceLine
                  y={ladder.floorPrice}
                  stroke={chrome.floor}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: `Floor $${ladder.floorPrice.toFixed(2)}`,
                    position: "insideBottomLeft",
                    fontSize: 11,
                    fill: chrome.floor,
                  }}
                />
              )}
              {metric === "price" && showStrategy && ladder && (
                <ReferenceLine
                  y={ladder.targetPrice}
                  stroke={chrome.target}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: `Target $${ladder.targetPrice.toFixed(2)}`,
                    position: "insideTopRight",
                    fontSize: 11,
                    fill: chrome.target,
                  }}
                />
              )}
              {metric === "price" && source === "keepa" && item.currentPrice !== null && (
                <ReferenceLine
                  y={item.currentPrice}
                  stroke={colors.our}
                  strokeDasharray="2 4"
                  strokeWidth={2}
                  ifOverflow="extendDomain"
                  label={{
                    value: `Our price $${item.currentPrice.toFixed(2)}`,
                    position: "insideTopLeft",
                    fontSize: 11,
                    fill: colors.our,
                  }}
                />
              )}
              {forecast?.ok && (
                <Area
                  dataKey="band"
                  name="P10–P90 band"
                  stroke="none"
                  fill={colors.our}
                  fillOpacity={0.18}
                  connectNulls={false}
                />
              )}
              {metric === "sales" ? (
                <Bar dataKey="value" name="Units sold" fill={colors.our} radius={[4, 4, 0, 0]} maxBarSize={22} />
              ) : (
                <Line
                  type={metric === "sellers" ? "stepAfter" : "monotone"}
                  dataKey="value"
                  name={metric === "sellers" ? "Sellers" : "Buy Box"}
                  stroke={metric === "price" ? colors.buyBox : colors.our}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
              {metric === "price" && (
                <Line
                  type="monotone"
                  dataKey="lowest"
                  name="Lowest offer"
                  stroke={colors.lowest}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
              {metric === "price" && source === "sample" && (
                <Line
                  type="monotone"
                  dataKey="ourPrice"
                  name="Our price"
                  stroke={colors.our}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
              {forecast?.ok && (
                <Line
                  type="monotone"
                  dataKey="forecastP50"
                  name="Forecast P50"
                  stroke={colors.buyBox}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={false}
                  connectNulls={false}
                />
              )}
              <Brush
                key={`${asin}-${metric}-${range}`}
                dataKey="month"
                height={26}
                travellerWidth={8}
                stroke={chrome.axis}
                fill="transparent"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag the handles under the chart to zoom; drag the window to pan.
        </p>
      </div>

      {/* Forecast controls (sales metric) */}
      {metric === "sales" && (
        <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <h3 className="text-sm font-semibold">Sales forecast — next 12 months</h3>
          {source !== "keepa" ? (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Forecasting needs real sales history — it is disabled on sample data. Set
              KEEPA_API_KEY to enable it.
            </p>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Price scenario:</span>
                {(
                  [
                    ["current", `Current ${item.currentPrice ? `$${item.currentPrice.toFixed(2)}` : ""}`],
                    ["floor", `Floor ${ladder ? `$${ladder.floorPrice.toFixed(2)}` : "(needs cost)"}`],
                    ["target", `Target ${ladder ? `$${ladder.targetPrice.toFixed(2)}` : "(needs cost)"}`],
                    ["custom", "Custom"],
                  ] as const
                ).map(([key, label]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={scenario === key ? "default" : "outline"}
                    className="h-8 px-3"
                    disabled={(key === "floor" || key === "target") && !ladder}
                    onClick={() => setScenario(key)}
                  >
                    {label}
                  </Button>
                ))}
                {scenario === "custom" && (
                  <Input
                    type="number"
                    className="h-8 w-28"
                    placeholder="$"
                    value={customPrice || ""}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      if (Number.isFinite(v) && v >= 0) setCustomPrice(v)
                    }}
                  />
                )}
              </div>
              {forecast === null ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Pick a price scenario to forecast.
                </p>
              ) : !forecast.ok ? (
                <p className="mt-3 flex items-start gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {forecast.reason}
                </p>
              ) : (
                <ForecastSummary forecast={forecast} />
              )}
            </>
          )}
        </div>
      )}

      {/* Data table */}
      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/84 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">{METRIC_META[metric].title}</TableHead>
              {metric === "price" && <TableHead className="text-right">Lowest offer</TableHead>}
              <TableHead className="text-right">MoM change</TableHead>
              {metric === "price" && ladder && (
                <TableHead className="text-right">vs. floor</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...withVals].reverse().map((p, revIdx) => {
              const i = withVals.length - 1 - revIdx
              const v = metricValue(p)!
              const prev = i > 0 ? metricValue(withVals[i - 1]) : null
              const mom = prev !== null && prev !== 0 ? (v - prev) / prev : null
              return (
                <TableRow key={p.month}>
                  <TableCell className="font-medium tabular-nums">{p.month}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtVal(metric, v)}</TableCell>
                  {metric === "price" && (
                    <TableCell className="text-right tabular-nums">
                      {fmtVal(metric, p.lowestOffer)}
                    </TableCell>
                  )}
                  <TableCell
                    className={`text-right tabular-nums ${
                      mom === null
                        ? ""
                        : mom > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : mom < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                    }`}
                  >
                    {pct(mom)}
                  </TableCell>
                  {metric === "price" && ladder && (
                    <TableCell
                      className={`text-right tabular-nums ${
                        v < ladder.floorPrice ? "text-red-600 dark:text-red-400" : ""
                      }`}
                    >
                      {`${v >= ladder.floorPrice ? "+" : ""}$${(v - ladder.floorPrice).toFixed(2)}`}
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function Tile({
  label,
  value,
  sub,
  warn = false,
}: {
  label: string
  value: string
  sub?: string
  warn?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold ${warn ? "text-red-600 dark:text-red-400" : "text-slate-950 dark:text-white"}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function ForecastSummary({ forecast }: { forecast: ForecastOk }) {
  const total = forecast.months.reduce((a, m) => a + m.unitsP50, 0)
  const totalLo = forecast.months.reduce((a, m) => a + m.unitsP10, 0)
  const totalHi = forecast.months.reduce((a, m) => a + m.unitsP90, 0)
  const revenue = forecast.months.reduce((a, m) => a + m.revenueP50, 0)
  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm">
        At <strong>${forecast.scenarioPrice.toFixed(2)}</strong>, expect about{" "}
        <strong>{Math.round(total)} units</strong> over the next 12 months (80% band:{" "}
        {Math.round(totalLo)}–{Math.round(totalHi)}), ≈{" "}
        <strong>${revenue.toLocaleString()}</strong> revenue at P50. Elasticity{" "}
        {forecast.elasticity}{" "}
        {forecast.elasticitySource === "sku"
          ? `(fitted from ${forecast.observationCount} months, R² ${forecast.elasticityR2})`
          : "(category prior — not fitted from this SKU)"}
        .
      </p>
      {forecast.notes.map((n, i) => (
        <p key={i} className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {n}
        </p>
      ))}
      <p className="text-xs text-muted-foreground">
        Forecast = damped trend + calendar seasonality + price elasticity, with an 8,000-run
        Monte Carlo band from historical residuals. The shaded region on the chart is the
        P10–P90 range — always read the band, not the line.
      </p>
    </div>
  )
}
