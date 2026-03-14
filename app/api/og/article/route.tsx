import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Ecom Intel Hub'
  const category = searchParams.get('category') || 'platform_updates'
  const source = searchParams.get('source') || ''

  const categoryStyles: Record<string, { bg: string; accent: string; icon: string; label: string }> = {
    breaking:             { bg: '#1a0505', accent: '#DC2626', icon: '!', label: 'BREAKING' },
    market_metrics:       { bg: '#051a1a', accent: '#0891B2', icon: '#', label: 'MARKET DATA' },
    platform_updates:     { bg: '#050d1a', accent: '#2563EB', icon: '*', label: 'PLATFORM' },
    'platform-updates':   { bg: '#050d1a', accent: '#2563EB', icon: '*', label: 'PLATFORM' },
    profitability:        { bg: '#051a0d', accent: '#059669', icon: '$', label: 'PROFITABILITY' },
    mergers_acquisitions: { bg: '#0f051a', accent: '#7C3AED', icon: '&', label: 'M&A' },
    tools_technology:     { bg: '#051519', accent: '#0EA5E9', icon: '+', label: 'TOOLS' },
    'tools-technology':   { bg: '#051519', accent: '#0EA5E9', icon: '+', label: 'TOOLS' },
    advertising:          { bg: '#1a0f05', accent: '#EA580C', icon: '@', label: 'ADVERTISING' },
    logistics:            { bg: '#0f1015', accent: '#475569', icon: '>', label: 'LOGISTICS' },
    'seller-operations':  { bg: '#0f1015', accent: '#475569', icon: '>', label: 'OPERATIONS' },
    events:               { bg: '#1a0510', accent: '#DB2777', icon: '*', label: 'EVENTS' },
    tactics:              { bg: '#1a1505', accent: '#CA8A04', icon: '?', label: 'TACTICS' },
    'strategy-tactics':   { bg: '#1a1505', accent: '#CA8A04', icon: '?', label: 'TACTICS' },
    'market-trends':      { bg: '#051a1a', accent: '#0891B2', icon: '^', label: 'TRENDS' },
    'compliance-policy':  { bg: '#0f051a', accent: '#7C3AED', icon: '!', label: 'POLICY' },
    platform:             { bg: '#050d1a', accent: '#2563EB', icon: '*', label: 'PLATFORM' },
    market:               { bg: '#051a1a', accent: '#0891B2', icon: '^', label: 'MARKET' },
    tools:                { bg: '#051519', accent: '#0EA5E9', icon: '+', label: 'TOOLS' },
  }

  const style = categoryStyles[category] || categoryStyles.platform_updates

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          background: `linear-gradient(145deg, ${style.bg} 0%, #0A0F1C 40%, #0A0F1C 100%)`,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: style.accent,
              color: 'white',
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{style.icon}</span>
            {style.label}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            color: '#F1F5F9',
            fontSize: title.length > 70 ? '32px' : '40px',
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            maxHeight: '180px',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {title.length > 100 ? title.substring(0, 97) + '...' : title}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#64748B', fontSize: '18px', display: 'flex' }}>{source}</div>
          <div style={{ color: '#00D4AA', fontSize: '22px', fontWeight: 700, display: 'flex' }}>
            ECOM INTEL HUB
          </div>
        </div>
      </div>
    ),
    { width: 800, height: 420 }
  )
}
