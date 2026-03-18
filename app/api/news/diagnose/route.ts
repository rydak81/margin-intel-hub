import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/news/diagnose
// Health check that tells you EXACTLY why AI summarization is or isn't working.
// Returns a full status report covering:
//   1. Environment variables (API keys present/missing)
//   2. Supabase connectivity
//   3. Database column existence (migrations run?)
//   4. Article counts (unclassified, classified, total)
//   5. A live AI test call (verifies the Anthropic key actually works)
export async function GET() {
  const report: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  const checks = report.checks as Record<string, unknown>

  // ── 1. Environment variables ──────────────────────────────────────────────
  checks.env = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ set' : '❌ MISSING — AI classification will not run',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ MISSING',
    CRON_SECRET: process.env.CRON_SECRET ? '✅ set' : '⚠️ not set (cron endpoints are open — fine for testing)',
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY ? '✅ set' : '⚠️ not set (image fallback will use category stock photos)',
    NEWS_API_KEY: process.env.NEWS_API_KEY ? '✅ set' : '⚠️ not set (NewsAPI aggregation disabled)',
  }

  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY

  if (!hasSupabase) {
    checks.supabase = { status: '❌ Cannot connect — env vars missing' }
    checks.database = { status: '❌ Skipped' }
    checks.articles = { status: '❌ Skipped' }
  } else {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── 2. Supabase connectivity ────────────────────────────────────────────
    try {
      const { error } = await supabase.from('articles').select('id').limit(1)
      checks.supabase = error
        ? { status: `❌ Connection failed: ${error.message}` }
        : { status: '✅ Connected' }
    } catch (e) {
      checks.supabase = { status: `❌ Exception: ${String(e)}` }
    }

    // ── 3. Database column existence (migrations run?) ──────────────────────
    const columnsToCheck = [
      // Base schema (script 003)
      { col: 'ai_summary', migration: 'base (003)' },
      { col: 'action_item', migration: 'base (003)' },
      { col: 'key_stat', migration: 'base (003)' },
      { col: 'impact_detail', migration: 'base (003)' },
      { col: 'full_content', migration: 'base (003)' },
      // Migration 004
      { col: 'our_take', migration: '004_phase3_deep_insights.sql' },
      { col: 'what_this_means', migration: '004_phase3_deep_insights.sql' },
      { col: 'key_takeaways', migration: '004_phase3_deep_insights.sql' },
      { col: 'related_context', migration: '004_phase3_deep_insights.sql' },
      { col: 'image_source', migration: '004_phase3_deep_insights.sql' },
      { col: 'og_image_url', migration: '004_phase3_deep_insights.sql' },
      // Migration 005
      { col: 'bottom_line', migration: '005_phase5_bottom_line.sql' },
    ]

    const columnStatus: Record<string, string> = {}
    const missingMigrations = new Set<string>()

    for (const { col, migration } of columnsToCheck) {
      try {
        // Try to read the column — if it doesn't exist Supabase returns an error
        const { error } = await supabase
          .from('articles')
          .select(col)
          .limit(1)

        if (error && (error.message.includes('column') || error.message.includes('does not exist'))) {
          columnStatus[col] = `❌ MISSING — run script: ${migration}`
          missingMigrations.add(migration)
        } else {
          columnStatus[col] = `✅ exists`
        }
      } catch {
        columnStatus[col] = `⚠️ check failed`
      }
    }

    checks.database = {
      columns: columnStatus,
      missing_migrations: missingMigrations.size > 0
        ? [...missingMigrations].map(m => `Run /scripts/${m} in Supabase SQL editor`)
        : 'none — all migrations applied ✅',
      diagnosis: missingMigrations.size > 0
        ? `❌ CRITICAL: Missing columns will cause the classify UPDATE to fail entirely, including ai_summary. Run the migration scripts listed above in your Supabase SQL editor.`
        : '✅ All required columns present',
    }

    // ── 4. Article counts ───────────────────────────────────────────────────
    try {
      const { count: total } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })

      const { count: unclassified } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .is('ai_summary', null)

      const { count: classified } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .not('ai_summary', 'is', null)

      const { count: missingOurTake } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .not('ai_summary', 'is', null)
        .is('our_take', null)

      checks.articles = {
        total: total ?? 'unknown',
        with_ai_summary: classified ?? 'unknown',
        missing_ai_summary: unclassified ?? 'unknown',
        have_summary_but_no_our_take: missingOurTake ?? 'unknown',
        diagnosis: (unclassified ?? 0) > 0
          ? `⚠️ ${unclassified} articles are waiting for AI classification. Trigger /api/news/classify to process them.`
          : (total ?? 0) === 0
          ? '⚠️ No articles in database. Trigger /api/news/aggregate first.'
          : '✅ All articles have AI summaries',
      }
    } catch (e) {
      checks.articles = { status: `❌ Count query failed: ${String(e)}` }
    }
  }

  // ── 5. Live Anthropic API test ────────────────────────────────────────────
  if (!hasAnthropic) {
    checks.ai_test = {
      status: '❌ Skipped — ANTHROPIC_API_KEY not set',
      fix: 'Add ANTHROPIC_API_KEY to your Vercel environment variables (Settings → Environment Variables), then redeploy.',
    }
  } else {
    try {
      const start = Date.now()
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Reply with only: {"ok":true}' }],
        }),
        signal: AbortSignal.timeout(10000),
      })

      const latency = Date.now() - start

      if (response.ok) {
        checks.ai_test = {
          status: `✅ Anthropic API working (${latency}ms)`,
          model: 'claude-haiku-4-5-20251001',
        }
      } else {
        const text = await response.text()
        checks.ai_test = {
          status: `❌ Anthropic API returned ${response.status}`,
          details: text.substring(0, 200),
          fix: response.status === 401
            ? 'Invalid API key — check ANTHROPIC_API_KEY in Vercel env vars'
            : response.status === 429
            ? 'Rate limited — wait a few minutes and try again'
            : 'Check Anthropic status page',
        }
      }
    } catch (e) {
      checks.ai_test = {
        status: `❌ API call failed: ${String(e)}`,
        fix: 'Check network connectivity or Anthropic service status',
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const criticalIssues: string[] = []
  if (!hasAnthropic) criticalIssues.push('ANTHROPIC_API_KEY not set')
  if (!hasSupabase) criticalIssues.push('Supabase env vars not set')

  report.summary = criticalIssues.length > 0
    ? { status: '❌ BROKEN', critical_issues: criticalIssues }
    : { status: '✅ All systems operational — check individual checks above for warnings' }

  return NextResponse.json(report, { status: 200 })
}
