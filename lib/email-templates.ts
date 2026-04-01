// lib/email-templates.ts
// HTML email templates for MarketplaceBeta newsletters
// Uses inline styles for maximum email client compatibility

interface DailyBriefData {
  briefContent: string  // AI-generated brief text
  date: string
  articleCount: number
  subscriberName?: string | null
}

const BRAND = {
  logoUrl: 'https://marketplacebeta.com/brand-icon.png',
  navy: '#0f172a',
  navySoft: '#172033',
  cobalt: '#2563eb',
  slate: '#334155',
  muted: '#64748b',
  line: '#dbe4f0',
  panel: '#f8fafc',
}

function sanitizeBriefText(briefText: string, formattedDate: string): string {
  const lines = briefText.split('\n')
  const cleaned: string[] = []
  let skippedLeadingMeta = false

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line && !skippedLeadingMeta) {
      continue
    }

    const normalized = line
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .trim()

    const isRedundantHeader =
      /daily marketplace brief/i.test(normalized) ||
      /marketplace intelligence brief/i.test(normalized) ||
      /your daily .*edge/i.test(normalized) ||
      /\[date\]/i.test(normalized)

    const isDateLine =
      /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s/i.test(normalized) ||
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s/i.test(normalized)

    const isDivider = /^[-_]{3,}$/.test(normalized)

    if (!skippedLeadingMeta && (isRedundantHeader || isDateLine || isDivider)) {
      continue
    }

    skippedLeadingMeta = true
    cleaned.push(rawLine)
  }

  return cleaned
    .join('\n')
    .replace(/\[Date\]/gi, formattedDate)
    .trim()
}

/**
 * Convert the AI-generated brief (plain text with markdown-like formatting)
 * into clean HTML paragraphs for the email.
 */
function briefToHtml(briefText: string): string {
  return briefText
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      // Bold headings (lines starting with ## or **) 
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const text = line.replace(/^#{2,3}\s*/, '')
        return `<h3 style="color: ${BRAND.navy}; font-size: 16px; font-weight: 700; margin: 24px 0 8px 0; padding-top: 16px; border-top: 1px solid ${BRAND.line};">${text}</h3>`
      }
      // Bold text markers
      if (line.startsWith('**') && line.endsWith('**')) {
        const text = line.replace(/\*\*/g, '')
        return `<h3 style="color: ${BRAND.navy}; font-size: 16px; font-weight: 700; margin: 24px 0 8px 0; padding-top: 16px; border-top: 1px solid ${BRAND.line};">${text}</h3>`
      }
      // Bottom Line section
      if (line.toLowerCase().includes('bottom line')) {
        const text = line.replace(/\*\*/g, '').replace(/^#{1,3}\s*/, '')
        return `<div style="background: #eef4ff; border-left: 4px solid ${BRAND.cobalt}; padding: 16px; margin: 24px 0; border-radius: 0 12px 12px 0;"><h3 style="color: ${BRAND.navy}; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">${text}</h3>`
      }
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const text = line.trim().replace(/^[-•]\s*/, '')
        return `<li style="color: ${BRAND.slate}; font-size: 15px; line-height: 1.6; margin-bottom: 4px;">${formatInlineStyles(text)}</li>`
      }
      // Numbered items
      if (/^\d+\.\s/.test(line.trim())) {
        return `<p style="color: ${BRAND.slate}; font-size: 15px; line-height: 1.6; margin: 4px 0;">${formatInlineStyles(line)}</p>`
      }
      // Regular paragraph
      return `<p style="color: ${BRAND.slate}; font-size: 15px; line-height: 1.6; margin: 8px 0;">${formatInlineStyles(line)}</p>`
    })
    .join('\n')
}

function formatInlineStyles(text: string): string {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${BRAND.navy};">$1</strong>`)
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  return text
}

