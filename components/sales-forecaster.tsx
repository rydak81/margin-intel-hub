"use client"

import { useMemo, useState } from "react"
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FeeUnlockGate } from "@/components/fee-unlock-gate"
import {
  CATEGORY_SEASONALITY,
  forecastSales,
  formatMonthLabel,
  parseHistoryInput,
  type ForecastResult,
  type HistoryPoint,
} from "@/lib/sales-forecast"
import { CalendarRange, Download, FlaskConical, LineChart as LineChartIcon, Target } from "lucide-react"

// Emphasis palette: the forecast is the subject (brand sky), history is
// context (de-emphasis gray), the band is a wash of the forecast hue.
const COLOR_FORECAST = "#0284c7"
const COLOR_HISTORY = "#64748b"
const COLOR_BAND = "rgba(14, 165, 233, 0.14)"
const COLOR_GRID = "rgba(148, 163, 184, 0.22)"
const COLOR_TICK = "#94a3b8"

const MARKETPLACES = ["Amazon", "Walmart", "TikTok Shop", "eBay", "Etsy", "Shopify", "Other"]

const EXAMPLE_DATA = [
  "2024-01, 820", "2024-02, 760", "2024-03, 840", "2024-04, 910",
  "2024-05, 980", "2024-06, 950", "2024-07, 1010", "2024-08, 1090",
  "2024-09, 1060", "2024-10, 1240", "2024-11, 1780", "2024-12, 2350",
  "2025-01, 890", "2025-02, 830", "2025-03, 920", "2025-04, 1010",
  "2025-05, 1080", "2025-06, 1040", "2025-07, 1120", "2025-08, 1200",
  "2025-09, 1170", "2025-10, 1390", "2025-11, 1980", "2025-12, 2610",
].join("\n")

interface ChartRow {
  label: string
  actual?: number
  p50?: number
  band?: [number, number]
}

function fmt(n: number): string {
  return n.toLocaleString("en-US")
}

