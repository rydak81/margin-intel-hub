import { NextResponse } from 'next/server'
import { createAdminClient, hasAdminConfig } from '@/lib/supabase/admin'
import { callAIForJSON } from '@/lib/ai-client'
import { sanitizeAnalystOutput, type AnalystOutput } from '@/lib/analyst'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are the resident market analyst for MarketplaceBeta, an ecommerce intelligence service. You run once a day. You have persistent memory: what you write today, you will read tomorrow. You are accountable in public — your forecast indicator calls appear on the live scorecard.

Rules you never break:
- Evidence only. Every claim must trace to the coverage or memory you were given. Never invent statistics, events, or sources.
- A forecast check needs real evidence from today's coverage. When nothing in the coverage bears on a forecast, report signal "none" with an empty note. Do not stretch.
- Memory is for durable conclusions, not news summaries. Write an entry only when you learned something worth re-reading in a month. Most runs should write 0-2 entries.
- Correct yourself. When today's evidence contradicts one of your earlier memory entries, write a kind "correction" entry naming the superseded entry's exact title in supersedes_title and explaining what changed.
- Post-mortems: when a forecast in your context shows a resolved outcome that has no post_mortem in memory yet, write one (kind "post_mortem", related_forecasts set) analyzing what the original call got right or wrong and which signal was over- or under-weighted.`

function buildPrompt(input: {
  articles: { title: string; source: string; category: string | null; summary: string | null; publishedAt: string }[]
  forecasts: { id: number; statement: string; confirming: string; invalidating: string; resolveBy: string; outcome: string | null; outcomeNotes: string | null; lastSignal: string | null }[]
  memory: { kind: string; title: string; body: string; createdAt: string; relatedForecasts: number[] }[]
  postMortemCoveredIds: number[]
  lastAssessment: string | null
}) {
  return `## Today's classified coverage (last 48h, most relevant first)
${input.articles.map((a, i) => `${i + 1}. [${a.category ?? 'uncategorized'}] "${a.title}" (${a.source}, ${a.publishedAt.slice(0, 10)})${a.summary ? ` — ${a.summary}` : ''}`).join('\n') || '(none)'}

## Forecast ledger (check each OPEN one against today's coverage; resolved ones are context for post-mortems)
${input.forecasts.map((f) => `- id ${f.id}${f.outcome ? ` [RESOLVED: ${f.outcome}${f.outcomeNotes ? ` — ${f.outcomeNotes}` : ''}]` : ' [OPEN]'}: ${f.statement}
  Confirming: ${f.confirming} | Invalidating: ${f.invalidating} | Resolve by: ${f.resolveBy}${f.lastSignal ? ` | Your last signal: ${f.lastSignal}` : ''}`).join('\n')}

Forecasts that already have a post-mortem (never write another for these): ${input.postMortemCoveredIds.length ? input.postMortemCoveredIds.join(', ') : '(none yet)'}

## Your memory (most recent first; titles are exact for supersedes_title)
${input.memory.map((m) => `- [${m.kind}, ${m.createdAt.slice(0, 10)}${m.relatedForecasts.length ? `, forecasts ${m.relatedForecasts.join('/')}` : ''}] "${m.title}": ${m.body}`).join('\n') || '(empty — this is your first run)'}

## Your previous assessment
${input.lastAssessment ?? '(none — this is your first run)'}