export function generateDailyBriefEmail(data: DailyBriefData): string {
  const greeting = data.subscriberName
    ? `Good morning, ${data.subscriberName}`
    : 'Good morning'

  const formattedDate = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/i.test(data.date)
    ? data.date
    : new Date(data.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  const briefHtml = briefToHtml(sanitizeBriefText(data.briefContent, formattedDate))

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Marketplace Brief - ${formattedDate}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.panel}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.panel};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navySoft} 58%, #312e81 100%); padding: 28px 32px 24px; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom: 18px;" align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                      <tr>
                        <td width="44" valign="middle">
                          <img src="${BRAND.logoUrl}" alt="MarketplaceBeta" width="40" height="40" style="display: block; border-radius: 10px;" />
                        </td>
                        <td valign="middle" style="padding-left: 12px;">
                          <p style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">
                            MarketplaceBeta
                          </p>
                          <p style="color: #94a3b8; font-size: 11px; font-weight: 600; letter-spacing: 0.24em; margin: 4px 0 0 0; text-transform: uppercase;">
                            Operator Intelligence Desk
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 6px 0;">
                      The Daily Marketplace Brief
                    </h1>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                      ${formattedDate} &bull; ${data.articleCount} stories
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: ${BRAND.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                ${greeting} — here's what marketplace sellers and e-commerce operators need to know today.
              </p>

              <!-- AI Brief Content -->
              ${briefHtml}

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://marketplacebeta.com" style="display: inline-block; background: ${BRAND.cobalt}; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 10px;">
                      Read Full Coverage on MarketplaceBeta
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${BRAND.panel}; padding: 24px 32px; border-top: 1px solid ${BRAND.line};">
              <p style="color: ${BRAND.muted}; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0; text-align: center;">
                You're receiving this because you subscribed to the Daily Marketplace Brief.
              </p>
              <p style="color: ${BRAND.muted}; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                <a href="https://marketplacebeta.com" style="color: ${BRAND.cobalt}; text-decoration: underline;">Visit MarketplaceBeta</a>
                &nbsp;&bull;&nbsp;
                <a href="https://marketplacebeta.com/api/unsubscribe?email={{email}}" style="color: ${BRAND.muted}; text-decoration: underline;">Unsubscribe</a>
              </p>
              <p style="color: #94a3b8; font-size: 11px; margin: 16px 0 0 0; text-align: center;">
                MarketplaceBeta &bull; BeaconPath Holdings, LLC
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function generateWelcomeEmail(subscriberName?: string | null): string {
  const greeting = subscriberName
    ? `Welcome aboard, ${subscriberName}!`
    : 'Welcome aboard!'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MarketplaceBeta</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.panel}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.panel};">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navySoft} 58%, #312e81 100%); padding: 28px 32px; text-align: center;">
              <img src="${BRAND.logoUrl}" alt="MarketplaceBeta" width="44" height="44" style="display: block; margin: 0 auto 14px auto; border-radius: 12px;" />
              <p style="color: #cbd5e1; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; margin: 0 0 12px 0; text-transform: uppercase;">
                MarketplaceBeta
              </p>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0;">
                ${greeting}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: ${BRAND.slate}; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
                You've just joined thousands of Amazon sellers, e-commerce agencies, and marketplace operators who start their day with the intelligence that matters.
              </p>

              <h3 style="color: ${BRAND.navy}; font-size: 16px; font-weight: 700; margin: 24px 0 12px 0;">Here's what to expect:</h3>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: ${BRAND.cobalt};">Every morning at 7am ET</strong>
                    <p style="color: ${BRAND.muted}; font-size: 14px; margin: 4px 0 0 0;">Your Daily Marketplace Brief — the top stories, analyzed by AI, with actionable takeaways for your business.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: ${BRAND.cobalt};">5-minute read</strong>
                    <p style="color: ${BRAND.muted}; font-size: 14px; margin: 4px 0 0 0;">We respect your time. Every brief is concise, relevant, and focused on what impacts your bottom line.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0;">
                    <strong style="color: ${BRAND.cobalt};">Full coverage on the site</strong>
                    <p style="color: ${BRAND.muted}; font-size: 14px; margin: 4px 0 0 0;">Want to go deeper? Every story links back to full analysis, tools, and community discussion on MarketplaceBeta.</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                <tr>
                  <td align="center">
                    <a href="https://marketplacebeta.com" style="display: inline-block; background: ${BRAND.cobalt}; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 10px;">
                      Explore MarketplaceBeta Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: ${BRAND.muted}; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
                Your first Daily Brief arrives tomorrow morning. See you then!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${BRAND.panel}; padding: 24px 32px; border-top: 1px solid ${BRAND.line};">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; text-align: center;">
                MarketplaceBeta &bull; BeaconPath Holdings, LLC
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
