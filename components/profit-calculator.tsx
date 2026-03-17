"use client"

import { useState, useMemo, useCallback } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  BarChart3, 
  PieChart, 
  Scale,
  GitCompare,
  Share2,
  Copy,
  Download,
  Link2,
  Check,
  Plus,
  Trash2,
  FileText,
} from "lucide-react"

// Amazon category referral fees (2024 rates)
const CATEGORY_FEES: Record<string, { referral: number; label: string }> = {
  "standard": { referral: 15, label: "Standard" },
  "amazon-device-accessories": { referral: 45, label: "Amazon Device Accessories" },
  "appliances": { referral: 15, label: "Appliances" },
  "automotive": { referral: 12, label: "Automotive" },
  "baby-products": { referral: 8, label: "Baby Products" },
  "backpacks-handbags": { referral: 15, label: "Backpacks & Handbags" },
  "beauty": { referral: 8, label: "Beauty" },
  "business-industrial": { referral: 12, label: "Business & Industrial" },
  "clothing-accessories": { referral: 17, label: "Clothing & Accessories" },
  "computers": { referral: 8, label: "Computers" },
  "consumer-electronics": { referral: 8, label: "Consumer Electronics" },
  "electronics-accessories": { referral: 15, label: "Electronics Accessories" },
  "furniture": { referral: 15, label: "Furniture" },
  "grocery": { referral: 8, label: "Grocery & Gourmet" },
  "health-personal-care": { referral: 8, label: "Health & Personal Care" },
  "home-garden": { referral: 15, label: "Home & Garden" },
  "jewelry": { referral: 20, label: "Jewelry" },
  "kitchen": { referral: 15, label: "Kitchen" },
  "lawn-garden": { referral: 15, label: "Lawn & Garden" },
  "luggage": { referral: 15, label: "Luggage" },
  "musical-instruments": { referral: 15, label: "Musical Instruments" },
  "office-products": { referral: 15, label: "Office Products" },
  "outdoors": { referral: 15, label: "Outdoors" },
  "pet-supplies": { referral: 15, label: "Pet Supplies" },
  "shoes": { referral: 15, label: "Shoes" },
  "sports": { referral: 15, label: "Sports & Outdoors" },
  "tools-home-improvement": { referral: 15, label: "Tools & Home Improvement" },
  "toys-games": { referral: 15, label: "Toys & Games" },
  "video-games": { referral: 15, label: "Video Games" },
  "watches": { referral: 16, label: "Watches" },
}

// FBA fee structure (2024 rates) - simplified tiers
const FBA_SIZE_TIERS = {
  small_standard: {
    name: "Small Standard",
    maxWeight: 0.75, // lbs
    maxLength: 15,
    maxWidth: 12,
    maxHeight: 0.75,
    baseFee: 3.22,
  },
  large_standard: {
    name: "Large Standard", 
    maxWeight: 20,
    maxLength: 18,
    maxWidth: 14,
    maxHeight: 8,
    baseFee: 4.75,
    weightFee: 0.42, // per lb above 1 lb
  },
  small_oversize: {
    name: "Small Oversize",
    maxWeight: 70,
    maxLength: 60,
    maxWidth: 30,
    maxHeight: 30,
    baseFee: 9.73,
    weightFee: 0.42,
  },
  medium_oversize: {
    name: "Medium Oversize",
    maxWeight: 150,
    maxLength: 108,
    baseFee: 19.05,
    weightFee: 0.42,
  },
  large_oversize: {
    name: "Large Oversize",
    maxWeight: 150,
    maxLength: 108,
    baseFee: 89.98,
    weightFee: 0.83,
  },
  special_oversize: {
    name: "Special Oversize",
    maxWeight: 999,
    baseFee: 158.49,
    weightFee: 0.83,
  },
}

// Dimensional weight divisor
const DIM_WEIGHT_DIVISOR = 139

