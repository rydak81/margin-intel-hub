import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, CheckCircle2, Handshake, Layers3, Target, Users } from "lucide-react"
import { SponsorLogo } from "@/components/SponsorLogo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ALL_SPONSORS, getModuleTypeLabel } from "@/lib/sponsors"

export default function PartnersPage() {
  const featuredSponsor = ALL_SPONSORS.find((sponsor) => sponsor.id === "threecolts") || ALL_SPONSORS[0]

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        <section className="relative overflow-hidden rounded-[2rem] border bg-[radial-gradient(circle_at_top_left,rgba(29,78,216,0.16),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] p-6 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.4)] md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full uppercase tracking-[0.18em]">Partner Marketplace</Badge>
                <Badge variant="outline" className="rounded-full uppercase tracking-[0.18em]">Built for agencies, operators, and seller teams</Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
                  A curated partner hub for marketplace growth teams.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  MarketplaceBeta can become more than a news site. This partner marketplace positions trusted tools and ecosystem partners as operator resources,
                  helping you turn industry content into partner conversations, better outreach, and stronger qualified leads.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Target, label: "Qualified sponsor positioning" },
                  { icon: Handshake, label: "Agency-focused partner story" },
                  { icon: Layers3, label: "Useful operator tooling context" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border bg-white/70 p-4 shadow-sm">
                    <item.icon className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-sm font-semibold">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <a href={featuredSponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
                    Explore Threecolts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/solutions">Request a Partner Introduction</Link>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl">
              <CardContent className="grid gap-0 p-0">
                <div className="relative min-h-[260px]">
                  {featuredSponsor.bannerImageUrl ? (
                    <Image
                      src={featuredSponsor.bannerImageUrl}
                      alt={featuredSponsor.bannerImageAlt || featuredSponsor.name}
                      fill
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-cover"
                      style={{ objectPosition: featuredSponsor.imageFocus?.["top-banner"] || "center center" }}
                      priority
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Featured Partner</p>
                    <h2 className="text-2xl font-bold">{featuredSponsor.name}</h2>
                    <p className="text-sm text-white/80">{featuredSponsor.proofPoint}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Users,
              title: "For agencies",
              text: "Use partner modules as warm, relevant conversation starters for account growth and outbound campaigns.",
            },
            {
              icon: Building2,
              title: "For operators",
              text: "Turn market coverage into action with tools and partner options that map to the problem in the article.",
            },
            {
              icon: CheckCircle2,
              title: "For MarketplaceBeta",
              text: "Create a premium lead engine that connects content, partner trust, and operator-grade recommendations.",
            },
          ].map((item) => (
            <Card key={item.title} className="border shadow-sm">
              <CardContent className="p-5">
                <item.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-14">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Trusted Tools and Partners</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Partner recommendations that look like a resource, not ad inventory</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Each sponsor module is framed around operator use cases, relevant audiences, and why the tool matters in the context of marketplace news and decisions.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {ALL_SPONSORS.map((sponsor) => (
              <Card key={sponsor.id} className="overflow-hidden border shadow-sm">
                <CardContent className="grid gap-0 p-0 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[240px] border-b bg-slate-100 md:border-b-0 md:border-r">
                    {sponsor.bannerImageUrl ? (
                      <Image
                        src={sponsor.bannerImageUrl}
                        alt={sponsor.bannerImageAlt || sponsor.name}
                        fill
                        sizes="(min-width: 1024px) 420px, 100vw"
                        className="object-cover"
                        style={{ objectPosition: sponsor.imageFocus?.inline || "center center" }}
                      />
                    ) : sponsor.logoUrl ? (
                      <div className="relative h-full w-full">
                        <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain p-10" sizes="320px" />
                      </div>
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{getModuleTypeLabel(sponsor.moduleType)}</p>
                      <p className="mt-2 text-sm text-white/85">{sponsor.trustLabel}</p>
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{sponsor.badge}</Badge>
                      <Badge variant="outline">{sponsor.partnerType}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <SponsorLogo
                        name={sponsor.name}
                        logoUrl={sponsor.logoUrl}
                        sizes="56px"
                        className="h-14 w-14 rounded-xl"
                        fallbackClassName="text-sm"
                      />
                      <CardHeader className="p-0">
                        <CardTitle className="text-2xl">{sponsor.name}</CardTitle>
                      </CardHeader>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-balance">{sponsor.tagline}</p>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{sponsor.description}</p>
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-xl border bg-muted/30 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Proof Point</p>
                        <p className="text-sm font-medium">{sponsor.proofPoint}</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Use Case</p>
                        <p className="text-sm font-medium">{sponsor.useCase}</p>
                      </div>
                      <div className="rounded-xl border bg-muted/30 p-3">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Why This Sponsor Is Relevant</p>
                        <p className="text-sm font-medium">{sponsor.whyRelevant}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sponsor.highlights.map((highlight) => (
                        <Badge key={highlight} variant="outline" className="rounded-full">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild>
                        <a href={sponsor.ctaUrl} target="_blank" rel="noopener noreferrer sponsored">
                          {sponsor.ctaText}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/solutions">Request Intro</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