function buildChartRows(history: HistoryPoint[], result: ForecastResult): ChartRow[] {
  const rows: ChartRow[] = history.map((p) => ({
    label: formatMonthLabel(p.date),
    actual: p.units,
  }))
  // Bridge point so the forecast line and band connect to the last actual.
  const last = history[history.length - 1]
  if (rows.length > 0) {
    rows[rows.length - 1].p50 = last.units
    rows[rows.length - 1].band = [last.units, last.units]
  }
  for (const f of result.forecast) {
    rows.push({ label: formatMonthLabel(f.date), p50: f.p50, band: [f.p10, f.p90] })
  }
  return rows
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ForecastTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const row: ChartRow | undefined = payload[0]?.payload
  if (!row) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md dark:border-white/10 dark:bg-slate-900">
      <p className="font-medium text-slate-900 dark:text-white">{label}</p>
      {row.actual !== undefined && (
        <p className="mt-1 text-slate-600 dark:text-slate-300">Actual: {fmt(row.actual)} units</p>
      )}
      {row.actual === undefined && row.p50 !== undefined && (
        <>
          <p className="mt-1 text-slate-600 dark:text-slate-300">Median forecast: {fmt(row.p50)} units</p>
          {row.band && (
            <p className="text-slate-500 dark:text-slate-400">
              80% range: {fmt(row.band[0])}–{fmt(row.band[1])}
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function SalesForecaster() {
  const [rawInput, setRawInput] = useState("")
  const [category, setCategory] = useState("none")
  const [marketplace, setMarketplace] = useState("Amazon")
  const [price, setPrice] = useState(24.99)

  const parsed = useMemo(() => parseHistoryInput(rawInput), [rawInput])
  const enough = parsed.points.length >= 6

  const result = useMemo(
    () => (enough ? forecastSales(parsed.points, category) : null),
    [enough, parsed.points, category],
  )

  const chartRows = useMemo(
    () => (result ? buildChartRows(parsed.points, result) : []),
    [result, parsed.points],
  )

  const peakLabel =
    result && result.peakMonthIndex !== null
      ? result.forecast[result.peakMonthIndex].date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : null

  function downloadCsv() {
    if (!result) return
    const lines = ["month,units_p10,units_p50,units_p90,revenue_p50"]
    for (const f of result.forecast) {
      // Local calendar fields, not toISOString(): dates are local midnights,
      // and UTC conversion would shift them into the previous month for
      // viewers east of Greenwich.
      const month = `${f.date.getFullYear()}-${String(f.date.getMonth() + 1).padStart(2, "0")}`
      lines.push(`${month},${f.p10},${f.p50},${f.p90},${(f.p50 * price).toFixed(2)}`)
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sales-forecast.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/45">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sales Forecaster</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Paste your monthly units sold and get a probabilistic 12-month forecast — Holt-Winters
        exponential smoothing fitted to your history, with Monte Carlo simulation for the
        uncertainty bands. Runs entirely in your browser; your sales data never leaves this page.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <Label htmlFor="history-input" className="text-sm font-medium">
            Monthly sales history — one month per line: <code className="text-xs">2025-01, 840</code>
          </Label>
          <textarea
            id="history-input"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            rows={9}
            placeholder={"2024-01, 820\n2024-02, 760\n2024-03, 840\n…"}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setRawInput(EXAMPLE_DATA)}
              className="font-medium text-sky-600 underline underline-offset-4 hover:text-sky-700 dark:text-sky-400"
            >
              Load example data
            </button>
            <span>Accepts &quot;Jan 2025&quot;, &quot;2025-01&quot;, or &quot;01/2025&quot;. Export this from Seller Central → Business Reports.</span>
          </div>
          {parsed.skipped.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
              Skipped {parsed.skipped.length} unreadable line{parsed.skipped.length > 1 ? "s" : ""}:{" "}
              {parsed.skipped.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fc-category" className="text-sm font-medium">Product category</Label>
            <select
              id="fc-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
            >
              {Object.entries(CATEGORY_SEASONALITY).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Used for seasonal shape only when your history is under 2 years.
            </p>
          </div>
          <div>
            <Label htmlFor="fc-marketplace" className="text-sm font-medium">Marketplace</Label>
            <select
              id="fc-marketplace"
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/45 dark:text-white"
            >
              {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="fc-price" className="text-sm font-medium">Average selling price</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <Input
                id="fc-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
                className="h-11 rounded-xl pl-7"
              />
            </div>
          </div>
        </div>
      </div>

      {!enough && rawInput.trim() && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {parsed.points.length} month{parsed.points.length === 1 ? "" : "s"} parsed — at least 6
          are needed to fit a forecast (24+ lets the model learn your seasonality directly).
        </p>
      )}

      {result && (
        <>
          {/* KPI row */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <LineChartIcon className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-wide">Next 12 months</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {fmt(result.totalNext12.p50)} units
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                80% range {fmt(result.totalNext12.p10)}–{fmt(result.totalNext12.p90)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Target className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-wide">Projected revenue</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                ${fmt(Math.round(result.totalNext12.p50 * price))}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">at ${price.toFixed(2)} ASP, median path</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <CalendarRange className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-wide">Peak month</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{peakLabel ?? "—"}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">plan inventory 60–90 days ahead</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <FlaskConical className="h-3.5 w-3.5" />
                <p className="text-xs font-medium uppercase tracking-wide">Backtest error</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {result.backtestMape !== null ? `±${result.backtestMape.toFixed(0)}%` : "—"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {result.backtestMape !== null
                  ? "typical monthly error on your held-out data"
                  : "needs 16+ months to measure"}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-5 rounded" style={{ backgroundColor: COLOR_HISTORY }} />
              Your history
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-5 rounded" style={{ backgroundColor: COLOR_FORECAST }} />
              Median forecast
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-5 rounded-sm" style={{ backgroundColor: COLOR_BAND }} />
              80% probability band
            </span>
          </div>

          <div className="mt-3 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartRows} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
                <CartesianGrid stroke={COLOR_GRID} strokeWidth={1} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: COLOR_TICK, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: COLOR_GRID }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                />
                <YAxis
                  tick={{ fill: COLOR_TICK, fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                  width={56}
                />
                <Tooltip content={<ForecastTooltip />} />
                <Area
                  dataKey="band"
                  stroke="none"
                  fill={COLOR_BAND}
                  fillOpacity={1}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  dataKey="actual"
                  stroke={COLOR_HISTORY}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background, #fff)" }}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                <Line
                  dataKey="p50"
                  stroke={COLOR_FORECAST}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background, #fff)" }}
                  isAnimationActive={false}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Method: {result.method}. Prediction intervals come from 1,000 Monte Carlo paths that
            re-run the fitted model forward, each step perturbed by residuals sampled from its own
            in-sample errors — bands widen with horizon because uncertainty genuinely compounds.
            {result.seasonalitySource === "category-prior" &&
              " Seasonal shape uses modeled category priors — add 24+ months of history and it will be learned from your data instead."}
            {result.filledGaps > 0 &&
              ` ${result.filledGaps} missing calendar month${result.filledGaps > 1 ? "s were" : " was"} treated as zero sales — if that's wrong, add the real numbers for those months.`}
            {" "}A forecast is a planning tool, not a promise: treat the band, not the midline, as the answer.
          </p>

          {/* Gated depth: the full monthly plan + export */}
          <div className="mt-6">
            <FeeUnlockGate
              context={{
                source: "sales-forecaster",
                marketplace,
                category,
                salePrice: price,
              }}
              headline="Unlock the month-by-month plan"
              subhead="The full 12-month table with P10/P50/P90 units, projected revenue per month, and CSV export for your inventory planning."
              finePrint="You'll also get the daily brief on marketplace changes that move sales. Unsubscribe anytime."
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950/45">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Month-by-month forecast
                  </h3>
                  <Button variant="outline" size="sm" onClick={downloadCsv} className="gap-1.5 rounded-full">
                    <Download className="h-3.5 w-3.5" />
                    Download CSV
                  </Button>
                </div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm tabular-nums">
                    <thead>
                      <tr className="border-b border-slate-200 text-left dark:border-white/10">
                        <th className="pb-2 font-medium text-slate-500 dark:text-slate-400">Month</th>
                        <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">Conservative (P10)</th>
                        <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">Median (P50)</th>
                        <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">Upside (P90)</th>
                        <th className="pb-2 text-right font-medium text-slate-500 dark:text-slate-400">Revenue (P50)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {result.forecast.map((f) => (
                        <tr key={f.date.toISOString()}>
                          <td className="py-2 font-medium text-slate-900 dark:text-white">
                            {f.date.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                          </td>
                          <td className="py-2 text-right text-slate-600 dark:text-slate-300">{fmt(f.p10)}</td>
                          <td className="py-2 text-right font-semibold text-slate-900 dark:text-white">{fmt(f.p50)}</td>
                          <td className="py-2 text-right text-slate-600 dark:text-slate-300">{fmt(f.p90)}</td>
                          <td className="py-2 text-right text-slate-600 dark:text-slate-300">
                            ${fmt(Math.round(f.p50 * price))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FeeUnlockGate>
          </div>
        </>
      )}
    </div>
  )
}
