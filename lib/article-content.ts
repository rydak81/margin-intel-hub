export type ArticleContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] }

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  nbsp: " ",
  quot: '"',
  apos: "'",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-z]+);/gi, (_, named) => NAMED_ENTITIES[named.toLowerCase()] || `&${named};`)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function collapseLineNoise(text: string): string {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  const filtered = lines.filter((line) => {
    if (line.length <= 1) return false
    if (/^https?:\/\//i.test(line)) return false
    if (/^href=/i.test(line)) return false
    if (/^(linkedin|facebook|twitter|x|instagram|threads)\b/i.test(line) && line.length < 80) return false
    if (/^(related coverage|member exclusive|share this|read more|continue reading)\b/i.test(line)) return false
    return true
  })

  return filtered.join("\n")
}

function splitLongParagraph(paragraph: string): string[] {
  if (paragraph.length < 420) {
    return [paragraph]
  }

  const sentences = paragraph.match(/[^.!?]+[.!?]+(?:["'”’)]*)?|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) || [paragraph]
  const chunks: string[] = []
  let current = ""

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence
    if (next.length > 360 && current) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current = next
    }
  }

  if (current.trim()) {
    chunks.push(current.trim())
  }

  return chunks
}

export function cleanArticleContent(rawContent: string | undefined, title?: string): string {
  if (!rawContent) return ""

  let normalized = rawContent
    .replace(/<!\[CDATA\[|\]\]>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<a [^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<\/(p|div|section|article|blockquote|figure|figcaption|h1|h2|h3|h4|h5|h6)>/gi, "\n\n")
    .replace(/<(ul|ol)[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<\/li>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")

  normalized = decodeHtmlEntities(normalized)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .trim()

  normalized = collapseLineNoise(normalized)
    .replace(/\b(LinkedIn|Facebook|Twitter|X)\b(?:\s+\b(LinkedIn|Facebook|Twitter|X)\b)+.*$/i, "")
    .replace(/\b(Related Coverage|Member Exclusive|Continue reading)\b[\s\S]*$/i, "")
    .replace(/\bRead the full story\b[\s\S]*$/i, "")
    .trim()

  if (title) {
    const duplicatedTitle = new RegExp(`^${escapeRegExp(title)}\\s+`, "i")
    normalized = normalized.replace(duplicatedTitle, "")
  }

  return normalized
}

export function paragraphizeArticleContent(rawContent: string | undefined, title?: string): ArticleContentBlock[] {
  const cleaned = cleanArticleContent(rawContent, title)
  if (!cleaned) return []

  const blocks = cleaned
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  const contentBlocks: ArticleContentBlock[] = []

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length > 1 && lines.every((line) => line.startsWith("• "))) {
      const items = lines
        .map((line) => line.replace(/^•\s*/, "").trim())
        .filter((item) => item.length > 10)

      if (items.length > 0) {
        contentBlocks.push({ type: "list", items })
      }
      continue
    }

    const normalizedParagraph = block.replace(/\s+/g, " ").trim()
    if (normalizedParagraph.length < 25) continue

    for (const paragraph of splitLongParagraph(normalizedParagraph)) {
      if (paragraph.length >= 25) {
        contentBlocks.push({ type: "paragraph", content: paragraph })
      }
    }
  }

  return contentBlocks
}