Respond with ONLY a JSON object:
{
  "assessment": "120-200 words: what today's coverage means for ecommerce operators, in the context of your memory and open forecasts. Plain prose, no markdown.",
  "watchlist": [{"item": "short name", "why": "one sentence"}],  // up to 5, the developing stories that matter most
  "forecast_checks": [{"id": <open forecast id>, "signal": "confirming"|"invalidating"|"mixed"|"none", "note": "evidence, <=40 words, empty when signal is none"}],  // one per OPEN forecast
  "memory": [{"kind": "observation"|"hypothesis"|"correction"|"post_mortem", "title": "...", "body": "...", "confidence": "low"|"medium"|"high", "related_forecasts": [ids], "source_titles": ["exact article titles used"], "supersedes_title": "exact earlier title (corrections only)"}]  // 0-4 entries
}`
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!hasAdminConfig()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createAdminClient()
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

    const [articlesRes, forecastsRes, memoryRes, postMortemRes, postMortemCoverageRes, lastRunRes] = await Promise.all([
      supabase
        .from('articles')
        .select('title, source_name, category, ai_summary, summary, published_at')
        .gte('published_at', since)
        .eq('relevant', true)
        .gte('relevance_score', 50)
        .order('relevance_score', { ascending: false })
        .limit(40),
      supabase
        .from('intel_forecasts')
        .select('id, statement, confirming_indicators, invalidating_indicators, resolve_by, outcome, outcome_notes, indicator_signal')
        .order('id', { ascending: true }),
      supabase
        .from('intel_memory')
        .select('id, kind, title, body, created_at, related_forecasts')
        .is('superseded_by', null)
        .order('created_at', { ascending: false })
        .limit(14),
      // Post-mortems must never scroll out of the recency window: the agent
      // uses them to avoid duplicating one and as context for future calls.
      // Prose is bounded to the 30 most recent; coverage (which forecasts
      // already have one) is computed from the full unbounded set below.
      supabase
        .from('intel_memory')
        .select('id, kind, title, body, created_at, related_forecasts')
        .eq('kind', 'post_mortem')
        .is('superseded_by', null)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('intel_memory')
        .select('related_forecasts')
        .eq('kind', 'post_mortem')
        .is('superseded_by', null),
      supabase
        .from('intel_analyst_runs')
        .select('assessment')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    // A run made without its required context would publish an assessment based
    // on nothing and overwrite live indicator reads, so any failed query aborts
    // before the model is called or any state is written.
    const contextErrors = [
      articlesRes.error && `articles: ${articlesRes.error.message}`,
      forecastsRes.error && `forecasts: ${forecastsRes.error.message}`,
      memoryRes.error && `memory: ${memoryRes.error.message}`,
      postMortemRes.error && `post-mortems: ${postMortemRes.error.message}`,
      postMortemCoverageRes.error && `post-mortem coverage: ${postMortemCoverageRes.error.message}`,
      lastRunRes.error && `last run: ${lastRunRes.error.message}`,
    ].filter(Boolean)
    if (contextErrors.length) {
      return NextResponse.json({ error: `Context queries failed — run aborted: ${contextErrors.join('; ')}` }, { status: 500 })
    }
    const articles = articlesRes.data
    const forecasts = forecastsRes.data
    const seen = new Set((memoryRes.data ?? []).map((m) => m.id))
    const memoryRows = [...(memoryRes.data ?? []), ...(postMortemRes.data ?? []).filter((m) => !seen.has(m.id))]
    const lastRun = lastRunRes.data

    if (!forecasts?.length) {
      return NextResponse.json({ error: 'No forecasts in ledger — nothing to analyze against' }, { status: 500 })
    }

    const openIds = forecasts.filter((f) => !f.outcome).map((f) => Number(f.id))
    const allIds = forecasts.map((f) => Number(f.id))
    const prompt = buildPrompt({
      articles: (articles ?? []).map((a) => ({
        title: a.title,
        source: a.source_name,
        category: a.category,
        summary: a.ai_summary || a.summary,
        publishedAt: a.published_at,
      })),
      forecasts: forecasts.map((f) => ({
        id: Number(f.id),
        statement: f.statement,
        confirming: f.confirming_indicators,
        invalidating: f.invalidating_indicators,
        resolveBy: f.resolve_by,
        outcome: f.outcome,
        outcomeNotes: f.outcome_notes,
        lastSignal: f.indicator_signal,
      })),
      memory: (memoryRows ?? []).map((m) => ({ kind: m.kind, title: m.title, body: m.body, createdAt: m.created_at, relatedForecasts: m.related_forecasts ?? [] })),
      postMortemCoveredIds: [...new Set((postMortemCoverageRes.data ?? []).flatMap((m) => m.related_forecasts ?? []))].sort((a, b) => a - b),
      lastAssessment: lastRun?.assessment ?? null,
    })

    const { data: rawOutput, provider, model } = await callAIForJSON<AnalystOutput>({
      prompt,
      systemPrompt: SYSTEM_PROMPT,
      maxTokens: 3000,
    })

    const output = sanitizeAnalystOutput(rawOutput, openIds, allIds)
    if (!output) {
      return NextResponse.json({ error: 'Analyst output failed validation', raw: String(JSON.stringify(rawOutput)).slice(0, 300) }, { status: 500 })
    }

    // Every open forecast is reviewed every run, as the public page states:
    // one the model omitted gets an explicit 'none' check so its reviewed-at
    // timestamp still advances.
    const checkedIds = new Set(output.forecast_checks.map((c) => c.id))
    for (const id of openIds) {
      if (!checkedIds.has(id)) output.forecast_checks.push({ id, signal: 'none', note: '' })
    }

    // Persist the run first so memory rows can reference it.
    const runDate = new Date().toISOString().slice(0, 10)
    const { data: run, error: runError } = await supabase
      .from('intel_analyst_runs')
      .insert({
        run_date: runDate,
        assessment: output.assessment,
        watchlist: output.watchlist,
        forecast_checks: output.forecast_checks,
        articles_considered: articles?.length ?? 0,
        memory_written: output.memory.length,
        provider,
        model,
      })
      .select('id')
      .single()
    if (runError || !run) {
      return NextResponse.json({ error: `Failed to persist run: ${runError?.message}` }, { status: 500 })
    }

    // Memory entries; sources resolved from the exact article titles the model cited.
    const articleByTitle = new Map((articles ?? []).map((a) => [a.title, a]))
    let memorySaved = 0
    let supersessionsFailed = 0
    for (const entry of output.memory) {
      // A correction must name a real, still-active entry: without a target
      // it is not persisted, and the shortfall marks the run partial below.
      if (entry.kind === 'correction') {
        const hasTarget = !!entry.supersedes_title && (memoryRows ?? []).some((m) => m.title === entry.supersedes_title)
        if (!hasTarget) {
          console.error(`[Analyst] Correction "${entry.title}" names no existing entry (supersedes_title: ${entry.supersedes_title ?? 'missing'}) — skipped`)
          continue
        }
      }
      const { data: inserted, error: memError } = await supabase
        .from('intel_memory')
        .insert({
          kind: entry.kind,
          title: entry.title,
          body: entry.body,
          confidence: entry.confidence,
          related_forecasts: entry.related_forecasts.length ? entry.related_forecasts : null,
          // Evidence-only: a cited title that matches no supplied article is
          // dropped rather than stored as an untraceable source.
          sources: (() => {
            const matched = entry.source_titles
              .map((t) => {
                const a = articleByTitle.get(t)
                return a ? { title: t, source_name: a.source_name, published_at: a.published_at } : null
              })
              .filter(Boolean)
            if (matched.length < entry.source_titles.length) {
              console.warn(`[Analyst] Dropped ${entry.source_titles.length - matched.length} uncited source title(s) on "${entry.title}"`)
            }
            return matched.length ? matched : null
          })(),
          run_id: run.id,
        })
        .select('id')
        .single()
      if (memError || !inserted) {
        console.error('[Analyst] Failed to write memory entry:', memError?.message)
        continue
      }
      memorySaved++
      // A correction supersedes the earlier entry it names. If that update
      // fails, both the obsolete entry and its correction would stay active,
      // so the failure counts against the run.
      if (entry.kind === 'correction' && entry.supersedes_title) {
        const target = (memoryRows ?? []).find((m) => m.title === entry.supersedes_title)
        if (target) {
          const { error: supersedeError } = await supabase.from('intel_memory').update({ superseded_by: inserted.id }).eq('id', target.id)
          if (supersedeError) {
            console.error('[Analyst] Failed to supersede corrected entry:', supersedeError.message)
            supersessionsFailed++
          }
        }
      }
    }

    // Indicator status on open forecasts. 'none' still stamps the check time
    // so the scorecard can say when each forecast was last reviewed.
    let checksApplied = 0
    const checksFailed: number[] = []
    for (const check of output.forecast_checks) {
      const { error: checkError } = await supabase
        .from('intel_forecasts')
        .update({
          indicator_signal: check.signal,
          indicator_note: check.signal === 'none' ? null : check.note || null,
          indicators_checked_at: new Date().toISOString(),
        })
        .eq('id', check.id)
        .is('outcome', null)
      if (checkError) {
        console.error(`[Analyst] Failed to update forecast ${check.id}:`, checkError.message)
        checksFailed.push(check.id)
      } else checksApplied++
    }

    // A run that could not stamp every open forecast is a failure for
    // monitoring purposes, even though the assessment and memory persisted.
    if (checksFailed.length || memorySaved < output.memory.length || supersessionsFailed > 0) {
      return NextResponse.json({
        success: false,
        error: 'Partial run: some writes failed',
        runDate,
        forecastChecksApplied: checksApplied,
        forecastChecksFailed: checksFailed,
        memoryWritten: memorySaved,
        memoryExpected: output.memory.length,
        supersessionsFailed,
      }, { status: 500 })
    }

    console.log(`[Analyst] Run complete: ${articles?.length ?? 0} articles, ${checksApplied} forecast checks, ${memorySaved} memory entries (${provider})`)
    return NextResponse.json({
      success: true,
      runDate,
      articlesConsidered: articles?.length ?? 0,
      forecastChecks: checksApplied,
      memoryWritten: memorySaved,
      watchlist: output.watchlist.length,
      provider,
      model,
    })
  } catch (error) {
    console.error('Analyst run error:', error)
    return NextResponse.json({ error: 'Analyst run failed', details: String(error) }, { status: 500 })
  }
}
