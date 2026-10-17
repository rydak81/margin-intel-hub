/**
 * Public forecast ledger, Edition 1 (October 2026 Intelligence Dossier).
 *
 * Text and indicators are copied verbatim from
 * public/intelligence/dossier-2026-10.html (Section 5, "The forecast ledger, Edition 1").
 * The production ledger lives in an intel_forecasts table that the app does not read yet;
 * this file is the public source of truth until it does. Forecast probabilities are internal
 * only and are deliberately not stored here, so nothing public can render them.
 *
 * resolveBy: the dossier gives horizons, not calendar dates, except where the forecast text
 * or methodology names one. `resolveByBasis` records which. Horizon-derived dates use the end
 * of the horizon window measured from the October 2026 edition.
 *
 * To score a forecast, set status to 'hit' or 'miss' and fill resolvedOn + resolutionNote.
 */

export type ForecastStatus = 'open' | 'hit' | 'miss'
export type ForecastHorizon = '0–3m' | '3–6m' | '6–12m' | '12–24m'

export interface Forecast {
  id: string
  edition: string
  horizon: ForecastHorizon
  statement: string
  indicators: string
  resolveBy: string
  resolveByBasis: 'stated' | 'horizon'
  status: ForecastStatus
  resolvedOn?: string
  resolutionNote?: string
}

export const FORECAST_EDITION = { id: '2026-10', label: 'Edition 1 · October 2026', loggedOn: '2026-10-14' } as const

const E = FORECAST_EDITION.id

export const FORECASTS: Forecast[] = [
  { id: 'F1', edition: E, horizon: '0–3m', statement: 'US online holiday sales (Nov 1–Dec 31) grow ≥6% YoY', indicators: 'Adobe/Salesforce weekly trackers; Census Q4 · Invalidated by UMich <44 + parcel disruption', resolveBy: '2027-01-31', resolveByBasis: 'stated', status: 'open' },
  { id: 'F2', edition: E, horizon: '0–3m', statement: 'Effective Q4 residential parcel cost inflation for DTC sellers lands ≥8% despite 5.9% GRIs', indicators: 'Carrier surcharge tables; shipper invoices · Invalidated by surcharge rollbacks', resolveBy: '2027-01-31', resolveByBasis: 'stated', status: 'open' },
  { id: 'F3', edition: E, horizon: '0–3m', statement: 'AI-referred retail traffic at least doubles YoY during Cyber Week, and its conversion premium stays ≥25%', indicators: 'Adobe holiday telemetry · Invalidated if premium compresses below 25% as volume scales', resolveBy: '2027-01-31', resolveByBasis: 'stated', status: 'open' },
  { id: 'F4', edition: E, horizon: '0–3m', statement: 'TikTok Shop US full-year 2026 GMV ≥ $20B', indicators: 'Momentum Works / eMarketer updates · Invalidated by post-divestiture operational disruption', resolveBy: '2027-01-31', resolveByBasis: 'stated', status: 'open' },
  { id: 'F5', edition: E, horizon: '3–6m', statement: "Amazon's 2027 US fee announcement contains no headline referral increase but raises net cost via surcharge/restructure layering", indicators: 'Seller Central fee notice (expected Dec–Jan) · Invalidated by a flat, surcharge-free schedule', resolveBy: '2027-04-30', resolveByBasis: 'horizon', status: 'open' },
  { id: 'F6', edition: E, horizon: '3–6m', statement: 'Walmart extends fee-cut or WFS-incentive playbook to additional categories to sustain >40% marketplace growth', indicators: 'Seller Center policy updates; Q3/Q4 FY27 prints · Invalidated by fee increases', resolveBy: '2027-04-30', resolveByBasis: 'horizon', status: 'open' },
  { id: 'F7', edition: E, horizon: '3–6m', statement: 'At least one additional top-10 US marketplace (Amazon excluded) signs a formal agent-access integration (UCP, ACP successor, or equivalent)', indicators: "Platform announcements · Invalidated by industry-wide agent blocking following Amazon's lead", resolveBy: '2027-04-30', resolveByBasis: 'horizon', status: 'open' },
  { id: 'F8', edition: E, horizon: '6–12m', statement: 'US average effective tariff rate moves ≥2 points (either direction) from ~10.9% within 12 months', indicators: 'Yale Budget Lab series · Invalidated by 12 months of rate stability', resolveBy: '2027-10-14', resolveByBasis: 'stated', status: 'open' },
  { id: 'F9', edition: E, horizon: '6–12m', statement: 'Used/refurbished smartphone unit growth again outpaces new in 2026 full-year data (IDC direction: ~5.8% vs ~1%)', indicators: 'IDC/Counterpoint annuals · Invalidated by new-unit resurgence on an upgrade supercycle', resolveBy: '2027-10-31', resolveByBasis: 'horizon', status: 'open' },
  { id: 'F10', edition: E, horizon: '12–24m', statement: 'De minimis is not restored before the statutory repeal (Jul 2027) takes effect', indicators: 'Federal Register / CBP · Invalidated by Congressional reversal', resolveBy: '2027-07-01', resolveByBasis: 'stated', status: 'open' },
  { id: 'F11', edition: E, horizon: '12–24m', statement: "Consolidated multichannel operation (one console + one fulfillment network serving ≥3 channels) becomes the default stack for new multichannel sellers, with Amazon's offering a top-2 provider", indicators: 'Seller surveys; MCF adoption disclosures · Invalidated by antitrust action or seller boycott of cross-channel data sharing', resolveBy: '2028-10-31', resolveByBasis: 'horizon', status: 'open' },
  { id: 'F12', edition: E, horizon: '12–24m', statement: 'Agentic commerce exceeds 2% of US e-commerce sessions by October 2027', indicators: 'Adobe/Contentsquare session-share data · Invalidated by platform-wide agent blocking or consumer disinterest', resolveBy: '2027-10-31', resolveByBasis: 'stated', status: 'open' },
]

export interface ForecastScore {
  total: number
  open: number
  hits: number
  misses: number
  resolved: number
}

/** Scoring is a plain hit/miss count over resolved forecasts. */
export function scoreForecasts(forecasts: readonly Forecast[] = FORECASTS): ForecastScore {
  const resolved = forecasts.filter(f => f.status !== 'open')
  const hits = resolved.filter(f => f.status === 'hit').length
  return {
    total: forecasts.length,
    open: forecasts.length - resolved.length,
    hits,
    misses: resolved.length - hits,
    resolved: resolved.length,
  }
}
