import Link from 'next/link'

const approaches = [
  { name: 'Platform assistant', task: 'Draft a listing or explain a report inside your existing store tools.', input: 'Approved catalog data and account permissions.', output: 'A draft or explanation to review.' },
  { name: 'General AI assistant', task: 'Organize research, compare options, or outline a campaign.', input: 'A clear question, source material, and an output format.', output: 'A brief with evidence and unanswered questions.' },
  { name: 'Rules-based automation', task: 'Route an alert or calculate a metric with a predictable rule.', input: 'Defined conditions, clean fields, and tested calculations.', output: 'A consistent action or exception queue; a model may be unnecessary.' },
  { name: 'Research agent', task: 'Repeat a multi-step evidence-gathering process.', input: 'Approved sources, bounded tools, an owner, and a stopping rule.', output: 'A traceable research packet before a decision.' },
  { name: 'Coding assistant', task: 'Prototype an internal calculator, dashboard, or file-cleaning tool.', input: 'Requirements, sample inputs, acceptance checks, and a review environment.', output: 'A testable prototype, not an automatically production-ready system.' },
]
const tips = [
  { goal: 'Build', title: 'Turn a recurring headache into a tool brief', input: 'One task, an example input, the required output, and the current manual steps.', prompt: 'Write a one-page tool brief: user, problem, inputs, output, three acceptance checks, and what is out of scope. Ask about missing requirements before proposing code.', result: 'A short specification a teammate or coding assistant can test.', check: 'Could a second person tell whether each acceptance check passed?' },
  { goal: 'Grow', title: 'Turn review themes into a small experiment', input: 'An authorized, redacted sample of customer feedback with source IDs.', prompt: 'Group these comments by customer problem. Cite the comment IDs, include contradictory examples, and separate observations from hypotheses. Propose one small test for each of the top three themes.', result: 'Theme → evidence → hypothesis → next experiment.', check: 'Comments are a sample, not market demand. Validate an idea with customers before spending.' },
  { goal: 'Operate', title: 'Ask for exceptions before a long summary', input: 'A reconciled weekly report with dates, units, and known thresholds.', prompt: 'Using only this report, list the five exceptions that need review. Include the source field, the threshold, an unanswered question, and a suggested owner. Keep calculations as supplied; do not invent causes.', result: 'Exception → source field → question → owner.', check: 'Verify each number against the report and label possible causes as hypotheses.' },
]

export function AiQuickStart() {
  return <>
    <nav aria-label="AI resource sections" className="flex flex-wrap gap-3 py-7 text-sm font-semibold">{[['#try-this', 'Build · Grow · Operate'], ['#ai-news', 'AI news'], ['#playbooks', 'Workflow playbooks'], ['#choose-approach', 'Choose an approach'], ['#pilot', 'Plan a pilot']].map(([href, label]) => <Link key={href} href={href} className="rounded-lg border border-border bg-card px-4 py-3 hover:text-primary">{label}</Link>)}</nav>
    <section id="try-this" aria-labelledby="try-title" className="scroll-mt-44 pb-12 pt-5">
      <p className="editorial-eyebrow">Small tasks. Useful outputs.</p><h2 id="try-title" className="mt-3 text-3xl font-bold sm:text-4xl">Try one thing today.</h2><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Start with a narrow task and a clear result. These exercises are suggested starting points, not personal case studies or promised outcomes.</p>
      <div className="mt-7 grid gap-6 lg:grid-cols-3">{tips.map(tip => <article key={tip.goal} className="editorial-elevated rounded-2xl border border-border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{tip.goal}</p><h3 className="mt-3 text-xl font-bold">{tip.title}</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground"><strong>Bring:</strong> {tip.input}</p>
        <details className="mt-4 rounded-xl border border-border bg-secondary/40 p-4"><summary className="cursor-pointer font-semibold">Try this prompt</summary><p className="mt-3 text-sm leading-7">{tip.prompt}</p></details>
        <p className="mt-4 text-sm leading-6"><strong>Useful output:</strong> {tip.result}</p><p className="mt-3 text-sm leading-6 text-muted-foreground"><strong>Check:</strong> {tip.check}</p>
      </article>)}</div>
    </section>
    <section id="choose-approach" aria-labelledby="approach-title" className="scroll-mt-44 border-t border-border py-12">
      <p className="editorial-eyebrow">Choose the approach before the tool</p><h2 id="approach-title" className="mt-3 text-3xl font-bold">What kind of help does the job need?</h2><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">Match the task to the simplest approach that can produce a reviewable result. Compare total effort, access, and running cost before committing to a tool.</p>
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{approaches.map(item => <article key={item.name} className="rounded-xl border border-border bg-card p-5"><h3 className="text-lg font-bold">{item.name}</h3><p className="mt-3 leading-7 text-muted-foreground">{item.task}</p><dl className="mt-4 space-y-3 text-sm leading-6"><div><dt className="font-semibold">Bring</dt><dd className="text-muted-foreground">{item.input}</dd></div><div><dt className="font-semibold">Expect</dt><dd className="text-muted-foreground">{item.output}</dd></div></dl></article>)}</div>
    </section>
  </>
}
