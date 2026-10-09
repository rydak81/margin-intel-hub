import type { ReactNode } from "react"
export function EditorialIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="editorial-intro border-b border-border pb-8 pt-2 sm:pb-10">
    <p className="editorial-eyebrow">{eyebrow}</p>
    <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.04em] sm:text-5xl">{title}</h1>
    <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
    {children && <div className="mt-6">{children}</div>}
  </section>
}
