"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Area, AreaChart
} from "recharts"
import {
  TrendingUp, Package, DollarSign, BarChart3, Info, Calculator,
  ArrowRight, AlertTriangle, CheckCircle2, Truck, ShoppingCart
} from "lucide-react"

const CATEGORIES = [
  "Electronics", "Home & Kitchen", "Beauty & Personal Care", "Health & Household",
  "Toys & Games", "Sports & Outdoors", "Clothing & Accessories", "Office Products",
  "Pet Supplies", "Grocery", "Baby", "Automotive", "Tools & Home Improvement",
]

const SIZE_TIERS = [
  { id: "small_standard", label: "Small Standard", fee: 3.22 },
  { id: "large_standard", label: "Large Standard", fee: 4.75 },
  { id: "small_oversize", label: "Small Oversize", fee: 8.26 },
  { id: "large_oversize", label: "Large Oversize", fee: 12.37 },
]

// Seasonal multipliers by quarter (Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec)
const SEASONAL: Record<string, number[]> = {
  "Electronics":     [0.85, 0.80, 0.90, 1.45],
  "Toys & Games":    [0.70, 0.75, 0.85, 1.70],
  "Clothing & Accessories": [0.90, 0.95, 1.00, 1.15],
  default:           [0.90, 0.90, 0.95, 1.25],
}

function getSeasonalMultiplier(category: string, month: number): number {
  const q = Math.floor(month / 3)
  const factors = SEASONAL[category] || SEASONAL.default
  return factors[q]
}

function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: data[0] || 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  data.forEach((y, x) => { sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x })
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

