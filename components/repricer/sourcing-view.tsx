"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { AlertTriangle, Camera, Search, X } from "lucide-react"

import { DEFAULT_STRATEGY } from "@/lib/repricer/decision"
import { DEFAULT_COST_RATIOS } from "@/lib/repricer/costs"
import {
  describeTiers,
  feesFor,
  MARKETPLACE_LABELS,
  MARKETPLACES,
  type FeeOverrides,
} from "@/lib/repricer/fees"
import { maxLandedCost, profitBuyingAt, type SourcingFees } from "@/lib/repricer/sourcing"
import type { Category, Marketplace, StrategyConfig } from "@/lib/repricer/types"

const fmt = (n: number | null | undefined) =>
  n === null || n === undefined || !Number.isFinite(n) ? "—" : `$${n.toFixed(2)}`

interface LookupResult {
  asin: string
  title: string
  buyBoxPrice: number | null
  lowestOffer: number | null
  offerCount: number | null
  monthlySold: number | null
}

export function SourcingView() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LookupResult[]>([])
  const [picked, setPicked] = useState<LookupResult | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Manual mode inputs (no Keepa key, or user override)
  const [manualPrice, setManualPrice] = useState(0)
  const [manualTitle, setManualTitle] = useState("")

  const [category, setCategory] = useState<Category>("iPad")
  const [marginPct, setMarginPct] = useState(10)
  const [refurbCost, setRefurbCost] = useState(0)
  const [strategy, setStrategy] = useState<StrategyConfig>(DEFAULT_STRATEGY)
  const [feeOverrides, setFeeOverrides] = useState<FeeOverrides>({})
  const [scanning, setScanning] = useState(false)
  const [scanSupported, setScanSupported] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const scanStop = useRef<(() => void) | null>(null)

  useEffect(() => {
    try {
      const s = localStorage.getItem("repricer.strategy.v1")
      if (s) setStrategy({ ...DEFAULT_STRATEGY, ...JSON.parse(s) })
      const f = localStorage.getItem("repricer.fees.v1")
      if (f) setFeeOverrides(JSON.parse(f))
    } catch {
      // defaults are fine
    }
    setScanSupported("BarcodeDetector" in window && "mediaDevices" in navigator)
  }, [])

  const search = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    setPicked(null)
    try {
      const res = await fetch(`/api/sourcing?q=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      if (data.configured === false) {
        setConfigured(false)
        return
      }
      setConfigured(true)
      if (!res.ok) {
        setError(data.error ?? "Lookup failed")
        return
      }
      setResults(data.results)
      if (data.results.length === 1) setPicked(data.results[0])
    } catch {
      setError("Lookup failed — check your connection")
    } finally {
      setLoading(false)
    }
  }

  const startScan = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      const video = videoRef.current!
      video.srcObject = stream
      await video.play()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ["upc_a", "upc_e", "ean_13", "ean_8"],
      })
      let active = true
      scanStop.current = () => {
        active = false
        stream.getTracks().forEach((t) => t.stop())
        setScanning(false)
      }
      const tick = async () => {
        if (!active) return
        try {
          const codes = await detector.detect(video)
          if (codes.length > 0) {
            const code = codes[0].rawValue
            scanStop.current?.()
            setQuery(code)
            search(code)
            return
          }
        } catch {
          // detection can fail on early frames — keep polling
        }
        requestAnimationFrame(tick)
      }
      tick()
    } catch {
      setScanning(false)
      setError("Camera unavailable — enter the barcode digits manually")
    }
  }

  useEffect(() => () => scanStop.current?.(), [])

  const sellingPrice =
    configured === false || picked === null
      ? manualPrice > 0
        ? manualPrice
        : null
      : (picked.buyBoxPrice ?? picked.lowestOffer)

  const productLabel =
    picked?.title ?? (manualTitle.trim() ? manualTitle.trim() : "this product")

  const margin = marginPct / 100
  const feesForMarket = (m: Marketplace): SourcingFees => {
    const f = feesFor(m, category, feeOverrides)
    return {
      tiers: f.tiers,
      fixedFees: f.fixedFees,
      acosRate: strategy.acosRate,
      returnReserveRate: strategy.returnReserveRate,
      outboundShipping: DEFAULT_COST_RATIOS[category].shipping,
    }
  }

  const amazonMax = sellingPrice !== null ? maxLandedCost(sellingPrice, feesForMarket("amazon"), margin) : null
  const amazonMaxPurchase = amazonMax !== null ? amazonMax - refurbCost : null

  return (
    <div className="space-y-6">
      {/* Search / scan */}
      <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="ASIN, UPC/EAN barcode, or product name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
            className="h-10 w-full max-w-md"
          />
          <Button onClick={() => search(query)} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Looking up…" : "Look up"}
          </Button>
          {scanSupported && !scanning && (
            <Button variant="outline" onClick={startScan}>
              <Camera className="mr-2 h-4 w-4" />
              Scan barcode
            </Button>
          )}
          {scanning && (
            <Button variant="outline" onClick={() => scanStop.current?.()}>
              <X className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
          {configured === false && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mr-1 h-3 w-3" />
              No KEEPA_API_KEY — enter the Buy Box price manually below
            </Badge>
          )}
        </div>
        <video
          ref={videoRef}
          className={scanning ? "mt-3 w-full max-w-md rounded-xl" : "hidden"}
          muted
          playsInline
        />
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {/* Result picker */}
        {results.length > 1 && (
          <div className="mt-3 space-y-1">
            {results.map((r) => (
              <button
                key={r.asin}
                onClick={() => setPicked(r)}
                className={`block w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-sky-500/5 ${
                  picked?.asin === r.asin ? "border-sky-400/40 bg-sky-500/10" : "border-transparent"
                }`}
              >
                <span className="font-medium">{r.title.slice(0, 80)}</span>
                <span className="ml-2 text-muted-foreground">
                  {r.asin} · Buy Box {fmt(r.buyBoxPrice)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Manual entry when Keepa is not configured */}
        {configured === false && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Product name (optional)</Label>
              <Input
                className="h-9"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g. iPad 9th Gen 64GB"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Current Buy Box / selling price $</Label>
              <Input
                type="number"
                className="h-9"
                step={1}
                value={manualPrice || ""}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (Number.isFinite(v) && v >= 0) setManualPrice(v)
                }}
              />
            </div>
          </div>
        )}

        {/* Picked product summary */}
        {picked && (
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-xl border p-3 text-sm">
            <span className="font-medium">{picked.title.slice(0, 90)}</span>
            <span className="text-muted-foreground">{picked.asin}</span>
            <span>
              Buy Box: <strong>{fmt(picked.buyBoxPrice)}</strong>
            </span>
            <span>Lowest: {fmt(picked.lowestOffer)}</span>
            <span>{picked.offerCount ?? "?"} sellers</span>
            {picked.monthlySold !== null && <span>~{picked.monthlySold}/mo sold</span>}
          </div>
        )}
      </div>

      {/* Assumptions */}
      <div className="rounded-2xl border border-white/70 bg-white/84 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Fee category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEFAULT_COST_RATIOS) as Category[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target margin %</Label>
            <Input
              type="number"
              className="h-9"
              step={0.5}
              value={marginPct}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v) && v >= 0 && v < 90) setMarginPct(v)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Est. refurb + inbound $ / unit</Label>
            <Input
              type="number"
              className="h-9"
              step={1}
              value={refurbCost || ""}
              placeholder="0"
              onChange={(e) => {
                const v = Number(e.target.value)
                if (Number.isFinite(v) && v >= 0) setRefurbCost(v)
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Outbound shipping (category default)</Label>
            <Input
              className="h-9"
              disabled
              value={`$${DEFAULT_COST_RATIOS[category].shipping.toFixed(2)}`}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ACoS {`${(strategy.acosRate * 100).toFixed(1)}%`} and return reserve{" "}
          {`${(strategy.returnReserveRate * 100).toFixed(1)}%`} come from your dashboard
          strategy settings. Fee edits from the dashboard apply here too.
        </p>
      </div>

      {/* Result */}
      {sellingPrice !== null && sellingPrice > 0 ? (
        <>
          <div className="rounded-2xl border border-sky-400/30 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),rgba(217,70,239,0.05))] p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              To make {marginPct.toFixed(1)}% net margin selling at {fmt(sellingPrice)} on
              Amazon, the most you should pay for{" "}
              <span className="font-medium text-foreground">{productLabel}</span> is
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight text-sky-700 dark:text-sky-300">
              {amazonMaxPurchase !== null && amazonMaxPurchase > 0 ? fmt(amazonMaxPurchase) : "—"}
            </p>
            {refurbCost > 0 && amazonMax !== null && amazonMax > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                = {fmt(amazonMax)} max landed cost − {fmt(refurbCost)} refurb/inbound
              </p>
            )}
            {(amazonMax === null || amazonMax <= 0 || (amazonMaxPurchase !== null && amazonMaxPurchase <= 0)) && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                This margin is not achievable at this selling price — fees and costs consume
                the entire price. Lower the margin target or walk away.
              </p>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/84 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Referral</TableHead>
                  <TableHead className="text-right">Max landed cost</TableHead>
                  <TableHead className="text-right">Max purchase price</TableHead>
                  <TableHead className="text-right">Profit / unit @ max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MARKETPLACES.map((m) => {
                  const fees = feesForMarket(m)
                  const maxLanded = maxLandedCost(sellingPrice, fees, margin)
                  const maxPurchase = maxLanded - refurbCost
                  const profit = maxLanded > 0 ? profitBuyingAt(sellingPrice, maxLanded, fees) : null
                  const schedule = feesFor(m, category, feeOverrides)
                  return (
                    <TableRow key={m} className={m === "amazon" ? "bg-sky-500/5" : ""}>
                      <TableCell className="font-medium">{MARKETPLACE_LABELS[m]}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {describeTiers(schedule.tiers)}
                        {schedule.fixedFees > 0 ? ` + ${fmt(schedule.fixedFees)}` : ""}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {maxLanded > 0 ? fmt(maxLanded) : "not achievable"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {maxPurchase > 0 ? fmt(maxPurchase) : "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{fmt(profit)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <p className="px-4 pb-3 pt-1 text-xs text-muted-foreground">
              Assumes the same {fmt(sellingPrice)} selling price on every channel — adjust
              per-channel pricing judgment on top. Max purchase price = max landed cost −
              refurb/inbound estimate. Fee rates are editable on the dashboard and must be
              verified against current schedules.
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Look up a product (or enter a selling price) to compute the maximum you should pay.
        </p>
      )}
    </div>
  )
}
