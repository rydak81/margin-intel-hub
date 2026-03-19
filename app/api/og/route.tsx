import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'MarketplaceBeta'
  const category = searchParams.get('category') || ''
  const impact = searchParams.get('impact') || ''

  return new ImageResponse(
    (
      <div style={{
        height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px',
        background: 'linear-gradient(135deg, #1B4F72 0%, #2E86C1 100%)',
        color: 'white', fontFamily: 'sans-serif'
      }}>
        <div style={{ fontSize: 20, opacity: 0.8, marginBottom: 16 }}>
          MarketplaceBeta
        </div>
        {category && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 4, fontSize: 16 }}>
              {category}
            </span>
            {impact && (
              <span style={{ background: impact === 'high' ? '#e74c3c' : '#f39c12', padding: '4px 12px', borderRadius: 4, fontSize: 16 }}>
                {impact} impact
              </span>
            )}
          </div>
        )}
        <div style={{ fontSize: 48, fontWeight: 'bold', lineHeight: 1.2, maxWidth: '90%' }}>
          {title.length > 80 ? title.substring(0, 77) + '...' : title}
        </div>
        <div style={{ fontSize: 18, opacity: 0.7, marginTop: 24 }}>
          The Intelligence Hub for Marketplace Commerce
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
