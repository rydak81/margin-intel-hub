import type { ReactNode } from "react"
export function EditorialIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="editorial-intro rounded-2xl border border-border px-6 py-8 sm:px-9 sm:py-10">
    <p className="editorial-eyebrow">{eyebrow}</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.12] tracking-[-0.04em] sm:text-5xl">{title}</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
    {children && <div className="mt-6">{children}</div>}
  </section>
}
