import { createAdminClient } from "@/lib/supabase/admin"

const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image-preview"
const DEFAULT_BUCKET = "article-images"

type ArticleImageInput = {
  id: string
  title: string
  summary?: string | null
  category?: string | null
  platforms?: string[]
  sourceName?: string | null
  publishedAt?: string | null
}

type GeneratedArticleImage = {
  imageUrl: string
  prompt: string
  model: string
  filePath: string
}

let bucketReadyPromise: Promise<string> | null = null

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
}

function inferVisualDirection(category: string, platforms: string[]): string {
  const categoryLabel = category.replace(/[_-]/g, " ")
  const platformLabel = platforms.length > 0 ? platforms.join(", ") : "marketplace commerce"

  switch (category) {
    case "profitability":
      return `Use premium financial and operations cues for ${platformLabel}: pricing dashboards, clean packaging, margin analysis, subtle warehouse or ledger visuals.`
    case "logistics":
      return `Use logistics and fulfillment cues for ${platformLabel}: modern warehouse lanes, parcels, shipment flow, operational dashboards, no delivery brand marks.`
    case "advertising":
      return `Use retail media and growth cues for ${platformLabel}: campaign dashboards, audience charts, creative planning, clean marketing visuals.`
    case "mergers_acquisitions":
      return `Use deal and executive strategy cues: clean boardroom energy, partnership documents, abstract transaction visuals, premium corporate atmosphere.`
    case "platform_updates":
    case "compliance_policy":
      return `Use platform and policy cues for ${platformLabel}: operator dashboards, notifications, marketplace controls, trust-and-safety style visuals, no UI screenshots.`
    default:
      return `Use a clean editorial illustration tailored to ${categoryLabel} in ${platformLabel}, focusing on commerce operations, seller intelligence, and executive decision-making.`
  }
}

function buildArticleImagePrompt(article: ArticleImageInput): string {
  const category = (article.category || "market_metrics").toLowerCase()
  const platforms = article.platforms || []

  return [
    "Create a premium editorial hero image for a marketplace intelligence news article.",
    `Headline: ${article.title}`,
    article.summary ? `Summary: ${article.summary}` : null,
    article.sourceName ? `Source context: ${article.sourceName}` : null,
    article.publishedAt ? `Published context: ${article.publishedAt}` : null,
    `Category: ${category.replace(/[_-]/g, " ")}`,
    platforms.length > 0 ? `Platforms: ${platforms.join(", ")}` : null,
    inferVisualDirection(category, platforms),
    "Art direction: high-end SaaS editorial, cinematic but restrained, polished and modern, premium lighting, soft gradients, sharp focal subject, clean composition.",
    "Composition requirements: 16:9 aspect ratio, strong center framing, generous safe margins so headlines can sit below the image, no awkward dead space.",
    "Hard rules: no text, no logos, no watermarks, no brand marks, no screenshots, no UI chrome, no collage, no duplicated subjects, no clutter.",
  ]
    .filter(Boolean)
    .join("\n")
}

function parseGeneratedDataUri(dataUri: string): { mimeType: string; buffer: Buffer; extension: string } {
  const match = dataUri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)

  if (!match) {
    throw new Error("Generated image response was not a valid data URI")
  }

  const mimeType = match[1]
  const base64 = match[2]
  const extension = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "png"

  return {
    mimeType,
    buffer: Buffer.from(base64, "base64"),
    extension,
  }
}

async function ensureArticleImageBucket(bucketName: string): Promise<string> {
  if (bucketReadyPromise) {
    return bucketReadyPromise
  }

  bucketReadyPromise = (async () => {
    const supabase = createAdminClient()

    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      throw new Error(`Failed to list storage buckets: ${listError.message}`)
    }

    const existing = buckets?.find((bucket) => bucket.name === bucketName)
    if (existing) {
      return bucketName
    }

    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: "8MB",
    })

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Failed to create storage bucket: ${createError.message}`)
    }

    return bucketName
  })()

  return bucketReadyPromise
}

async function requestGatewayImage(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.AI_GATEWAY_API_KEY

  if (!apiKey) {
    throw new Error("AI_GATEWAY_API_KEY is required for article image generation")
  }

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      modalities: ["text", "image"],
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`AI Gateway image generation failed (${response.status}): ${errorBody}`)
  }

  const payload = await response.json()
  const dataUri = payload?.choices?.[0]?.message?.images?.[0]?.image_url?.url

  if (!dataUri || typeof dataUri !== "string") {
    throw new Error("AI Gateway did not return an image payload")
  }

  return dataUri
}

export async function generateAndStoreArticleImage(
  article: ArticleImageInput
): Promise<GeneratedArticleImage | null> {
  if (!process.env.AI_GATEWAY_API_KEY) {
    return null
  }

  try {
    const model = process.env.AI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL
    const bucketName = process.env.SUPABASE_ARTICLE_IMAGE_BUCKET || DEFAULT_BUCKET
    const prompt = buildArticleImagePrompt(article)
    const dataUri = await requestGatewayImage(prompt, model)
    const { mimeType, buffer, extension } = parseGeneratedDataUri(dataUri)

    await ensureArticleImageBucket(bucketName)

    const supabase = createAdminClient()
    const filePath = `articles/${article.id}-${slugify(article.title)}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload generated image: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)

    return {
      imageUrl: data.publicUrl,
      prompt,
      model,
      filePath,
    }
  } catch (error) {
    console.error("[article-image-generation] Failed to generate image:", error)
    return null
  }
}

