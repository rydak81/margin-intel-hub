import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ANSWER_PAGES, answerPath, getAnswer } from "@/lib/answers"
import { AnswerView } from "@/app/answers/answer-view"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://marketplacebeta.com"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return ANSWER_PAGES.map(page => ({ slug: page.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = getAnswer(slug)
  if (!page) return { title: "Answer not found" }
  const canonical = `${SITE_URL}${answerPath(page.slug)}`
  return {
    title: page.question,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.question,
      description: page.description,
      url: canonical,
      type: "article",
      publishedTime: page.sources[0]?.checkedOn,
      modifiedTime: page.sources[0]?.checkedOn,
    },
    twitter: { card: "summary_large_image", title: page.question, description: page.description },
  }
}

export default async function AnswerPage({ params }: Props) {
  const { slug } = await params
  const page = getAnswer(slug)
  if (!page) notFound()
  return <AnswerView page={page} />
}
