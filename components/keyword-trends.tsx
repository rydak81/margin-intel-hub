"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Minus,
  BarChart3, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Plus,
  X,
  Clock,
  Target,
  Zap,
  LineChart,
  Globe,
  ShoppingCart
} from "lucide-react"

interface KeywordData {
  keyword: string
  searchVolume: number
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  competition: 'low' | 'medium' | 'high'
  cpc: number
  relevance: number
  indexed: boolean
  rank?: number
  category: string
  seasonality: string
}

// Simulated keyword database
const generateKeywordData = (baseKeyword: string): KeywordData[] => {
  const variations = [
    { suffix: "", multiplier: 1 },
    { suffix: " for men", multiplier: 0.6 },
    { suffix: " for women", multiplier: 0.55 },
    { suffix: " with", multiplier: 0.4 },
    { suffix: " best", multiplier: 0.8 },
    { suffix: " cheap", multiplier: 0.3 },
    { suffix: " premium", multiplier: 0.25 },
    { suffix: " 2024", multiplier: 0.45 },
    { suffix: " amazon", multiplier: 0.35 },
    { suffix: " reviews", multiplier: 0.5 },
    { suffix: " near me", multiplier: 0.2 },
    { suffix: " online", multiplier: 0.3 },
    { suffix: " sale", multiplier: 0.4 },
    { suffix: " discount", multiplier: 0.25 },
    { suffix: " waterproof", multiplier: 0.35 },
  ]

  const categories = ["Main Keyword", "Long-tail", "Brand Related", "Feature", "Intent"]
  const seasonalities = ["Year-round", "Holiday", "Summer", "Winter", "Back-to-school"]
  
  const baseVolume = Math.floor(Math.random() * 50000) + 10000

  return variations.map((v, i) => {
    const volume = Math.floor(baseVolume * v.multiplier * (0.8 + Math.random() * 0.4))
    const trendOptions: ('up' | 'down' | 'stable')[] = ['up', 'down', 'stable']
    const competitionOptions: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']
    
    return {
      keyword: baseKeyword + v.suffix,
      searchVolume: volume,
      trend: trendOptions[Math.floor(Math.random() * 3)],
      trendPercent: Math.floor(Math.random() * 50) - 10,
      competition: competitionOptions[Math.floor(Math.random() * 3)],
      cpc: Number((Math.random() * 3 + 0.5).toFixed(2)),
      relevance: Math.floor(Math.random() * 40) + 60,
      indexed: Math.random() > 0.3,
      rank: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 1 : undefined,
      category: categories[i % categories.length],
      seasonality: seasonalities[Math.floor(Math.random() * seasonalities.length)]
    }
  }).sort((a, b) => b.searchVolume - a.searchVolume)
}

interface TrendData {
  month: string
  volume: number
}

const generateTrendData = (): TrendData[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const baseVolume = 50000
  
  return months.map((month, i) => ({
    month,
    volume: Math.floor(baseVolume * (0.7 + Math.random() * 0.6) * (1 + Math.sin(i / 2) * 0.3))
  }))
}

