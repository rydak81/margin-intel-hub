"use client"

// Full-screen interactive history explorer: switch products, change the time
// frame, toggle metrics, zoom/pan the price action with a brush, and compare
// the market against the pricing strategy (floor + target reference lines).

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"

import { SEED_CATALOG } from "@/lib/repricer/catalog"
import { decide, DEFAULT_STRATEGY } from "@/lib/repricer/decision"
import { generateSampleHistory, trimLeadingEmpty, type HistoryPoint } from "@/lib/repricer/history"
import type { CostRecord, PriceLadder, StrategyConfig } from "@/lib/repricer/types"
import type { FeeOverrides } from "@/lib/repricer/fees"
import { CHROME, SERIES, useDarkMode } from "./chart-theme"

const RANGES = [
  { label: "3M", months: 3 },
  { label: "6M", months: 6 },
  { label: "12M", months: 12 },
  { label: "18M", months: 18 },
] as const

type SeriesKey = "ourPrice" | "buyBoxPrice" | "lowestOffer"

const SERIES_META: { key: SeriesKey; label: string }[] = [
  { key: "ourPrice", label: "Our price" },
  { key: "buyBoxPrice", label: "Buy Box" },
  { key: "lowestOffer", label: "Lowest offer" },
]

export function HistoryExplorer({
  open,
  initialAsin,
  onOpenChange,
}: {
  open: boolean
  initialAsin: string
  onOpenChange: (open: boolean) => void
}) {
  const [asin, setAsin] = useState(initialAsin)
  const [search, setSearch] = useState("")
  const [allPoints, setAllPoints] = useState<HistoryPoint[]>([])
  const [source, setSource] = useState<"keepa" | "sample">("sample")
  const [months, setMonths] = useState<number>(18)
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    ourPrice: true,
    buyBoxPrice: true,
    lowestOffer: true,
  })
  const [showStrategy, setShowStrategy] = useState(true)
  const [ladder, setLadder] = useState<PriceLadder | null>(null)
  const dark = useDarkMode()
  const colors = dark ? SERIES.dark : SERIES.light
  const chrome = dark ? CHROME.dark : CHROME.light

  useEffect(() => {
    if (open) setAsin(initialAsin)
  }, [open, initialAsin])

  const item = SEED_CATALOG.find((i) => i.asin === asin) ?? SEED_CATALOG[0]

  const options = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SEED_CATALOG.filter(
      (i) => !q || i.title.toLowerCase().includes(q) || i.asin.toLowerCase().includes(q),
    )
  }, [search])

  // Strategy ladder (floor/target) from the dashboard's saved local state.
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
  }, [asin, item, open])

  useEffect(() => {
    if (!open) return
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
  }, [asin, item, open])

  const points = useMemo(() => allPoints.slice(-months), [allPoints, months])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] sm:max-w-[min(96vw,1400px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 text-lg leading-snug">
            History explorer — {item.title}
          </DialogTitle>
          <DialogDescription>
            {item.asin} · {item.category} ·{" "}
            {source === "sample" ? "sample data (set KEEPA_API_KEY for live)" : "live via Keepa"}
          </DialogDescription>
        </DialogHeader>

        {/* Controls: product, range, metric toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Filter products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-48"
          />
          <Select value={asin} onValueChange={setAsin}>
            <SelectTrigger className="h-9 w-[360px] max-w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((i) => (
                <SelectItem key={i.asin} value={i.asin}>
                  {i.title.length > 55 ? `${i.title.slice(0, 55)}…` : i.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.label}
                size="sm"
                variant={months === r.months ? "default" : "outline"}
                className="h-8 px-3"
                onClick={() => setMonths(r.months)}
              >
                {r.label}
              </Button>
            ))}
            <Button
              size="sm"
              variant={months === 36 ? "default" : "outline"}
              className="h-8 px-3"
              onClick={() => setMonths(36)}
            >
              All
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SERIES_META.map((s) => (
              <button
                key={s.key}
                onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  visible[s.key]
                    ? "border-transparent bg-slate-100 font-medium dark:bg-slate-800"
                    : "border-dashed text-muted-foreground opacity-60"
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors[s.key === "ourPrice" ? "our" : s.key === "buyBoxPrice" ? "buyBox" : "lowest"] }}
                />
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setShowStrategy((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                showStrategy
                  ? "border-transparent bg-slate-100 font-medium dark:bg-slate-800"
                  : "border-dashed text-muted-foreground opacity-60"
              }`}
            >
              <span
                className="inline-block h-0.5 w-4"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, ${chrome.floor} 0 4px, transparent 4px 7px)`,
                }}
              />
              Floor / Target
            </button>
          </div>
        </div>

        {/* Main price chart with zoom brush */}
        <div className="h-[440px]">
          <ResponsiveContainer>
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
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
                tickFormatter={(v: number) => `$${v}`}
                width={52}
                domain={[
                  (dataMin: number) =>
                    Number.isFinite(dataMin) ? Math.floor((dataMin * 0.96) / 5) * 5 : 0,
                  (dataMax: number) =>
                    Number.isFinite(dataMax) ? Math.ceil((dataMax * 1.03) / 5) * 5 : 1,
                ]}
              />
              <Tooltip
                formatter={(value, name) => [
                  value == null ? "—" : `$${Number(value).toFixed(2)}`,
                  String(name),
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              {showStrategy && ladder && (
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
              {showStrategy && ladder && (
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
              {visible.ourPrice && source === "keepa" && item.currentPrice !== null && (
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
              {visible.ourPrice && source === "sample" && (
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
              {visible.buyBoxPrice && (
                <Line
                  type="monotone"
                  dataKey="buyBoxPrice"
                  name="Buy Box"
                  stroke={colors.buyBox}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
              {visible.lowestOffer && (
                <Line
                  type="monotone"
                  dataKey="lowestOffer"
                  name="Lowest offer"
                  stroke={colors.lowest}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              )}
              <Brush
                key={`${asin}-${months}`}
                dataKey="month"
                height={26}
                travellerWidth={8}
                stroke={chrome.axis}
                fill="transparent"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          Drag the handles under the chart to zoom into a window of the price action; drag the
          window to pan. Dashed lines are your strategy: floor (red) and target (green) from
          the dashboard&apos;s costs and settings.
        </p>
        {ladder === null && (
          <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            No landed cost saved for this SKU — add one on the dashboard to overlay floor and
            target.
          </p>
        )}

        {/* Secondary metrics */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-3">
            <h4 className="mb-2 text-sm font-semibold">Competing sellers</h4>
            <div className="h-[160px]">
              <ResponsiveContainer>
                <LineChart data={points} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
                  <CartesianGrid stroke={chrome.grid} strokeWidth={1} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: chrome.axis }}
                    tickLine={false}
                    axisLine={{ stroke: chrome.grid }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: chrome.axis }}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line
                    type="stepAfter"
                    dataKey="offerCount"
                    name="Sellers"
                    stroke={colors.our}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border p-3">
            <h4 className="mb-2 text-sm font-semibold">Est. monthly sales (units)</h4>
            <div className="h-[160px]">
              <ResponsiveContainer>
                <BarChart data={points} margin={{ top: 4, right: 12, bottom: 0, left: 4 }}>
                  <CartesianGrid stroke={chrome.grid} strokeWidth={1} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: chrome.axis }}
                    tickLine={false}
                    axisLine={{ stroke: chrome.grid }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: chrome.axis }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar
                    dataKey="monthlySold"
                    name="Units"
                    fill={colors.our}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {source === "sample" && (
          <Badge
            variant="outline"
            className="w-fit border-amber-500/40 text-amber-700 dark:text-amber-300"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Sample data — set KEEPA_API_KEY for live history
          </Badge>
        )}
      </DialogContent>
    </Dialog>
  )
}