interface FormData {
  productName: string
  sellingPrice: number
  unitsPerDay: number
  category: string
  wholesalePrice: number
  shippingToAmazon: number
  tariffRate: number
  packagingCost: number
  referralFee: number
  fbaFee: number
  storageFee: number
  targetTacos: number
  productWeight: number
  productLength: number
  productWidth: number
  productHeight: number
  moq: number
  leadTime: number
}

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
  monthlyRevenue: number
  monthlyCogs: number
  monthlyAmazonFees: number
  monthlyAdSpend: number
  monthlyROI: number
  sizeTier: string
  estimatedFbaFee: number
  estimatedReferralFee: number
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

interface SavedScenario {
  id: string
  name: string
  formData: FormData
  calculation: CalculationResult
  savedAt: Date
}

// Calculate FBA fee based on dimensions and weight
function calculateFbaFee(weight: number, length: number, width: number, height: number): { fee: number; tier: string } {
  // Calculate dimensional weight
  const dimWeight = (length * width * height) / DIM_WEIGHT_DIVISOR
  const billableWeight = Math.max(weight, dimWeight)
  
  // Determine size tier
  const maxDim = Math.max(length, width, height)
  const girth = 2 * (width + height)
  const lengthPlusGirth = length + girth
  
  // Small Standard
  if (weight <= 0.75 && length <= 15 && width <= 12 && height <= 0.75) {
    return { fee: 3.22, tier: "Small Standard" }
  }
  
  // Large Standard
  if (weight <= 20 && length <= 18 && width <= 14 && height <= 8) {
    const baseFee = 4.75
    const additionalWeight = Math.max(0, billableWeight - 1)
    const fee = baseFee + (additionalWeight * 0.42)
    return { fee: Math.round(fee * 100) / 100, tier: "Large Standard" }
  }
  
  // Small Oversize
  if (weight <= 70 && lengthPlusGirth <= 130 && maxDim <= 60) {
    const baseFee = 9.73
    const additionalWeight = Math.max(0, billableWeight - 1)
    const fee = baseFee + (additionalWeight * 0.42)
    return { fee: Math.round(fee * 100) / 100, tier: "Small Oversize" }
  }
  
  // Medium Oversize
  if (weight <= 150 && lengthPlusGirth <= 130 && maxDim <= 108) {
    const baseFee = 19.05
    const additionalWeight = Math.max(0, billableWeight - 1)
    const fee = baseFee + (additionalWeight * 0.42)
    return { fee: Math.round(fee * 100) / 100, tier: "Medium Oversize" }
  }
  
  // Large Oversize
  if (weight <= 150 && lengthPlusGirth <= 165 && maxDim <= 108) {
    const baseFee = 89.98
    const additionalWeight = Math.max(0, billableWeight - 90)
    const fee = baseFee + (additionalWeight * 0.83)
    return { fee: Math.round(fee * 100) / 100, tier: "Large Oversize" }
  }
  
  // Special Oversize
  const baseFee = 158.49
  const additionalWeight = Math.max(0, billableWeight - 90)
  const fee = baseFee + (additionalWeight * 0.83)
  return { fee: Math.round(fee * 100) / 100, tier: "Special Oversize" }
}

const defaultFormData: FormData = {
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
}

