import Link from 'next/link'
import { parseInlineLinks } from '@/lib/analysis'

/** Renders a paragraph string with [label](href) links. Internal links use next/link. */
export function AnalysisInline({ text }: { text: string }) {
  return <>{parseInlineLinks(text).map((part, i) => {
    if (!part.href) return <span key={i}>{part.text}</span>
    if (part.href.startsWith('/')) return <Link key={i} href={part.href} className="font-semibold text-primary underline">{part.text}</Link>
    return <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">{part.text}</a>
  })}</>
}
