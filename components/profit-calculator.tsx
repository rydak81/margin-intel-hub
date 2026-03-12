"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calculator, DollarSign, TrendingUp, Package, Truck, AlertTriangle, CheckCircle2, Info, BarChart3, PieChart } from "lucide-react"

const CATEGORY_FEES: Record<string, number> = {
  "standard": 15,
  "grocery": 8,
  "electronics": 8,
  "apparel": 17,
  "jewelry": 20,
  "home": 15,
  "beauty": 8,
  "toys": 15,
  "sports": 15,
  "automotive": 12,
}

const FBA_SIZE_TIERS = [
  { name: "Small Standard", maxWeight: 1, maxDim: 15, fee: 3.22 },
  { name: "Large Standard", maxWeight: 20, maxDim: 18, fee: 5.40 },
  { name: "Small Oversize", maxWeight: 70, maxDim: 60, fee: 9.73 },
  { name: "Medium Oversize", maxWeight: 150, maxDim: 108, fee: 19.05 },
  { name: "Large Oversize", maxWeight: 150, maxDim: 130, fee: 89.98 },
]

interface CalculationResult {
  revenue: number
  cogs: number
  amazonFees: number
  advertisingCost: number
  netProfit: number
  margin: number
  roi: number
  breakEvenUnits: number
  monthlyProfit: number
  annualProfit: number
  costBreakdown: {
    wholesale: number
    shipping: number
    tariffs: number
    packaging: number
    referralFee: number
    fbaFee: number
    storageFee: number
    advertising: number
  }
}