export function ProfitCalculator() {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoCalculateFees, setAutoCalculateFees] = useState(true)
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [copied, setCopied] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

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
      productWeight,
      productLength,
      productWidth,
      productHeight,
    } = formData

    // Auto-calculate FBA fee if enabled
    const fbaResult = calculateFbaFee(productWeight, productLength, productWidth, productHeight)
    const actualFbaFee = autoCalculateFees ? fbaResult.fee : fbaFee
    const sizeTier = fbaResult.tier

    // Revenue calculation
    const revenue = sellingPrice

    // COGS breakdown
    const tariffCost = wholesalePrice * (tariffRate / 100)
    const totalCogs = wholesalePrice + shippingToAmazon + tariffCost + packagingCost

    // Amazon fees
    const referralFeeAmount = sellingPrice * (referralFee / 100)
    const totalAmazonFees = referralFeeAmount + actualFbaFee + storageFee

    // Advertising
    const advertisingCost = sellingPrice * (targetTacos / 100)

    // Net profit per unit
    const netProfit = revenue - totalCogs - totalAmazonFees - advertisingCost
    const margin = (netProfit / revenue) * 100
    const roi = totalCogs > 0 ? (netProfit / totalCogs) * 100 : 0

    // Break-even
    const fixedCosts = totalCogs + totalAmazonFees
    const breakEvenUnits = netProfit > 0 ? Math.ceil(fixedCosts / netProfit) : 0

    // Monthly calculations
    const monthlyUnits = unitsPerDay * 30
    const monthlyRevenue = revenue * monthlyUnits
    const monthlyCogs = totalCogs * monthlyUnits
    const monthlyAmazonFees = totalAmazonFees * monthlyUnits
    const monthlyAdSpend = advertisingCost * monthlyUnits
    const monthlyProfit = netProfit * monthlyUnits
    const annualProfit = monthlyProfit * 12
    const monthlyROI = monthlyCogs > 0 ? (monthlyProfit / monthlyCogs) * 100 : 0

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
      monthlyRevenue,
      monthlyCogs,
      monthlyAmazonFees,
      monthlyAdSpend,
      monthlyROI,
      sizeTier,
      estimatedFbaFee: fbaResult.fee,
      estimatedReferralFee: referralFeeAmount,
      costBreakdown: {
        wholesale: wholesalePrice,
        shipping: shippingToAmazon,
        tariffs: tariffCost,
        packaging: packagingCost,
        referralFee: referralFeeAmount,
        fbaFee: actualFbaFee,
        storageFee,
        advertising: advertisingCost,
      },
    }
  }, [formData, autoCalculateFees])

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
      referralFee: CATEGORY_FEES[category]?.referral || 15
    }))
  }

  const resetForm = () => {
    setFormData(defaultFormData)
  }

  // Save current scenario
  const saveScenario = useCallback(() => {
    if (savedScenarios.length >= 3) {
      alert("Maximum 3 scenarios. Please delete one to save a new one.")
      return
    }
    
    const newScenario: SavedScenario = {
      id: Date.now().toString(),
      name: formData.productName || `Scenario ${savedScenarios.length + 1}`,
      formData: { ...formData },
      calculation: { ...calculation },
      savedAt: new Date(),
    }
    
    setSavedScenarios(prev => [...prev, newScenario])
  }, [formData, calculation, savedScenarios.length])

  // Delete scenario
  const deleteScenario = useCallback((id: string) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== id))
  }, [])

  // Load scenario
  const loadScenario = useCallback((scenario: SavedScenario) => {
    setFormData(scenario.formData)
  }, [])

  // Generate summary text for sharing
  const generateSummary = useCallback(() => {
    return `
Deal Calculator Summary
=======================
Product: ${formData.productName || "Untitled Product"}
Category: ${CATEGORY_FEES[formData.category]?.label || formData.category}

PRICING & SALES
---------------
Selling Price: $${formData.sellingPrice.toFixed(2)}
Units/Day: ${formData.unitsPerDay}
Size Tier: ${calculation.sizeTier}

PER-UNIT ANALYSIS
-----------------
Revenue: $${calculation.revenue.toFixed(2)}
COGS: -$${calculation.cogs.toFixed(2)}
Amazon Fees: -$${calculation.amazonFees.toFixed(2)}
Advertising (${formData.targetTacos}% TACoS): -$${calculation.advertisingCost.toFixed(2)}
Net Profit: $${calculation.netProfit.toFixed(2)}
Margin: ${calculation.margin.toFixed(1)}%
ROI: ${calculation.roi.toFixed(1)}%

MONTHLY P&L SUMMARY
-------------------
Monthly Revenue: $${calculation.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly COGS: -$${calculation.monthlyCogs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly Amazon Fees: -$${calculation.monthlyAmazonFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly Ad Spend: -$${calculation.monthlyAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly Net Profit: $${calculation.monthlyProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Annual Net Profit: $${calculation.annualProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Monthly ROI: ${calculation.monthlyROI.toFixed(1)}%

FBA FEE BREAKDOWN
-----------------
Referral Fee (${formData.referralFee}%): $${calculation.estimatedReferralFee.toFixed(2)}
FBA Fulfillment: $${calculation.estimatedFbaFee.toFixed(2)}
Storage Fee: $${formData.storageFee.toFixed(2)}

Generated by MarketplaceBeta Deal Calculator
`.trim()
  }, [formData, calculation])

  // Copy to clipboard
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(generateSummary())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generateSummary])

  // Download as text file
  const downloadSummary = useCallback(() => {
    const blob = new Blob([generateSummary()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deal-calculator-${formData.productName || 'summary'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generateSummary, formData.productName])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="fba-estimator" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">FBA Fees</span>
          </TabsTrigger>
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Breakdown</span>
          </TabsTrigger>
          <TabsTrigger value="projections" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Projections</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            <span className="hidden sm:inline">Compare</span>
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
                        {Object.entries(CATEGORY_FEES).map(([key, { referral, label }]) => (
                          <SelectItem key={key} value={key}>
                            {label} ({referral}%)
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
                      <Label htmlFor="fbaFee" className="flex items-center gap-1">
                        FBA Fee / Unit ($)
                        {autoCalculateFees && (
                          <Badge variant="secondary" className="text-xs">Auto</Badge>
                        )}
                      </Label>
                      <Input
                        id="fbaFee"
                        type="number"
                        step="0.01"
                        value={autoCalculateFees ? calculation.estimatedFbaFee : formData.fbaFee}
                        onChange={(e) => handleInputChange("fbaFee", e.target.value)}
                        disabled={autoCalculateFees}
                        className={autoCalculateFees ? "bg-muted" : ""}
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
                    <CardTitle>Product Dimensions</CardTitle>
                    <CardDescription>Used for FBA fee estimation</CardDescription>
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
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Auto-calculate FBA fees from dimensions</span>
                        <Button 
                          variant={autoCalculateFees ? "default" : "outline"} 
                          size="sm"
                          onClick={() => setAutoCalculateFees(!autoCalculateFees)}
                        >
                          {autoCalculateFees ? "On" : "Off"}
                        </Button>
                      </div>
                      {autoCalculateFees && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Size Tier: {calculation.sizeTier} - Est. FBA Fee: ${calculation.estimatedFbaFee.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" className="flex-1">
                  {showAdvanced ? "Hide" : "Show"} Dimensions
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Reset
                </Button>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share or Export</DialogTitle>
                      <DialogDescription>
                        Copy the summary or download as a file
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50 max-h-64 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {generateSummary()}
                        </pre>
                      </div>
                      <div className="flex gap-3">
                        <Button onClick={copyToClipboard} className="flex-1">
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy to Clipboard
                            </>
                          )}
                        </Button>
                        <Button onClick={downloadSummary} variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Per-Unit Analysis
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
                      <p className={`text-2xl font-bold tabular-nums ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${calculation.netProfit.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-2xl font-bold tabular-nums ${marginStatus.textColor}`}>
                        {calculation.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue / Unit</span>
                      <span className="font-medium tabular-nums">${calculation.revenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total COGS / Unit</span>
                      <span className="font-medium text-red-500 tabular-nums">-${calculation.cogs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amazon Fees / Unit</span>
                      <span className="font-medium text-red-500 tabular-nums">-${calculation.amazonFees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Advertising / Unit</span>
                      <span className="font-medium text-red-500 tabular-nums">-${calculation.advertisingCost.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Profit / Unit</span>
                      <span className={`tabular-nums ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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
                            <p className="font-semibold tabular-nums">{calculation.roi.toFixed(1)}%</p>
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
                              Size Tier <Info className="h-3 w-3" />
                            </p>
                            <p className="font-semibold text-sm">{calculation.sizeTier}</p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Amazon FBA size tier based on dimensions</p>
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

                  {/* Save Scenario Button */}
                  <Button 
                    onClick={saveScenario} 
                    variant="outline" 
                    className="w-full"
                    disabled={savedScenarios.length >= 3}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Save Scenario ({savedScenarios.length}/3)
                  </Button>
                </CardContent>
              </Card>

              {/* Monthly P&L Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Monthly P&L Summary
                  </CardTitle>
                  <CardDescription>Based on {formData.unitsPerDay} units/day ({formData.unitsPerDay * 30} units/month)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Monthly Revenue</span>
                      <span className="font-semibold tabular-nums">${calculation.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Monthly COGS</span>
                      <span className="font-semibold text-red-500 tabular-nums">-${calculation.monthlyCogs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Monthly Amazon Fees</span>
                      <span className="font-semibold text-red-500 tabular-nums">-${calculation.monthlyAmazonFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span>Monthly Ad Spend ({formData.targetTacos}% TACoS)</span>
                      <span className="font-semibold text-red-500 tabular-nums">-${calculation.monthlyAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="font-semibold">Monthly Net Profit</span>
                      <span className={`text-xl font-bold tabular-nums ${calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        ${calculation.monthlyProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">Annualized Profit</p>
                        <p className={`font-bold tabular-nums ${calculation.annualProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          ${calculation.annualProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xs text-muted-foreground">Monthly ROI</p>
                        <p className={`font-bold tabular-nums ${calculation.monthlyROI >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {calculation.monthlyROI.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FBA Fee Estimator Tab */}
        <TabsContent value="fba-estimator" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  FBA Fee Estimator
                </CardTitle>
                <CardDescription>
                  Calculate Amazon FBA fees based on product category, weight, and dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product Category</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_FEES).map(([key, { referral, label }]) => (
                          <SelectItem key={key} value={key}>
                            {label} ({referral}% referral)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Weight (lbs)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.productWeight}
                      onChange={(e) => handleInputChange("productWeight", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Package Dimensions (inches)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Length</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productLength}
                          onChange={(e) => handleInputChange("productLength", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Width</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productWidth}
                          onChange={(e) => handleInputChange("productWidth", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Height</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.productHeight}
                          onChange={(e) => handleInputChange("productHeight", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Selling Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
                <CardDescription>Estimated Amazon fees for your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Size Tier</p>
                  <p className="text-xl font-bold">{calculation.sizeTier}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Referral Fee</p>
                      <p className="text-xs text-muted-foreground">{formData.referralFee}% of selling price</p>
                    </div>
                    <span className="font-semibold tabular-nums">${calculation.estimatedReferralFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">FBA Fulfillment Fee</p>
                      <p className="text-xs text-muted-foreground">Based on size & weight</p>
                    </div>
                    <span className="font-semibold tabular-nums">${calculation.estimatedFbaFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">Monthly Storage Fee</p>
                      <p className="text-xs text-muted-foreground">Per unit estimate</p>
                    </div>
                    <span className="font-semibold tabular-nums">${formData.storageFee.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="font-semibold">Total Amazon Fees</span>
                    <span className="text-xl font-bold text-amber-600 tabular-nums">
                      ${calculation.amazonFees.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Fee % of Selling Price</span>
                    <span className="font-semibold tabular-nums">
                      {((calculation.amazonFees / formData.sellingPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Dimensional Weight Info */}
                <div className="p-4 rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Dimensional Weight
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Amazon uses the greater of actual weight or dimensional weight.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Actual Weight</p>
                      <p className="font-medium">{formData.productWeight} lbs</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dim. Weight</p>
                      <p className="font-medium">
                        {((formData.productLength * formData.productWidth * formData.productHeight) / DIM_WEIGHT_DIVISOR).toFixed(2)} lbs
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Size Tier Reference */}
          <Card>
            <CardHeader>
              <CardTitle>FBA Size Tier Reference</CardTitle>
              <CardDescription>Standard FBA fulfillment fees by size tier (2024 rates)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Size Tier</th>
                      <th className="text-left p-3">Max Weight</th>
                      <th className="text-left p-3">Max Dimensions</th>
                      <th className="text-right p-3">Base Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Small Standard</td>
                      <td className="p-3">12 oz</td>
                      <td className="p-3">15" x 12" x 0.75"</td>
                      <td className="p-3 text-right tabular-nums">$3.22</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Large Standard</td>
                      <td className="p-3">20 lbs</td>
                      <td className="p-3">18" x 14" x 8"</td>
                      <td className="p-3 text-right tabular-nums">$4.75+</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Small Oversize</td>
                      <td className="p-3">70 lbs</td>
                      <td className="p-3">60" longest side, 130" L+G</td>
                      <td className="p-3 text-right tabular-nums">$9.73+</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Medium Oversize</td>
                      <td className="p-3">150 lbs</td>
                      <td className="p-3">108" longest side, 130" L+G</td>
                      <td className="p-3 text-right tabular-nums">$19.05+</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">Large Oversize</td>
                      <td className="p-3">150 lbs</td>
                      <td className="p-3">108" longest side, 165" L+G</td>
                      <td className="p-3 text-right tabular-nums">$89.98+</td>
                    </tr>
                    <tr className="hover:bg-muted/30">
                      <td className="p-3 font-medium">Special Oversize</td>
                      <td className="p-3">150+ lbs</td>
                      <td className="p-3">Over 108" or 165" L+G</td>
                      <td className="p-3 text-right tabular-nums">$158.49+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                L+G = Length + Girth (2 x Width + 2 x Height). Fees may vary; verify with Amazon Seller Central.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Breakdown Tab */}
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
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.wholesale.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Shipping to Amazon</span>
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Tariffs & Duties</span>
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.tariffs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Packaging & Prep</span>
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.packaging.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
                      <span>Total COGS</span>
                      <span className="tabular-nums">${calculation.cogs.toFixed(2)}</span>
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
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.referralFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>FBA Fulfillment Fee</span>
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.fbaFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-muted/30">
                      <span>Storage Fee (Monthly)</span>
                      <span className="font-medium tabular-nums">${calculation.costBreakdown.storageFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
                      <span>Total Amazon Fees</span>
                      <span className="tabular-nums">${calculation.amazonFees.toFixed(2)}</span>
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
                    <span className="font-medium tabular-nums">${calculation.costBreakdown.advertising.toFixed(2)}</span>
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
                          <span className="tabular-nums">{percentage.toFixed(1)}% (${item.value.toFixed(2)})</span>
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

                {/* Margin Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin</span>
                    <span className="tabular-nums">{calculation.margin.toFixed(1)}%</span>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projections Tab */}
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
                    <p className="text-xl font-bold tabular-nums">${(calculation.revenue * formData.unitsPerDay).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Daily Profit</p>
                    <p className={`text-xl font-bold tabular-nums ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${(calculation.netProfit * formData.unitsPerDay).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    <p className="text-xl font-bold tabular-nums">${calculation.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Profit</p>
                    <p className={`text-xl font-bold tabular-nums ${calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      ${calculation.monthlyProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Quarterly Projections</h4>
                    <div className="space-y-2">
                      {["Q1", "Q2", "Q3", "Q4"].map((quarter) => (
                        <div key={quarter} className="flex justify-between items-center p-3 rounded bg-muted/30">
                          <span>{quarter}</span>
                          <span className={`font-semibold tabular-nums ${calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            ${(calculation.monthlyProfit * 3).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                        <p className={`text-3xl font-bold tabular-nums ${calculation.annualProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          ${calculation.annualProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {(formData.unitsPerDay * 365).toLocaleString()} units/year
                        </p>
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
                  <p className="text-2xl font-bold tabular-nums">${(calculation.cogs * formData.moq).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formData.moq} units</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">Days to Sell MOQ</p>
                  <p className="text-2xl font-bold tabular-nums">{Math.ceil(formData.moq / formData.unitsPerDay)} days</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">MOQ Profit Potential</p>
                  <p className={`text-2xl font-bold tabular-nums ${calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    ${(calculation.netProfit * formData.moq).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
                <Separator />
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Investment ROI</p>
                  <p className="text-2xl font-bold text-emerald-500 tabular-nums">{calculation.roi.toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenario Comparison Tab */}
        <TabsContent value="compare" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                Scenario Comparison
              </CardTitle>
              <CardDescription>
                Save up to 3 product scenarios to compare side-by-side. Click "Save Scenario" in the Calculator tab to add scenarios here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedScenarios.length === 0 ? (
                <div className="text-center py-12">
                  <GitCompare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No Saved Scenarios</h3>
                  <p className="text-muted-foreground mb-4">
                    Go to the Calculator tab, configure a product, and click "Save Scenario" to add it here.
                  </p>
                  <Button variant="outline" onClick={() => {
                    const tabTrigger = document.querySelector('[value="calculator"]') as HTMLElement
                    tabTrigger?.click()
                  }}>
                    Go to Calculator
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Comparison Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Metric</th>
                          {savedScenarios.map((scenario) => (
                            <th key={scenario.id} className="text-center p-3 min-w-[150px]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium truncate flex-1">{scenario.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 flex-shrink-0"
                                  onClick={() => deleteScenario(scenario.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3 text-muted-foreground">Selling Price</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center font-medium tabular-nums">
                              ${s.formData.sellingPrice.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-muted-foreground">Units/Day</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center font-medium tabular-nums">
                              {s.formData.unitsPerDay}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-muted-foreground">COGS/Unit</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center font-medium tabular-nums">
                              ${s.calculation.cogs.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b bg-muted/30">
                          <td className="p-3 font-medium">Net Profit/Unit</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className={`p-3 text-center font-bold tabular-nums ${s.calculation.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              ${s.calculation.netProfit.toFixed(2)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b bg-muted/30">
                          <td className="p-3 font-medium">Margin</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className={`p-3 text-center font-bold tabular-nums ${s.calculation.margin >= 20 ? 'text-emerald-500' : s.calculation.margin >= 10 ? 'text-amber-500' : 'text-red-500'}`}>
                              {s.calculation.margin.toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-muted-foreground">Monthly Revenue</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center font-medium tabular-nums">
                              ${s.calculation.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b bg-primary/5">
                          <td className="p-3 font-medium">Monthly Profit</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className={`p-3 text-center font-bold tabular-nums ${s.calculation.monthlyProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              ${s.calculation.monthlyProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b bg-primary/5">
                          <td className="p-3 font-medium">Annual Profit</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className={`p-3 text-center font-bold tabular-nums ${s.calculation.annualProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                              ${s.calculation.annualProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="p-3 text-muted-foreground">ROI</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center font-medium tabular-nums">
                              {s.calculation.roi.toFixed(1)}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-3 text-muted-foreground">Size Tier</td>
                          {savedScenarios.map((s) => (
                            <td key={s.id} className="p-3 text-center text-xs">
                              {s.calculation.sizeTier}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {savedScenarios.map((scenario) => (
                      <Button
                        key={scenario.id}
                        variant="outline"
                        size="sm"
                        onClick={() => loadScenario(scenario)}
                      >
                        Load "{scenario.name}"
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
