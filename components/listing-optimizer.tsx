"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Lightbulb, 
  Target, 
  Search, 
  ImageIcon,
  Star,
  TrendingUp,
  Zap,
  Copy,
  RefreshCw
} from "lucide-react"

interface ListingAnalysis {
  titleScore: number
  bulletScore: number
  descriptionScore: number
  keywordScore: number
  overallScore: number
  issues: { type: 'error' | 'warning' | 'success'; message: string; field: string }[]
  suggestions: string[]
  keywordDensity: Record<string, number>
}

const POWER_WORDS = [
  "premium", "professional", "upgraded", "enhanced", "advanced",
  "durable", "lightweight", "portable", "versatile", "ergonomic",
  "waterproof", "rechargeable", "adjustable", "eco-friendly", "organic",
  "handmade", "authentic", "original", "genuine", "certified"
]

const BANNED_PHRASES = [
  "best seller", "#1", "top rated", "free shipping", "guarantee",
  "limited time", "sale", "discount", "cheap", "lowest price"
]

export function ListingOptimizer() {
  const [listing, setListing] = useState({
    title: "",
    bullet1: "",
    bullet2: "",
    bullet3: "",
    bullet4: "",
    bullet5: "",
    description: "",
    searchTerms: "",
    targetKeywords: ""
  })

  const analysis = useMemo((): ListingAnalysis => {
    const issues: ListingAnalysis['issues'] = []
    const suggestions: string[] = []
    
    // Title Analysis
    let titleScore = 0
    const titleLength = listing.title.length
    
    if (titleLength === 0) {
      issues.push({ type: 'error', message: 'Title is required', field: 'title' })
    } else {
      if (titleLength >= 80 && titleLength <= 200) {
        titleScore += 40
      } else if (titleLength > 0 && titleLength < 80) {
        titleScore += 20
        issues.push({ type: 'warning', message: `Title is too short (${titleLength}/200 chars). Aim for 80-200 characters.`, field: 'title' })
        suggestions.push("Expand your title with more descriptive keywords and product features")
      } else if (titleLength > 200) {
        titleScore += 15
        issues.push({ type: 'warning', message: `Title exceeds 200 characters (${titleLength})`, field: 'title' })
      }
      
      // Check for power words
      const titleLower = listing.title.toLowerCase()
      const foundPowerWords = POWER_WORDS.filter(word => titleLower.includes(word))
      if (foundPowerWords.length > 0) {
        titleScore += 20
        issues.push({ type: 'success', message: `Great use of power words: ${foundPowerWords.join(', ')}`, field: 'title' })
      } else {
        suggestions.push("Add power words like 'Premium', 'Professional', or 'Upgraded' to your title")
      }
      
      // Check for banned phrases
      const foundBanned = BANNED_PHRASES.filter(phrase => titleLower.includes(phrase))
      if (foundBanned.length > 0) {
        titleScore -= 20
        issues.push({ type: 'error', message: `Remove prohibited phrases: ${foundBanned.join(', ')}`, field: 'title' })
      }
      
      // Check capitalization
      const words = listing.title.split(' ')
      const properlyCapitalized = words.filter(w => w.length > 0 && w[0] === w[0].toUpperCase()).length
      if (properlyCapitalized / words.length >= 0.7) {
        titleScore += 20
      } else {
        issues.push({ type: 'warning', message: 'Capitalize the first letter of each major word', field: 'title' })
      }
      
      // Brand first check
      if (listing.title.split(' ')[0]?.length >= 2) {
        titleScore += 20
        issues.push({ type: 'success', message: 'Title starts with brand name - good practice', field: 'title' })
      }
    }

    // Bullet Points Analysis
    let bulletScore = 0
    const bullets = [listing.bullet1, listing.bullet2, listing.bullet3, listing.bullet4, listing.bullet5]
    const filledBullets = bullets.filter(b => b.trim().length > 0)
    
    if (filledBullets.length === 5) {
      bulletScore += 30
      issues.push({ type: 'success', message: 'All 5 bullet points are filled', field: 'bullets' })
    } else if (filledBullets.length >= 3) {
      bulletScore += 15
      issues.push({ type: 'warning', message: `Only ${filledBullets.length}/5 bullet points used`, field: 'bullets' })
      suggestions.push("Fill all 5 bullet points to maximize listing visibility")
    } else {
      issues.push({ type: 'error', message: 'Add more bullet points (minimum 3 recommended)', field: 'bullets' })
    }
    
    // Check bullet length
    const bulletLengths = filledBullets.map(b => b.length)
    const avgBulletLength = bulletLengths.reduce((a, b) => a + b, 0) / filledBullets.length || 0
    
    if (avgBulletLength >= 150 && avgBulletLength <= 250) {
      bulletScore += 30
      issues.push({ type: 'success', message: 'Bullet points have optimal length', field: 'bullets' })
    } else if (avgBulletLength < 150 && avgBulletLength > 0) {
      bulletScore += 15
      suggestions.push("Expand bullet points with more details (aim for 150-250 characters each)")
    }
    
    // Check for benefits vs features
    const benefitWords = ['you', 'your', 'enjoy', 'experience', 'perfect for', 'ideal for', 'great for']
    const hasBenefits = filledBullets.some(b => benefitWords.some(w => b.toLowerCase().includes(w)))
    if (hasBenefits) {
      bulletScore += 20
      issues.push({ type: 'success', message: 'Bullets include customer benefits', field: 'bullets' })
    } else {
      suggestions.push("Focus on customer benefits, not just features (use 'you' and 'your')")
    }
    
    // All caps check
    const hasAllCaps = filledBullets.some(b => {
      const firstWord = b.split(' ')[0] || ''
      return firstWord.length > 3 && firstWord === firstWord.toUpperCase()
    })
    if (hasAllCaps) {
      bulletScore += 10
      issues.push({ type: 'success', message: 'Using caps for emphasis in bullets', field: 'bullets' })
    }

    // Description Analysis
    let descriptionScore = 0
    const descLength = listing.description.length
    
    if (descLength >= 1000) {
      descriptionScore += 40
      issues.push({ type: 'success', message: 'Description has optimal length', field: 'description' })
    } else if (descLength >= 500) {
      descriptionScore += 25
      issues.push({ type: 'warning', message: `Description could be longer (${descLength}/2000 chars)`, field: 'description' })
    } else if (descLength > 0) {
      descriptionScore += 10
      suggestions.push("Expand your description to at least 1000 characters for better SEO")
    } else {
      issues.push({ type: 'error', message: 'Description is required', field: 'description' })
    }
    
    // HTML formatting check
    if (listing.description.includes('<br>') || listing.description.includes('<b>') || listing.description.includes('<ul>')) {
      descriptionScore += 20
      issues.push({ type: 'success', message: 'Using HTML formatting for readability', field: 'description' })
    } else if (descLength > 0) {
      suggestions.push("Use HTML tags like <b>, <br>, and <ul> to format your description")
    }
    
    // Keyword density
    const allText = `${listing.title} ${bullets.join(' ')} ${listing.description}`.toLowerCase()
    const targetKws = listing.targetKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0)
    
    let keywordScore = 0
    const keywordDensity: Record<string, number> = {}
    
    targetKws.forEach(kw => {
      const regex = new RegExp(kw, 'gi')
      const matches = allText.match(regex)
      const count = matches ? matches.length : 0
      keywordDensity[kw] = count
      
      if (count >= 3) {
        keywordScore += 20
      } else if (count >= 1) {
        keywordScore += 10
      }
    })
    
    if (targetKws.length > 0) {
      keywordScore = Math.min(keywordScore, 100)
      const missingKws = targetKws.filter(kw => (keywordDensity[kw] || 0) === 0)
      if (missingKws.length > 0) {
        suggestions.push(`Add these keywords to your listing: ${missingKws.join(', ')}`)
      }
    }
    
    // Search terms analysis
    const searchTermsLength = listing.searchTerms.length
    if (searchTermsLength > 0 && searchTermsLength <= 250) {
      keywordScore += 20
      issues.push({ type: 'success', message: 'Backend search terms are optimized', field: 'searchTerms' })
    } else if (searchTermsLength > 250) {
      keywordScore -= 10
      issues.push({ type: 'error', message: 'Search terms exceed 250 bytes limit', field: 'searchTerms' })
    }

    // Calculate overall score
    const scores = [titleScore, bulletScore, descriptionScore, keywordScore]
    const validScores = scores.filter(s => s > 0)
    const overallScore = validScores.length > 0 
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0

    return {
      titleScore: Math.min(Math.max(titleScore, 0), 100),
      bulletScore: Math.min(Math.max(bulletScore, 0), 100),
      descriptionScore: Math.min(Math.max(descriptionScore, 0), 100),
      keywordScore: Math.min(Math.max(keywordScore, 0), 100),
      overallScore: Math.min(Math.max(overallScore, 0), 100),
      issues,
      suggestions,
      keywordDensity
    }
  }, [listing])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-green-500"
    if (score >= 40) return "text-amber-500"
    return "text-red-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Excellent", className: "bg-emerald-500" }
    if (score >= 60) return { label: "Good", className: "bg-green-500" }
    if (score >= 40) return { label: "Fair", className: "bg-amber-500" }
    return { label: "Poor", className: "bg-red-500" }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearAll = () => {
    setListing({
      title: "",
      bullet1: "",
      bullet2: "",
      bullet3: "",
      bullet4: "",
      bullet5: "",
      description: "",
      searchTerms: "",
      targetKeywords: ""
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Listing Editor
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Product Title
                    </span>
                    <Badge className={getScoreBadge(analysis.titleScore).className + " text-white"}>
                      {analysis.titleScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Optimize your title with brand, keywords, and key features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Brand Name - Product Type - Key Feature - Size/Color/Quantity"
                    value={listing.title}
                    onChange={(e) => setListing({ ...listing, title: e.target.value })}
                    className="min-h-20"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{listing.title.length} / 200 characters</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(listing.title)}
                      className="h-6"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <Progress value={(listing.title.length / 200) * 100} className="h-2" />
                </CardContent>
              </Card>

              {/* Bullet Points */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Bullet Points
                    </span>
                    <Badge className={getScoreBadge(analysis.bulletScore).className + " text-white"}>
                      {analysis.bulletScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Highlight key features and benefits (start with caps for emphasis)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const bulletKey = `bullet${num}` as keyof typeof listing
                    const bulletValue = listing[bulletKey]
                    return (
                      <div key={num} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-6 w-6 flex items-center justify-center rounded-full p-0">
                            {num}
                          </Badge>
                          <Textarea
                            placeholder={`Bullet point ${num} - Start with key benefit in CAPS`}
                            value={bulletValue}
                            onChange={(e) => setListing({ ...listing, [bulletKey]: e.target.value })}
                            className="min-h-16"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                          {bulletValue.length} / 500 characters
                        </p>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Product Description
                    </span>
                    <Badge className={getScoreBadge(analysis.descriptionScore).className + " text-white"}>
                      {analysis.descriptionScore}/100
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    A+ Content alternative - supports basic HTML
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Write a compelling product description. Use HTML tags like <b>bold</b>, <br> for line breaks, and <ul><li> for lists..."
                    value={listing.description}
                    onChange={(e) => setListing({ ...listing, description: e.target.value })}
                    className="min-h-40"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{listing.description.length} / 2000 characters</span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setListing({ ...listing, description: listing.description + '<br>' })}
                        className="h-6 text-xs"
                      >
                        + Line Break
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setListing({ ...listing, description: listing.description + '<b></b>' })}
                        className="h-6 text-xs"
                      >
                        + Bold
                      </Button>
                    </div>
                  </div>
                  <Progress value={(listing.description.length / 2000) * 100} className="h-2" />
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Keywords & Search Terms
                    </span>
                    <Badge className={getScoreBadge(analysis.keywordScore).className + " text-white"}>
                      {analysis.keywordScore}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Keywords (comma separated)</Label>
                    <Input
                      placeholder="wireless earbuds, bluetooth headphones, noise cancelling"
                      value={listing.targetKeywords}
                      onChange={(e) => setListing({ ...listing, targetKeywords: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your main keywords to track density across your listing
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Backend Search Terms (250 bytes max)</Label>
                    <Textarea
                      placeholder="alternative spellings, synonyms, related terms (no commas needed)"
                      value={listing.searchTerms}
                      onChange={(e) => setListing({ ...listing, searchTerms: e.target.value })}
                      className="min-h-20"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{new Blob([listing.searchTerms]).size} / 250 bytes</span>
                      <span className={new Blob([listing.searchTerms]).size > 250 ? 'text-red-500' : ''}>
                        {new Blob([listing.searchTerms]).size > 250 && "Over limit!"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center">Listing Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}
                    </div>
                    <p className="text-sm text-muted-foreground">out of 100</p>
                  </div>
                  <Progress value={analysis.overallScore} className="h-3" />
                  
                  <div className="space-y-2 pt-2">
                    {[
                      { label: "Title", score: analysis.titleScore },
                      { label: "Bullets", score: analysis.bulletScore },
                      { label: "Description", score: analysis.descriptionScore },
                      { label: "Keywords", score: analysis.keywordScore },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className={`font-medium ${getScoreColor(item.score)}`}>
                          {item.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={clearAll}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear All Fields
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => {
                    const fullListing = `TITLE:\n${listing.title}\n\nBULLET POINTS:\n• ${listing.bullet1}\n• ${listing.bullet2}\n• ${listing.bullet3}\n• ${listing.bullet4}\n• ${listing.bullet5}\n\nDESCRIPTION:\n${listing.description}`
                    copyToClipboard(fullListing)
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Full Listing
                  </Button>
                </CardContent>
              </Card>

              {/* Keyword Density */}
              {Object.keys(analysis.keywordDensity).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Keyword Density</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(analysis.keywordDensity).map(([keyword, count]) => (
                        <div key={keyword} className="flex justify-between items-center text-sm">
                          <span className="truncate max-w-32">{keyword}</span>
                          <Badge variant={count >= 3 ? "default" : count >= 1 ? "secondary" : "outline"}>
                            {count}x
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Issues & Feedback
                </CardTitle>
                <CardDescription>
                  Address these items to improve your listing score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.issues.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Start typing to see feedback
                  </p>
                ) : (
                  analysis.issues.map((issue, i) => (
                    <Alert key={i} variant={issue.type === 'error' ? 'destructive' : 'default'}>
                      {issue.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {issue.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      {issue.type === 'error' && <XCircle className="h-4 w-4" />}
                      <AlertDescription className="ml-2">
                        <span className="text-xs text-muted-foreground uppercase">{issue.field}</span>
                        <p className="text-sm">{issue.message}</p>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Optimization Suggestions
                </CardTitle>
                <CardDescription>
                  Recommendations to boost your listing performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Your listing looks great!
                    </p>
                  </div>
                ) : (
                  analysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <Star className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Amazon Listing Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Title", tips: ["Start with brand name", "Include main keywords", "80-200 characters", "Capitalize major words"] },
                    { title: "Bullets", tips: ["All 5 bullets filled", "150-250 chars each", "Start with CAPS", "Focus on benefits"] },
                    { title: "Description", tips: ["1000+ characters", "Use HTML formatting", "Include keywords naturally", "Tell your brand story"] },
                    { title: "Keywords", tips: ["250 byte limit", "No commas needed", "Include misspellings", "Add synonyms"] },
                  ].map((section) => (
                    <div key={section.title} className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-semibold mb-2">{section.title}</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {section.tips.map((tip, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Amazon Listing Preview</CardTitle>
              <CardDescription>
                Approximate preview of how your listing will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-background">
                <div className="max-w-3xl mx-auto">
                  {/* Title */}
                  <h1 className="text-xl font-medium text-blue-600 hover:text-orange-500 hover:underline cursor-pointer mb-4">
                    {listing.title || "Your Product Title Will Appear Here"}
                  </h1>
                  
                  {/* Rating placeholder */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-blue-600">1,234 ratings</span>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Price placeholder */}
                  <div className="mb-4">
                    <span className="text-2xl font-medium">$XX.XX</span>
                  </div>
                  
                  {/* Bullets */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About this item</h3>
                    <ul className="space-y-2">
                      {[listing.bullet1, listing.bullet2, listing.bullet3, listing.bullet4, listing.bullet5]
                        .filter(b => b.trim())
                        .map((bullet, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-muted-foreground">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      {![listing.bullet1, listing.bullet2, listing.bullet3, listing.bullet4, listing.bullet5].some(b => b.trim()) && (
                        <li className="text-muted-foreground text-sm">Your bullet points will appear here...</li>
                      )}
                    </ul>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Product Description</h3>
                    <div 
                      className="text-sm prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: listing.description || "<p class='text-muted-foreground'>Your product description will appear here...</p>" 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
