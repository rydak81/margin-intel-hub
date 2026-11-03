import { isOperatorRelevant } from '@/lib/operator-editorial-policy'

/** Descriptive coverage research. This is never an adoption or sales index. */
export type ResearchRow = {
  id: string; title: string; source_url: string; source_name: string;
  published_at: string; relevant: boolean | null; relevance_score: number | null;
  category?: string | null;
}
export type ResearchInput = { asOf: string; days: number; complete: boolean; rows: ResearchRow[] }
const DAY = 86_400_000
const TOPICS = [
  { id: 'ai-agents', label: 'AI agents and agentic commerce', match: /\b(agentic|ai agents?|shopping agents?|agent commerce)\b/i },
  { id: 'fees-margins', label: 'Fees and margins', match: /\b(fees?|margins?|commissions?|surcharges?)\b/i },
  { id: 'fulfillment-returns', label: 'Fulfillment and returns', match: /\b(fulfil[l]?ment|shipping|logistics|returns?|delivery)\b/i },
  { id: 'advertising', label: 'Advertising and acquisition', match: /\b(advertising|ads?|retail media|acquisition cost|roas)\b/i },
] as const

function identity(raw: string): { url: string; source: string } | null {
  try {
    const url = new URL(raw)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    url.hash = ''
    for (const k of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(k)) url.searchParams.delete(k)
    }
    url.searchParams.sort()
    url.hostname = url.hostname.replace(/^www\./, '')
    url.pathname = url.pathname.replace(/\/$/, '') || '/'
    return { url: url.href, source: url.hostname }
  } catch { return null }
}

