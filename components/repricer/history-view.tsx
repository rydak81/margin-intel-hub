"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
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
import { generateSampleHistory, type HistoryPoint } from "@/lib/repricer/history"
import type { CostRecord, StrategyConfig } from "@/lib/repricer/types"
import type { FeeOverrides } from "@/lib/repricer/fees"

// Validated 3-slot categorical palette (dataviz reference palette; first three
// slots pass all-pairs CVD + normal-vision checks in both modes).
const SERIES = {
  light: { our: "#2a78d6", buyBox: "#eb6834", lowest: "#1baf7a" },
  dark: { our: "#3987e5", buyBox: "#d95926", lowest: "#199e70" },
}
const CHROME = {
  light: { grid: "#e1e0d9", axis: "#898781", floor: "#d03b3b" },
  dark: { grid: "#2c2c2a", axis: "#898781", floor: "#d03b3b" },
}

function useDarkMode(): boolean {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const compute = () => setDark(root.classList.contains("dark") || media.matches)
    compute()
    const observer = new MutationObserver(compute)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    media.addEventListener("change", compute)
    return () => {
      observer.disconnect()
      media.removeEventListener("change", compute)
    }
  }, [])
  return dark
}

export function HistoryView() {
  const [asin, setAsin] = useState(SEED_CATALOG[0].asin)
  const [search, setSearch] = useState("")
  const [points, setPoints] = useState<HistoryPoint[]>([])
  const [source, setSource] = useState<"keepa" | "sample">("sample")
  const [loading, setLoading] = useState(false)
  const [floor, setFloor] = useState<number | null>(null)
  const dark = useDarkMode()
  const colors = dark ? SERIES.dark : SERIES.light
  const chrome = dark ? CHROME.dark : CHROME.light

  const item = SEED_CATALOG.find((i) => i.asin === asin)!

  const options = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SEED_CATALOG.filter(
      (i) => !q || i.title.toLowerCase().includes(q) || i.asin.toLowerCase().includes(q),
    )
  }, [search])

  // Floor from the same local data the dashboard uses (costs + strategy + fees).
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
      const cost = costs[asin] ?? null
      const d = decide(item, cost, "amazon", strategy, feeOverrides)
      setFloor(d.ladder?.floorPrice ?? null)
    } catch {
      setFloor(null)
    }
  }, [asin, item])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/history?asin=${asin}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.configured && data.points) {
          // Keepa tracks the market, not our offer — overlay our current price
          // on the most recent month so the series stays honest.
          const pts = data.points as HistoryPoint[]
          if (pts.length && item.currentPrice !== null)
            pts[pts.length - 1] = { ...pts[pts.length - 1], ourPrice: item.currentPrice }
          setPoints(pts)
          setSource("keepa")
        } else {
          setPoints(generateSampleHistory(item))
          setSource("sample")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPoints(generateSampleHistory(item))
          setSource("sample")
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [asin, item])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-56"
        />
        <Select value={asin} onValueChange={setAsin}>
          <SelectTrigger className="h-9 w-[420px] max-w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((i) => (
              <SelectItem key={i.asin} value={i.asin}>
                {i.title.length > 60 ? `${i.title.slice(0, 60)}…` : i.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {source === "sample" ? (
          <Badge
            variant="outline"
            className="border-amber-500/40 text-amber-700 dark:text-amber-300"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Sample data — set KEEPA_API_KEY for live history
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
          >
            Live · Keepa
          </Badge>
        )}
        {loading && <span className="text-sm text-muted-foreground">Loading…</span>}
      </div>

      {/* Price chart */}
      <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Price history — {item.asin}</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <LegendSwatch color={colors.our} label="Our price" />
            <LegendSwatch color={colors.buyBox} label="Buy Box" />
            <LegendSwatch color={colors.lowest} label="Lowest offer" />
            {floor !== null && <LegendSwatch color={chrome.floor} label="Our floor" dashed />}
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Monthly, last 18 months. The dashed line is your computed profitability floor —
          every month the market sits below it is a month you could not have competed
          profitably.
        </p>
        <div className="h-[320px]">
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
                  (dataMin: number) => Math.floor((dataMin * 0.96) / 5) * 5,
                  (dataMax: number) => Math.ceil((dataMax * 1.03) / 5) * 5,
                ]}
              />
              <Tooltip
                formatter={(value, name) => [
                  value == null ? "—" : `$${Number(value).toFixed(2)}`,
                  String(name),
                ]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              {floor !== null && (
                <ReferenceLine
                  y={floor}
                  stroke={chrome.floor}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{
                    value: `Floor $${floor.toFixed(2)}`,
                    position: "insideBottomRight",
                    fontSize: 11,
                    fill: chrome.floor,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="ourPrice"
                name="Our price"
                stroke={colors.our}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="buyBoxPrice"
                name="Buy Box"
                stroke={colors.buyBox}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="lowestOffer"
                name="Lowest offer"
                stroke={colors.lowest}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {floor === null && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
            No landed cost saved for this SKU — enter one on the dashboard to draw your
            profitability floor on this chart.
          </p>
        )}
      </div>

      {/* Small multiples: sellers and sales — separate panels, never a second axis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <h3 className="mb-3 text-sm font-semibold">Competing sellers</h3>
          <div className="h-[180px]">
            <ResponsiveContainer>
              <LineChart data={points} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
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
        <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <h3 className="mb-3 text-sm font-semibold">Est. monthly sales (units)</h3>
          <div className="h-[180px]">
            <ResponsiveContainer>
              <BarChart data={points} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
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
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendSwatch({
  color,
  label,
  dashed = false,
}: {
  color: string
  label: string
  dashed?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded"
        style={
          dashed
            ? {
                backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`,
              }
            : { backgroundColor: color }
        }
      />
      {label}
    </span>
  )
}
