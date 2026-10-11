export type GuideScenario = 'product-profitability' | 'break-even-advertising' | 'adding-a-marketplace'
function calculateScenario(kind: GuideScenario, v: Record<string, number>) {
  if (Object.values(v).some(n => !Number.isFinite(n) || n < 0)) return null
  if (kind === 'product-profitability') {
    const { price, costs, orders, overhead } = v
    if (!(price > 0) || ![costs, orders, overhead].every(Number.isFinite)) return null
    const contribution = price - costs
    return { contribution, margin: contribution / price * 100, monthly: contribution * orders - overhead }
  }
  if (kind === 'break-even-advertising') {
    const { price, costs, retain, conversion } = v
    if (!(price > 0) || ![costs, retain, conversion].every(Number.isFinite) || conversion > 100) return null
    const beforeAds = price - costs
    const budget = beforeAds - retain
    return { beforeAds, budget, acos: budget / price * 100, roas: budget > 0 ? price / budget : null, cpc: budget * conversion / 100 }
  }
  const { contribution, fixed, orders, displaced, existing } = v
  if (![contribution, fixed, orders, displaced, existing].every(Number.isFinite) || displaced > orders) return null
  return { breakEvenOrders: contribution > 0 ? Math.ceil(fixed / contribution) : null, monthly: contribution * orders - fixed - displaced * existing }
}

export function calculateGuideScenario(kind: GuideScenario, values: Record<string, number>) {
  const result = calculateScenario(kind, values)
  return result && Object.values(result).every(value => value === null || value === undefined || Number.isFinite(value)) ? result : null
}