export function buildResearchBrief(input: ResearchInput) {
  const end = Date.parse(input.asOf)
  if (!Number.isFinite(end) || !/T.*Z$/.test(input.asOf)) throw new Error('asOf must be an explicit UTC timestamp')
  if (!Number.isInteger(input.days) || input.days < 7 || input.days > 90) throw new Error('days must be 7–90')
  if (!Array.isArray(input.rows)) throw new Error('rows must be an array')
  const boundary = end - input.days * DAY
  const start = boundary - input.days * DAY
  const omitted = { outsideWindow: 0, notEligible: 0, invalid: 0, duplicates: 0 }
  let usable: (ResearchRow & { time: number; source: string; url: string; period: 'current' | 'baseline' })[] = []
  // Earliest occurrence wins across both periods; input order cannot alter results.
  const sorted = [...input.rows].sort((a, b) => {
    const ta = Date.parse(a.published_at), tb = Date.parse(b.published_at)
    const tie = (r: ResearchRow) => JSON.stringify([r.id, r.source_url, r.title, r.relevant, r.relevance_score, r.category])
    return (Number.isFinite(ta) ? ta : Infinity) - (Number.isFinite(tb) ? tb : Infinity) || tie(a).localeCompare(tie(b))
  })
  for (const row of sorted) {
    const time = Date.parse(row.published_at)
    const link = identity(row.source_url)
    if (!Number.isFinite(time) || !row.id || !row.title?.trim() || !link) { omitted.invalid++; continue }
    if (time < start || time >= end) { omitted.outsideWindow++; continue }
    if (row.relevant !== true || typeof row.relevance_score !== 'number' || !Number.isFinite(row.relevance_score) || row.relevance_score < 40 || !isOperatorRelevant({ title: row.title, category: row.category ?? undefined })) {
      omitted.notEligible++; continue
    }
    usable.push({ ...row, time, ...link, period: time >= boundary ? 'current' : 'baseline' })
  }
  // Collapse connected duplicate groups. A discarded copy can link two
  // otherwise different records; greedy seen-key filtering misses that case.
  const parent = usable.map((_, i) => i), keys = new Map<string, number>()
  const root = (i: number): number => {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] }
    return i
  }
  usable.forEach((row, i) => {
    const title = row.title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
    for (const key of [`id:${row.id}`, `url:${row.url}`, `title:${title}`]) {
      const prev = keys.get(key)
      if (prev === undefined) keys.set(key, i)
      else { const a = root(i), b = root(prev); parent[Math.max(a, b)] = Math.min(a, b) }
    }
  })
  const unique = usable.filter((_, i) => root(i) === i)
  omitted.duplicates = usable.length - unique.length
  usable = unique
  const counts = new Map<string, { current: number; baseline: number }>()
  for (const row of usable) {
    const count = counts.get(row.source) ?? { current: 0, baseline: 0 }
    count[row.period]++; counts.set(row.source, count)
  }
  const sources = [...counts].filter(([, c]) => c.current >= 5 && c.baseline >= 5).map(([s]) => s).sort()
  const stable = usable.filter(r => sources.includes(r.source))
  const current = stable.filter(r => r.period === 'current')
  const baseline = stable.filter(r => r.period === 'baseline')
  const latest = usable.length ? Math.max(...usable.map(r => r.time)) : null
  const issues: string[] = []
  if (input.complete !== true) issues.push('Incomplete export: do not publish comparisons.')
  if (sources.length < 3) issues.push('Fewer than three sources with at least five eligible articles in each period.')
  if (current.length < 20 || baseline.length < 20) issues.push('Fewer than twenty comparable articles in a period.')
  if (latest === null || end - latest > 3 * DAY) issues.push('Latest eligible publication is more than seventy-two hours before the cutoff, or absent.')
  const retainedShare = usable.length ? stable.length / usable.length : null
  if (retainedShare === null || retainedShare < 0.7) issues.push('Matched sources cover less than seventy percent of eligible articles; source mix needs review.')
  const metrics = TOPICS.map(topic => {
    const cur = current.filter(r => topic.match.test(r.title)), base = baseline.filter(r => topic.match.test(r.title))
    const currentShare = current.length ? cur.length / current.length : null
    const baselineShare = baseline.length ? base.length / baseline.length : null
    const pooledChangePP = currentShare === null || baselineShare === null ? null : (currentShare - baselineShare) * 100
    const bySource = sources.map(source => {
      const c = counts.get(source)!
      return { source, currentN: c.current, baselineN: c.baseline,
        currentHits: cur.filter(r => r.source === source).length,
        baselineHits: base.filter(r => r.source === source).length }
    })
    const balancedChangePP = sources.length ? bySource.reduce((sum, s) => sum + s.currentHits / s.currentN - s.baselineHits / s.baselineN, 0) / sources.length * 100 : null
    const review = [...issues]
    if (cur.length < 5 || base.length < 5) review.push('Fewer than five matching headlines in a period; do not promote a directional trend.')
    if (pooledChangePP !== null && balancedChangePP !== null && Math.sign(pooledChangePP) !== Math.sign(balancedChangePP)) review.push('Pooled and source-balanced direction disagree.')
    return { id: topic.id, label: topic.label, currentHits: cur.length, currentN: current.length,
      baselineHits: base.length, baselineN: baseline.length, currentShare, baselineShare,
      pooledChangePP, balancedChangePP, bySource, review,
      status: review.length ? 'hold' as const : 'candidate' as const,
      evidence: [...cur, ...base].map(r => ({ id: r.id, url: r.url, source: r.source, publishedAt: r.published_at, period: r.period })) }
  })
  return {
    method: 'marketplacebeta-headline-coverage-v1', asOf: new Date(end).toISOString(),
    baseline: { from: new Date(start).toISOString(), toExclusive: new Date(boundary).toISOString() },
    current: { from: new Date(boundary).toISOString(), toExclusive: new Date(end).toISOString() },
    complete: input.complete === true, inputCount: input.rows.length, eligibleCount: usable.length,
    matchedSourceCount: sources.length, matchedArticleCount: stable.length, retainedShare,
    latestEligiblePublication: latest === null ? null : new Date(latest).toISOString(), omitted, issues, metrics,
    limitations: [
      'Measures keyword mentions in eligible news headlines, not AI adoption, transactions, demand, market share or business performance.',
      'Purposive source sample; no statistical significance or population inference. Topics can overlap.',
      'Exact normalized headlines and canonical URLs are deduplicated; paraphrased syndicated stories can remain.',
      'Matched domains reduce source entry/exit effects; editorial output and retrospective relevance labels can still change.',
      'Candidate means ready for source review, never permission to publish. Review primary sources and novelty before writing.',
    ],
  }
}