export function SalesForecaster() {
  const [productName, setProductName] = useState("")
  const [historicalSales, setHistoricalSales] = useState("120,135,150,140,160,170")
  const [sellingPrice, setSellingPrice] = useState("29.99")
  const [cogs, setCogs] = useState("8.50")
  const [adSpend, setAdSpend] = useState("500")
  const [category, setCategory] = useState("Home & Kitchen")
  const [sizeTier, setSizeTier] = useState("small_standard")
  const [leadTimeDays, setLeadTimeDays] = useState("45")
  const [fulfillment, setFulfillment] = useState<"fba" | "fbm">("fba")
  const [hasCalculated, setHasCalculated] = useState(false)

  const results = useMemo(() => {
    const sales = historicalSales.split(",").map(s => parseFloat(s.trim())).filter(n => !isNaN(n))
    if (sales.length < 2) return null

    const price = parseFloat(sellingPrice) || 0
    const cost = parseFloat(cogs) || 0
    const monthlyAd = parseFloat(adSpend) || 0
    const lead = parseInt(leadTimeDays) || 45
    const tier = SIZE_TIERS.find(t => t.id === sizeTier) || SIZE_TIERS[0]

    // Regression
    const { slope, intercept } = linearRegression(sales)
    const currentMonth = new Date().getMonth()

    // Forecast next 6 months
    const forecast: Array<{ month: string; units: number; revenue: number; profit: number; type: string }> = []

    // Historical
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const startMonth = (currentMonth - sales.length + 13) % 12
    sales.forEach((units, i) => {
      const m = (startMonth + i) % 12
      forecast.push({
        month: monthNames[m],
        units: Math.round(units),
        revenue: Math.round(units * price),
        profit: Math.round(units * (price - cost - (fulfillment === "fba" ? price * 0.15 + tier.fee : price * 0.15 + 1)) - monthlyAd),
        type: "historical"
      })
    })

    // Projected
    for (let i = 0; i < 6; i++) {
      const m = (currentMonth + i + 1) % 12
      const baseUnits = intercept + slope * (sales.length + i)
      const seasonalMult = getSeasonalMultiplier(category, m)
      const units = Math.max(0, Math.round(baseUnits * seasonalMult))
      const referralFee = price * 0.15
      const fulfillmentFee = fulfillment === "fba" ? tier.fee : 1.00
      const perUnitProfit = price - cost - referralFee - fulfillmentFee
      const monthlyProfit = Math.round(units * perUnitProfit - monthlyAd)

      forecast.push({
        month: monthNames[m],
        units,
        revenue: Math.round(units * price),
        profit: monthlyProfit,
        type: "projected"
      })
    }

    const projectedUnits = forecast.filter(f => f.type === "projected")
    const totalProjectedUnits3 = projectedUnits.slice(0, 3).reduce((s, f) => s + f.units, 0)
    const totalProjectedUnits6 = projectedUnits.reduce((s, f) => s + f.units, 0)
    const totalProjectedRevenue3 = projectedUnits.slice(0, 3).reduce((s, f) => s + f.revenue, 0)
    const totalProjectedRevenue6 = projectedUnits.reduce((s, f) => s + f.revenue, 0)
    const avgMonthlyUnits = Math.round(totalProjectedUnits6 / 6)

    // Profit metrics
    const referralFee = price * 0.15
    const fulfillmentFee = fulfillment === "fba" ? tier.fee : 1.00
    const perUnitProfit = price - cost - referralFee - fulfillmentFee
    const profitMargin = price > 0 ? (perUnitProfit / price) * 100 : 0
    const monthlyAdPerUnit = avgMonthlyUnits > 0 ? monthlyAd / avgMonthlyUnits : 0
    const netPerUnit = perUnitProfit - monthlyAdPerUnit
    const netMargin = price > 0 ? (netPerUnit / price) * 100 : 0

    // Inventory
    const dailySales = avgMonthlyUnits / 30
    const reorderPoint = Math.ceil(dailySales * lead * 1.2) // 20% safety stock
    const recommendedOrder = Math.ceil(dailySales * 90) // 90-day supply

    // Ad metrics
    const acos = totalProjectedRevenue3 > 0 ? ((monthlyAd * 3) / totalProjectedRevenue3) * 100 : 0
    const tacos = totalProjectedRevenue3 > 0 ? ((monthlyAd * 3) / totalProjectedRevenue3) * 100 : 0
    const suggestedDailyBudget = Math.round((avgMonthlyUnits * price * 0.12) / 30) // Target 12% TACoS

    // Health score (0-100)
    const marginScore = Math.min(40, Math.max(0, profitMargin * 1.2))
    const growthScore = slope > 0 ? Math.min(30, slope * 5) : 0
    const acoScore = acos < 25 ? 30 : acos < 35 ? 20 : 10
    const healthScore = Math.round(marginScore + growthScore + acoScore)

    return {
      forecast,
      totalProjectedUnits3,
      totalProjectedUnits6,
      totalProjectedRevenue3,
      totalProjectedRevenue6,
      avgMonthlyUnits,
      perUnitProfit,
      profitMargin,
      netPerUnit,
      netMargin,
      referralFee,
      fulfillmentFee,
      monthlyAdPerUnit,
      reorderPoint,
      recommendedOrder,
      dailySales,
      acos,
      tacos,
      suggestedDailyBudget,
      healthScore,
      slope,
    }
  }, [historicalSales, sellingPrice, cogs, adSpend, category, sizeTier, leadTimeDays, fulfillment])

  const getHealthColor = (score: number) => {
    if (score >= 70) return "text-emerald-600"
    if (score >= 40) return "text-amber-600"
    return "text-red-600"
  }

  const getMarginBadge = (margin: number) => {
    if (margin >= 30) return { label: "Excellent", color: "bg-emerald-500" }
    if (margin >= 20) return { label: "Good", color: "bg-blue-500" }
    if (margin >= 10) return { label: "Thin", color: "bg-amber-500" }
    return { label: "Critical", color: "bg-red-500" }
  }

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product / ASIN</Label>
              <Input id="product" placeholder="e.g. Silicone Kitchen Utensils" value={productName} onChange={e => setProductName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Product Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Selling Price ($)</Label>
              <Input id="price" type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cogs">COGS / Unit ($)</Label>
              <Input id="cogs" type="number" step="0.01" value={cogs} onChange={e => setCogs(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adSpend">Monthly Ad Spend ($)</Label>
              <Input id="adSpend" type="number" value={adSpend} onChange={e => setAdSpend(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizeTier">FBA Size Tier</Label>
              <Select value={sizeTier} onValueChange={setSizeTier}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZE_TIERS.map(t => <SelectItem key={t.id} value={t.id}>{t.label} (${t.fee})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fulfillment">Fulfillment</Label>
              <Select value={fulfillment} onValueChange={(v: "fba" | "fbm") => setFulfillment(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fba">FBA (Fulfilled by Amazon)</SelectItem>
                  <SelectItem value="fbm">FBM (Merchant Fulfilled)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead">Lead Time (days)</Label>
              <Input id="lead" type="number" value={leadTimeDays} onChange={e => setLeadTimeDays(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="sales">Monthly Sales History (comma-separated)</Label>
              <Input id="sales" placeholder="120,135,150,140,160,170" value={historicalSales} onChange={e => setHistoricalSales(e.target.value)} />
              <p className="text-xs text-muted-foreground">Enter 3-12 months of unit sales, oldest to newest</p>
            </div>
          </div>
          <Button onClick={() => setHasCalculated(true)} className="w-full sm:w-auto" disabled={!results}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Forecast
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {hasCalculated && results && (
        <TooltipProvider>
          {/* Health Score Overview */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                <p className={`text-3xl font-bold ${getHealthColor(results.healthScore)}`}>{results.healthScore}</p>
                <Progress value={results.healthScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">3-Mo Revenue</p>
                <p className="text-2xl font-bold">${results.totalProjectedRevenue3.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{results.totalProjectedUnits3.toLocaleString()} units</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Net Margin</p>
                <Badge className={`${getMarginBadge(results.netMargin).color} text-white`}>{getMarginBadge(results.netMargin).label}</Badge>
                <p className="text-2xl font-bold mt-1">{results.netMargin.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <p className={`text-2xl font-bold ${results.slope > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {results.slope > 0 ? "+" : ""}{results.slope.toFixed(1)} /mo
                </p>
                <p className="text-xs text-muted-foreground">{results.slope > 0 ? "Growing" : "Declining"}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="forecast" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="forecast"><TrendingUp className="h-4 w-4 mr-1.5 hidden sm:inline" />Forecast</TabsTrigger>
              <TabsTrigger value="inventory"><Package className="h-4 w-4 mr-1.5 hidden sm:inline" />Inventory</TabsTrigger>
              <TabsTrigger value="adspend"><BarChart3 className="h-4 w-4 mr-1.5 hidden sm:inline" />Ad Spend</TabsTrigger>
              <TabsTrigger value="profitability"><DollarSign className="h-4 w-4 mr-1.5 hidden sm:inline" />Profitability</TabsTrigger>
            </TabsList>

            {/* Forecast Tab */}
            <TabsContent value="forecast">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Sales & Revenue Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={results.forecast}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="units" orientation="left" />
                        <YAxis yAxisId="revenue" orientation="right" tickFormatter={(v) => `$${v}`} />
                        <RechartsTooltip formatter={(value: number, name: string) => [name === "revenue" ? `$${value.toLocaleString()}` : value.toLocaleString(), name === "revenue" ? "Revenue" : "Units"]} />
                        <Legend />
                        <Area yAxisId="units" type="monotone" dataKey="units" stroke="#4466FF" fill="#4466FF" fillOpacity={0.1} name="Units" />
                        <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#CC44FF" fill="#CC44FF" fillOpacity={0.1} name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">6-Month Projected Revenue</p>
                      <p className="text-xl font-bold">${results.totalProjectedRevenue6.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">6-Month Projected Units</p>
                      <p className="text-xl font-bold">{results.totalProjectedUnits6.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Inventory Planning
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Recommended Order</p>
                      <p className="text-3xl font-bold">{results.recommendedOrder.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">units (90-day supply)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">Reorder Point</p>
                      <p className="text-3xl font-bold">{results.reorderPoint.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">units (reorder when stock hits this)</p>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">Daily Velocity</p>
                      <p className="text-3xl font-bold">{results.dailySales.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground mt-1">units/day avg</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Order Timeline</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          With a {leadTimeDays}-day lead time and {(results.dailySales).toFixed(1)} units/day velocity,
                          place your next order of <strong>{results.recommendedOrder.toLocaleString()} units</strong> when
                          inventory drops below <strong>{results.reorderPoint.toLocaleString()} units</strong>.
                          This includes a 20% safety buffer for demand spikes.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Landed Cost Estimate</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Order cost: <strong>${(results.recommendedOrder * parseFloat(cogs || "0")).toLocaleString()}</strong> ({results.recommendedOrder} x ${cogs})
                          {" "}+ estimated shipping/duties (~15%): <strong>${Math.round(results.recommendedOrder * parseFloat(cogs || "0") * 0.15).toLocaleString()}</strong>
                          {" "}= <strong className="text-foreground">${Math.round(results.recommendedOrder * parseFloat(cogs || "0") * 1.15).toLocaleString()}</strong> total
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ad Spend Tab */}
            <TabsContent value="adspend">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Ad Spend Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Current TACoS</p>
                      <p className={`text-3xl font-bold ${results.tacos < 15 ? "text-emerald-600" : results.tacos < 25 ? "text-amber-600" : "text-red-600"}`}>
                        {results.tacos.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{results.tacos < 15 ? "Healthy" : results.tacos < 25 ? "Moderate" : "High"}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Suggested Daily Budget</p>
                      <p className="text-3xl font-bold">${results.suggestedDailyBudget}</p>
                      <p className="text-xs text-muted-foreground mt-1">targeting 12% TACoS</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">Ad Cost / Unit</p>
                      <p className="text-3xl font-bold">${results.monthlyAdPerUnit.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">of ${sellingPrice} selling price</p>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={results.forecast.filter(f => f.type === "projected")}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `$${v}`} />
                        <RechartsTooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#4466FF" name="Revenue" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="profit" fill="#22c55e" name="Profit (after ads)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profitability Tab */}
            <TabsContent value="profitability">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Per-Unit Profitability Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "Selling Price", value: parseFloat(sellingPrice), color: "bg-blue-500" },
                      { label: "COGS", value: -parseFloat(cogs || "0"), color: "bg-red-500" },
                      { label: `Referral Fee (15%)`, value: -results.referralFee, color: "bg-orange-500" },
                      { label: `Fulfillment (${fulfillment.toUpperCase()})`, value: -results.fulfillmentFee, color: "bg-purple-500" },
                      { label: "Ad Cost / Unit", value: -results.monthlyAdPerUnit, color: "bg-pink-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${item.color}`} />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className={`font-mono text-sm font-medium ${item.value < 0 ? "text-red-600" : "text-foreground"}`}>
                          {item.value < 0 ? "-" : ""}${Math.abs(item.value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Net Profit / Unit</span>
                      <span className={`font-mono text-lg font-bold ${results.netPerUnit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        ${results.netPerUnit.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Net Margin</span>
                      <Badge className={`${getMarginBadge(results.netMargin).color} text-white`}>
                        {results.netMargin.toFixed(1)}% — {getMarginBadge(results.netMargin).label}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      {results.netMargin >= 20 ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                      ) : results.netMargin >= 10 ? (
                        <Info className="h-5 w-5 text-amber-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">
                          {results.netMargin >= 20 ? "Strong Unit Economics" :
                           results.netMargin >= 10 ? "Margins Need Attention" :
                           "Critical: Low Margins"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {results.netMargin >= 20
                            ? `At ${results.netMargin.toFixed(1)}% net margin, this product has healthy economics. Focus on scaling ad spend and inventory depth.`
                            : results.netMargin >= 10
                            ? `At ${results.netMargin.toFixed(1)}% net margin, consider reducing COGS through supplier negotiation or optimizing ad spend to improve profitability.`
                            : `At ${results.netMargin.toFixed(1)}% net margin, this product needs immediate attention. Review COGS, consider price increases, or reduce ad dependency.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      )}
    </div>
  )
}