export function ProfitCalculator() {
  const [formData, setFormData] = useState({
    productName: "",
    sellingPrice: 29.99,
    unitsPerDay: 10,
    category: "standard",
    wholesalePrice: 8.00,
    shippingToAmazon: 1.50,
    tariffRate: 0,
    packagingCost: 0.50,
    referralFee: 15,
    fbaFee: 5.40,
    storageFee: 0.15,
    targetTacos: 15,
    productWeight: 1,
    productLength: 10,
    productWidth: 8,
    productHeight: 4,
    moq: 500,
    leadTime: 30,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const calculation = useMemo((): CalculationResult => {
    const {
      sellingPrice,
      unitsPerDay,
      wholesalePrice,
      shippingToAmazon,
      tariffRate,
      packagingCost,
      referralFee,
      fbaFee,
      storageFee,
      targetTacos,
    } = formData

    // Revenue calculation
    const revenue = sellingPrice

    // COGS breakdown
    const tariffCost = wholesalePrice * (tariffRate / 100)
    const totalCogs = wholesalePrice + shippingToAmazon + tariffCost + packagingCost

    // Amazon fees
    const referralFeeAmount = sellingPrice * (referralFee / 100)
    const totalAmazonFees = referralFeeAmount + fbaFee + storageFee

    // Advertising
    const advertisingCost = sellingPrice * (targetTacos / 100)

    // Net profit
    const netProfit = revenue - totalCogs - totalAmazonFees - advertisingCost
    const margin = (netProfit / revenue) * 100
    const roi = (netProfit / totalCogs) * 100

    // Break-even
    const fixedCosts = totalCogs + totalAmazonFees
    const breakEvenUnits = fixedCosts > 0 ? Math.ceil(fixedCosts / (netProfit > 0 ? netProfit : 1)) : 0

    // Monthly/Annual projections
    const monthlyUnits = unitsPerDay * 30
    const monthlyProfit = netProfit * monthlyUnits
    const annualProfit = monthlyProfit * 12

    return {
      revenue,
      cogs: totalCogs,
      amazonFees: totalAmazonFees,
      advertisingCost,
      netProfit,
      margin,
      roi,
      breakEvenUnits,
      monthlyProfit,
      annualProfit,
      costBreakdown: {
        wholesale: wholesalePrice,
        shipping: shippingToAmazon,
        tariffs: tariffCost,
        packaging: packagingCost,
        referralFee: referralFeeAmount,
        fbaFee,
        storageFee,
        advertising: advertisingCost,
      },
    }
  }, [formData])

  const getMarginStatus = (margin: number) => {
    if (margin >= 30) return { label: "Excellent", color: "bg-emerald-500", textColor: "text-emerald-500" }
    if (margin >= 20) return { label: "Good", color: "bg-green-500", textColor: "text-green-500" }
    if (margin >= 10) return { label: "Fair", color: "bg-amber-500", textColor: "text-amber-500" }
    return { label: "Poor", color: "bg-red-500", textColor: "text-red-500" }
  }

  const marginStatus = getMarginStatus(calculation.margin)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && !isNaN(parseFloat(value)) ? parseFloat(value) : value
    }))
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      referralFee: CATEGORY_FEES[category] || 15
    }))
  }

  const resetForm = () => {
    setFormData({
      productName: "",
      sellingPrice: 29.99,
      unitsPerDay: 10,
      category: "standard",
      wholesalePrice: 8.00,
      shippingToAmazon: 1.50,
      tariffRate: 0,
      packagingCost: 0.50,
      referralFee: 15,
      fbaFee: 5.40,
      storageFee: 0.15,
      targetTacos: 15,
      productWeight: 1,
      productLength: 10,
      productWidth: 8,
      productHeight: 4,
      moq: 500,
      leadTime: 30,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Projections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Product & Sales Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      value={formData.productName}
                      onChange={(e) => handleInputChange("productName", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        value={formData.sellingPrice}
                        onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unitsPerDay">Units Sold / Day</Label>
                      <Input
                        id="unitsPerDay"
                        type="number"
                        value={formData.unitsPerDay}
                        onChange={(e) => handleInputChange("unitsPerDay", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_FEES).map(([key, fee]) => (
                          <SelectItem key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} ({fee}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Cost of Goods Sold
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wholesalePrice">Wholesale Price / Unit ($)</Label>
                      <Input
                        id="wholesalePrice"
                        type="number"
                        step="0.01"
                        value={formData.wholesalePrice}
                        onChange={(e) => handleInputChange("wholesalePrice", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shippingToAmazon">Shipping to Amazon / Unit ($)</Label>
                      <Input
                        id="shippingToAmazon"
                        type="number"
                        step="0.01"
                        value={formData.shippingToAmazon}
                        onChange={(e) => handleInputChange("shippingToAmazon", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tariffRate">Tariff / Duty Rate (%)</Label>
                      <Input
                        id="tariffRate"
                        type="number"
                        step="0.1"
                        value={formData.tariffRate}
                        onChange={(e) => handleInputChange("tariffRate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packagingCost">Packaging / Prep / Unit ($)</Label>
                      <Input
                        id="packagingCost"
                        type="number"
                        step="0.01"
                        value={formData.packagingCost}
                        onChange={(e) => handleInputChange("packagingCost", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Amazon Fees & Advertising
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="referralFee">Referral Fee (%)</Label>
                      <Input
                        id="referralFee"
                        type="number"
                        step="0.1"
                        value={formData.referralFee}
                        onChange={(e) => handleInputChange("referralFee", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fbaFee">FBA Fee / Unit ($)</Label>
                      <Input
                        id="fbaFee"
                        type="number"
                        step="0.01"
                        value={formData.fbaFee}
                        onChange={(e) => handleInputChange("fbaFee", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storageFee">Monthly Storage / Unit ($)</Label>
                      <Input
                        id="storageFee"
                        type="number"
                        step="0.01"
                        value={formData.storageFee}
                        onChange={(e) => handleInputChange("storageFee", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetTacos">Target TACoS (%)</Label>
                      <Input
                        id="targetTacos"
                        type="number"
                        step="0.1"
                        value={formData.targetTacos}
                        onChange={(e) => handleInputChange("targetTacos", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showAdvanced && (
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Product dimensions and supplier details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product Weight (lbs)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productWeight}
                          onChange={(e) => handleInputChange("productWeight", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>MOQ (units)</Label>
                        <Input
                          type="number"
                          value={formData.moq}
                          onChange={(e) => handleInputChange("moq", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Length (in)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productLength}
                          onChange={(e) => handleInputChange("productLength", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Width (in)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productWidth}
                          onChange={(e) => handleInputChange("productWidth", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (in)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productHeight}
                          onChange={(e) => handleInputChange("productHeight", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Lead Time (days)</Label>
                      <Input
                        type="number"
                        value={formData.leadTime}
                        onChange={(e) => handleInputChange("leadTime", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" className="flex-1">
                  {showAdvanced ? "Hide" : "Show"} Advanced Settings
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Reset
                </Button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Profit Analysis
                    </span>
                    <Badge className={`${marginStatus.color} text-white`}>
                      {marginStatus.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Net Profit / Unit</p>
                      <p className={`text-2xl font-bold ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${calculation.netProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-2xl font-bold ${marginStatus.textColor}`}>
                        {calculation.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Margin Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profit Margin</span>
                      <span>{calculation.margin.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(Math.max(calculation.margin, 0), 50)} 
                      className="h-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span className="text-amber-500">10%</span>
                      <span className="text-green-500">20%</span>
                      <span className="text-emerald-500">30%+</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue / Unit</span>
                      <span className="font-medium">${calculation.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total COGS / Unit</span>
                      <span className="font-medium text-red-500">-${calculation.cogs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amazon Fees / Unit</span>
                      <span className="font-medium text-red-500">-${calculation.amazonFees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advertising / Unit</span>
                      <span className="font-medium text-red-500">-${calculation.advertisingCost.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Profit / Unit</span>
                      <span className={calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                        ${calculation.netProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="w-full text-left">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              ROI <Info className="h-3 w-3" />
                            </p>
                            <p className="font-semibold">{calculation.roi.toFixed(1)}%</p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Return on Investment based on COGS</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="w-full text-left">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              Break-Even <Info className="h-3 w-3" />
                            </p>
                            <p className="font-semibold">{calculation.breakEvenUnits} units</p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Units needed to break even on fixed costs</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {/* Deal Quality Indicator */}
                  <div className={`p-4 rounded-lg border-2 ${calculation.margin >= 20 ? 'border-emerald-500 bg-emerald-500/10' : calculation.margin >= 10 ? 'border-amber-500 bg-amber-500/10' : 'border-red-500 bg-red-500/10'}`}>
                    <div className="flex items-center gap-3">
                      {calculation.margin >= 20 ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <AlertTriangle className={`h-6 w-6 ${calculation.margin >= 10 ? 'text-amber-500' : 'text-red-500'}`} />
                      )}
                      <div>
                        <p className="font-semibold">
                          {calculation.margin >= 30 ? "Excellent Deal!" : 
                           calculation.margin >= 20 ? "Good Deal" :
                           calculation.margin >= 10 ? "Marginal Deal" :
                           "Poor Deal - Consider Alternatives"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {calculation.margin >= 20 
                            ? "This product meets profitability targets" 
                            : "Consider negotiating lower COGS or higher selling price"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown per Unit</CardTitle>
                <CardDescription>Detailed view of all costs affecting your profit margin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Cost of Goods Sold
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Wholesale Price</span>
                      <span className="font-medium">${calculation.costBreakdown.wholesale.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Shipping to Amazon</span>
                      <span className="font-medium">${calculation.costBreakdown.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Tariffs & Duties</span>
                      <span className="font-medium">${calculation.costBreakdown.tariffs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Packaging & Prep</span>
                      <span className="font-medium">${calculation.costBreakdown.packaging.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
                      <span>Total COGS</span>
                      <span>${calculation.cogs.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Amazon Fees
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Referral Fee ({formData.referralFee}%)</span>
                      <span className="font-medium">${calculation.costBreakdown.referralFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>FBA Fulfillment Fee</span>
                      <span className="font-medium">${calculation.costBreakdown.fbaFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Storage Fee (Monthly)</span>
                      <span className="font-medium">${calculation.costBreakdown.storageFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
                      <span>Total Amazon Fees</span>
                      <span>${calculation.amazonFees.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Advertising
                  </h4>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                    <span>PPC Advertising ({formData.targetTacos}% TACoS)</span>
                    <span className="font-medium">${calculation.costBreakdown.advertising.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visual Cost Distribution</CardTitle>
                <CardDescription>See how your revenue is distributed across costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Cost bars */}
                <div className="space-y-4">
                  {[
                    { label: "COGS", value: calculation.cogs, color: "bg-blue-500" },
                    { label: "Amazon Fees", value: calculation.amazonFees, color: "bg-amber-500" },
                    { label: "Advertising", value: calculation.advertisingCost, color: "bg-purple-500" },
                    { label: "Net Profit", value: Math.max(calculation.netProfit, 0), color: "bg-emerald-500" },
                  ].map((item) => {
                    const percentage = (item.value / calculation.revenue) * 100
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{percentage.toFixed(1)}% (${item.value.toFixed(2)})</span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Separator />

                {/* Fee size tier info */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-3">FBA Size Tier Reference</h4>
                  <div className="space-y-2 text-sm">
                    {FBA_SIZE_TIERS.slice(0, 3).map((tier) => (
                      <div key={tier.name} className="flex justify-between">
                        <span className="text-muted-foreground">{tier.name}</span>
                        <span>${tier.fee.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue & Profit Projections</CardTitle>
                <CardDescription>Based on {formData.unitsPerDay} units/day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Daily Revenue</p>
                    <p className="text-xl font-bold">${(calculation.revenue * formData.unitsPerDay).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Daily Profit</p>
                    <p className={`text-xl font-bold ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${(calculation.netProfit * formData.unitsPerDay).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-xl font-bold">${(calculation.revenue * formData.unitsPerDay * 30).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Profit</p>
                    <p className={`text-xl font-bold ${calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${calculation.monthlyProfit.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quarterly Projections</h4>
                    <div className="space-y-2">
                      {["Q1", "Q2", "Q3", "Q4"].map((quarter, i) => (
                        <div key={quarter} className="flex justify-between items-center p-3 rounded bg-muted/30">
                          <span>{quarter}</span>
                          <span className={`font-semibold ${calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            ${(calculation.monthlyProfit * 3).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Annual Summary</h4>
                    <div className="p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Projected Annual Profit</p>
                        <p className={`text-3xl font-bold ${calculation.annualProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          ${calculation.annualProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {(formData.unitsPerDay * 365).toLocaleString()} units/year
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Annual Revenue</span>
                        <span className="font-medium">${(calculation.revenue * formData.unitsPerDay * 365).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Annual COGS</span>
                        <span className="font-medium text-red-500">-${(calculation.cogs * formData.unitsPerDay * 365).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Analysis</CardTitle>
                <CardDescription>Initial inventory investment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">MOQ Investment</p>
                  <p className="text-2xl font-bold">${(calculation.cogs * formData.moq).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formData.moq} units</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Days to Sell MOQ</p>
                  <p className="text-2xl font-bold">{Math.ceil(formData.moq / formData.unitsPerDay)} days</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">MOQ Profit Potential</p>
                  <p className={`text-2xl font-bold ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ${(calculation.netProfit * formData.moq).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <Separator />
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Investment ROI</p>
                  <p className="text-2xl font-bold text-emerald-500">{calculation.roi.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
