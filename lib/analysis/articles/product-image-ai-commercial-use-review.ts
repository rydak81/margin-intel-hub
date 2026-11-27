import type { AnalysisArticle } from '@/lib/analysis/types'

export const article = {
  "slug": "product-image-ai-commercial-use-review",
  "seoTitle": "AI Product Images: Review Before Listing",
  "metaDescription": "A product-image review worksheet for sellers. Check model terms, verify what comes in the box and catch regressions after image repairs.",
  "headline": "Two decisions before an AI product image reaches a listing",
  "dek": "A polished product shot can come from a research-only model or show an accessory the buyer will never receive. Each problem needs a different check.",
  "publishedOn": "2026-11-27",
  "updatedOn": "2026-11-27",
  "author": "MarketplaceBeta Research",
  "reviewMode": "automated",
  "readTime": "4 min",
  "tags": [
    "AI agents",
    "product photography",
    "catalog operations"
  ],
  "takeaway": "Approve the proposed use of the model first. Then approve the exact image revision against the contents of the child SKU. Either decision can keep an asset out of the listing.",
  "forecastIds": [],
  "newsletterSource": "campaign_ai_measurement",
  "sections": [
    {
      "id": "permission",
      "title": "Start with the use you intend",
      "paragraphs": [
        "A catalog team considering NVIDIA’s Nemotron-Labs-Image-30B-A3B can answer one procurement question before spending time on sample images. The [model card](https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B) directs readers to a non-commercial license. Section 3.3 of the [linked terms](https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf) limits use of the work and its derivatives to research or evaluation, with an exception for NVIDIA and its affiliates. We reviewed both on November 27, 2026.",
        "For a seller planning to run those weights to produce live listing photos, the reviewed terms do not establish permission for that deployment. Keep a research evaluation in its own workflow. To move the model into a commercial pipeline, record the applicable permission for that use or choose a candidate whose terms cover it. Our review concerned the named weights and proposed use. It did not determine ownership of individual output images."
      ]
    },
    {
      "id": "image-review",
      "title": "Write the contents of the box before judging the picture",
      "paragraphs": [
        "Start the review record with the child SKU, its current packing specification and a reference photo. List what must be visible, what may be out of frame and what would misrepresent the offer. A shared parent image alone cannot establish which accessories ship with a particular variant.",
        "The authors of the November 23 [VisualCreation preprint](https://arxiv.org/html/2611.31358v1) describe fixing observable requirements before generation and checking candidates against them during repair. For catalog work, that suggests a practical rule: carry the whole checklist forward each time someone crops, retouches or regenerates the photo."
      ],
      "table": {
        "caption": "Hypothetical drill-kit review. The reference kit includes one battery and a belt clip. The charger is sold separately.",
        "headings": [
          "Image revision",
          "Visible evidence",
          "Listing decision"
        ],
        "rows": [
          [
            "A",
            "A charger is staged alongside the kit as an included item.",
            "Reject. The image changes what the buyer expects in the box."
          ],
          [
            "B",
            "The charger is gone, but the new crop hides the required belt clip.",
            "Hold. Obtain a view that verifies the clip."
          ]
        ]
      }
    },
    {
      "id": "workflow",
      "title": "Give the reviewer a way to say “unobservable”",
      "paragraphs": [
        "In the [downloadable review worksheet](/research/product-image-review-2026-11-27.json), make a separate entry for each asset revision. An unreadable label calls for a better crop or a reference photo. A clearly wrong label calls for correction. Treating both as a pass rewards the image that hides the most detail.",
        "If you compare competing models, give each the same authorized reference assets, child SKUs and frozen requirements. Keep rejected images in the denominator. Record retries and reviewer effort alongside the count accepted for listing. Only compare costs across candidates eligible for the intended use. The [agent evaluation worksheet](/intelligence/analysis/ecommerce-ai-agent-evaluation-final-state-cost) gives the broader method for tracking cost per accepted task."
      ]
    },
    {
      "id": "methods",
      "title": "Evidence and reuse",
      "paragraphs": [
        "MarketplaceBeta selected this question from its November 27 research brief, cutoff 12:07:51 UTC. We checked one model card, its linked terms and a separate research paper for the review method. The card and license establish the publisher’s stated terms. The paper supplies a design idea, not an evaluation of the named model on ecommerce photos.",
        "The worksheet and drill-kit example are original. We did not run either system, inspect commercial agreements or measure image accuracy, approval time or sales. Cite MarketplaceBeta Research, this article and November 27, 2026 when reusing the form. Retain the example’s hypothetical label and recheck the terms for the revision you actually use."
      ]
    }
  ],
  "sources": [
    {
      "label": "NVIDIA model card",
      "href": "https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B",
      "context": "Undated. Read November 27, 2026 for the named model and its stated use."
    },
    {
      "label": "NVIDIA non-commercial license",
      "href": "https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf",
      "context": "Section 3.3. Reviewed November 27, 2026."
    },
    {
      "label": "VisualCreation preprint",
      "href": "https://arxiv.org/html/2611.31358v1",
      "context": "November 23, 2026, version 1. Appendix B describes the frozen checklist and review method."
    },
    {
      "label": "Product-image review worksheet",
      "href": "/research/product-image-review-2026-11-27.json",
      "context": "Original blank fields and hypothetical worked example, November 27, 2026."
    }
  ]
} satisfies AnalysisArticle