export function KeywordTrends() {
  const [searchQuery, setSearchQuery] = useState("")
  const [trackedKeywords, setTrackedKeywords] = useState<string[]>([
    "wireless earbuds",
    "bluetooth headphones",
    "noise cancelling"
  ])
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null)
  const [filterCompetition, setFilterCompetition] = useState<string>("all")
  const [filterTrend, setFilterTrend] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("volume")
  const [keywordData, setKeywordData] = useState<KeywordData[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [isClient, setIsClient] = useState(false)

  // Only generate random data on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && searchQuery.trim()) {
      setKeywordData(generateKeywordData(searchQuery.trim()))
    } else if (!searchQuery.trim()) {
      setKeywordData([])
    }
  }, [searchQuery, isClient])

  useEffect(() => {
    if (isClient) {
      setTrendData(generateTrendData())
    }
  }, [selectedKeyword, isClient])

  const filteredData = useMemo(() => {
    let data = [...keywordData]
    
    if (filterCompetition !== "all") {
      data = data.filter(k => k.competition === filterCompetition)
    }
    
    if (filterTrend !== "all") {
      data = data.filter(k => k.trend === filterTrend)
    }
    
    switch (sortBy) {
      case "volume":
        data.sort((a, b) => b.searchVolume - a.searchVolume)
        break
      case "competition":
        const compOrder = { low: 0, medium: 1, high: 2 }
        data.sort((a, b) => compOrder[a.competition] - compOrder[b.competition])
        break
      case "cpc":
        data.sort((a, b) => b.cpc - a.cpc)
        break
      case "relevance":
        data.sort((a, b) => b.relevance - a.relevance)
        break
    }
    
    return data
  }, [keywordData, filterCompetition, filterTrend, sortBy])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getCompetitionBadge = (competition: string) => {
    switch (competition) {
      case 'low': return <Badge className="bg-emerald-500 text-white">Low</Badge>
      case 'medium': return <Badge className="bg-amber-500 text-white">Medium</Badge>
      case 'high': return <Badge className="bg-red-500 text-white">High</Badge>
      default: return null
    }
  }

  const addToTracked = (keyword: string) => {
    if (!trackedKeywords.includes(keyword)) {
      setTrackedKeywords([...trackedKeywords, keyword])
    }
  }

  const removeFromTracked = (keyword: string) => {
    setTrackedKeywords(trackedKeywords.filter(k => k !== keyword))
  }

  const exportData = () => {
    const csv = [
      ["Keyword", "Search Volume", "Trend", "Competition", "CPC", "Relevance", "Indexed", "Rank"],
      ...filteredData.map(k => [
        k.keyword,
        k.searchVolume,
        k.trend,
        k.competition,
        k.cpc,
        k.relevance + "%",
        k.indexed ? "Yes" : "No",
        k.rank || "-"
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "keyword-data.csv"
    a.click()
  }

  // Summary stats
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null
    
    const totalVolume = filteredData.reduce((sum, k) => sum + k.searchVolume, 0)
    const avgCpc = filteredData.reduce((sum, k) => sum + k.cpc, 0) / filteredData.length
    const upTrending = filteredData.filter(k => k.trend === 'up').length
    const lowCompetition = filteredData.filter(k => k.competition === 'low').length
    
    return { totalVolume, avgCpc, upTrending, lowCompetition }
  }, [filteredData])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="research" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keyword Research
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Index Tracking
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Search Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="research" className="space-y-6 mt-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter a seed keyword (e.g., wireless earbuds, yoga mat, kitchen knife)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-2xl font-bold">{stats.totalVolume.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trending Up</p>
                      <p className="text-2xl font-bold">{stats.upTrending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <ShoppingCart className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg CPC</p>
                      <p className="text-2xl font-bold">${stats.avgCpc.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Zap className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Low Competition</p>
                      <p className="text-2xl font-bold">{stats.lowCompetition}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Results */}
          {filteredData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Keyword Suggestions</CardTitle>
                    <CardDescription>{filteredData.length} keywords found</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={filterCompetition} onValueChange={setFilterCompetition}>
                      <SelectTrigger className="w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Competition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Competition</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterTrend} onValueChange={setFilterTrend}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Trend" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Trends</SelectItem>
                        <SelectItem value="up">Trending Up</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="down">Trending Down</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="cpc">CPC</SelectItem>
                        <SelectItem value="relevance">Relevance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-right">Search Volume</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="text-center">Competition</TableHead>
                        <TableHead className="text-right">CPC</TableHead>
                        <TableHead className="text-center">Relevance</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((kw, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{kw.keyword}</span>
                              <Badge variant="outline" className="text-xs">
                                {kw.category}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {kw.searchVolume.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {getTrendIcon(kw.trend)}
                              <span className={`text-sm ${kw.trend === 'up' ? 'text-emerald-500' : kw.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {kw.trendPercent > 0 ? '+' : ''}{kw.trendPercent}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getCompetitionBadge(kw.competition)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${kw.cpc.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={kw.relevance} className="h-2 w-16" />
                              <span className="text-sm text-muted-foreground">{kw.relevance}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addToTracked(kw.keyword)}
                                disabled={trackedKeywords.includes(kw.keyword)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedKeyword(kw.keyword)}
                              >
                                <LineChart className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {searchQuery && filteredData.length === 0 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No keywords found</h3>
                  <p className="text-muted-foreground">
                    Try a different search term or adjust your filters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!searchQuery && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Your Keyword Research</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter a seed keyword to discover related search terms, volume data, and trends
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["wireless earbuds", "yoga mat", "kitchen knife", "phone case"].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Keyword Index Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor your product&apos;s ranking for target keywords
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        id="keyword-input"
                        placeholder="Add keyword to track..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            addToTracked(e.currentTarget.value.trim())
                            e.currentTarget.value = ''
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('keyword-input') as HTMLInputElement
                          if (input && input.value.trim()) {
                            addToTracked(input.value.trim())
                            input.value = ''
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="text-center">Indexed</TableHead>
                            <TableHead className="text-center">Rank</TableHead>
                            <TableHead className="text-center">Change</TableHead>
                            <TableHead className="text-right">Last Checked</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trackedKeywords.map((keyword) => {
                            const isIndexed = Math.random() > 0.3
                            const rank = isIndexed ? Math.floor(Math.random() * 100) + 1 : null
                            const change = Math.floor(Math.random() * 20) - 10
                            
                            return (
                              <TableRow key={keyword}>
                                <TableCell className="font-medium">{keyword}</TableCell>
                                <TableCell className="text-center">
                                  {isIndexed ? (
                                    <Badge className="bg-emerald-500 text-white">Indexed</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-red-500 border-red-500">Not Indexed</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {rank ? (
                                    <span className="font-semibold">#{rank}</span>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {rank && (
                                    <div className="flex items-center justify-center gap-1">
                                      {change > 0 ? (
                                        <>
                                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                          <span className="text-emerald-500">+{change}</span>
                                        </>
                                      ) : change < 0 ? (
                                        <>
                                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                                          <span className="text-red-500">{change}</span>
                                        </>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-sm">
                                  <div className="flex items-center justify-end gap-1">
                                    <Clock className="h-3 w-3" />
                                    2 hours ago
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromTracked(keyword)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Index Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Total Tracked</p>
                    <p className="text-3xl font-bold">{trackedKeywords.length}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-center">
                      <p className="text-xs text-muted-foreground">Indexed</p>
                      <p className="text-xl font-bold text-emerald-500">
                        {Math.floor(trackedKeywords.length * 0.7)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 text-center">
                      <p className="text-xs text-muted-foreground">Not Indexed</p>
                      <p className="text-xl font-bold text-red-500">
                        {Math.ceil(trackedKeywords.length * 0.3)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Rank</span>
                      <span className="font-medium">#42</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Page 1 Keywords</span>
                      <span className="font-medium text-emerald-500">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Improved This Week</span>
                      <span className="font-medium text-emerald-500">+5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Add keywords to your listing title and bullets to improve indexing</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Use backend search terms for variations and misspellings</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Track ranking changes weekly to measure optimization impact</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Search Volume Trends
                  </CardTitle>
                  <CardDescription>
                    {selectedKeyword || "Select a keyword to view trends"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Simple bar chart visualization */}
                  <div className="h-64 flex items-end gap-2">
                    {trendData.map((data, i) => {
                      const maxVolume = Math.max(...trendData.map(d => d.volume))
                      const height = (data.volume / maxVolume) * 100
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{data.month}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                    <span>Search volume over the past 12 months</span>
                    <span>Peak: {Math.max(...trendData.map(d => d.volume)).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Regional Interest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { region: "United States", interest: 100 },
                      { region: "United Kingdom", interest: 78 },
                      { region: "Canada", interest: 65 },
                      { region: "Australia", interest: 52 },
                      { region: "Germany", interest: 45 },
                    ].map((item) => (
                      <div key={item.region} className="flex items-center gap-4">
                        <span className="w-32 text-sm">{item.region}</span>
                        <div className="flex-1">
                          <Progress value={item.interest} className="h-2" />
                        </div>
                        <span className="w-12 text-sm text-right text-muted-foreground">{item.interest}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Trend Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-500">Rising</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Search interest has increased 23% compared to last year
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Seasonality</h4>
                    <p className="text-sm text-muted-foreground">
                      Peak months: November, December
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Low months: February, March
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Related Rising Queries</h4>
                    <div className="space-y-1">
                      {["best wireless earbuds 2024", "earbuds with noise cancelling", "earbuds for running"].map((query) => (
                        <div key={query} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate">{query}</span>
                          <Badge variant="outline" className="text-emerald-500 border-emerald-500">
                            +120%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Keyword Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { keyword: "wireless earbuds pro", score: 95 },
                      { keyword: "bluetooth 5.0 earbuds", score: 88 },
                      { keyword: "waterproof earbuds", score: 82 },
                      { keyword: "earbuds with mic", score: 76 },
                    ].map((item) => (
                      <div key={item.keyword} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <span className="text-sm">{item.keyword}</span>
                        <Badge variant="outline">{item.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
