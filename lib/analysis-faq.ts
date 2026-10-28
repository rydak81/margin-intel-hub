/**
 * FAQ extraction for analysis articles.
 *
 * An article opts in by having a section with id "faq" whose bullets are written as
 * "Question? Answer". The same parsed items drive the visible FAQ list on the article page
 * and its FAQPage JSON-LD, and both are reduced to plain text (inline [label](href) links
 * become their label), so the markup always matches the visible words exactly.
 *
 * Returns an empty list when the article has no FAQ section, or when any bullet in it cannot
 * be split into a question and an answer (the page then renders it as an ordinary bullet list
 * and emits no FAQPage markup).
 */
import { parseInlineLinks, type AnalysisArticle, type AnalysisSection } from '@/lib/analysis'

export interface AnalysisFaqItem {
  question: string
  /** Plain text: exactly the words shown on the page. */
  answer: string
  /** Answer with its inline [label](href) links preserved, for rendering. */
  answerMarkup: string
}

const plainText = (text: string) => parseInlineLinks(text).map(p => p.text).join('')

export function isFaqSection(section: AnalysisSection): boolean {
  return section.id === 'faq'
}

export function parseFaqSection(section: AnalysisSection): AnalysisFaqItem[] {
  if (!isFaqSection(section) || !section.bullets?.length) return []
  const items: AnalysisFaqItem[] = []
  for (const bullet of section.bullets) {
    const at = bullet.indexOf('? ')
    if (at < 1) return []
    const question = plainText(bullet.slice(0, at + 1)).trim()
    const answerMarkup = bullet.slice(at + 2).trim()
    const answer = plainText(answerMarkup).trim()
    if (!question || !answer) return []
    items.push({ question, answer, answerMarkup })
  }
  return items
}

export function analysisFaq(article: Pick<AnalysisArticle, 'sections'>): AnalysisFaqItem[] {
  const section = article.sections.find(isFaqSection)
  return section ? parseFaqSection(section) : []
}

/** FAQPage JSON-LD for an article, or null when it has no FAQ data. */
export function analysisFaqJsonLd(article: Pick<AnalysisArticle, 'sections'>) {
  const items = analysisFaq(article)
  if (items.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}
