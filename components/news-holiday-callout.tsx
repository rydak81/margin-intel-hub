import { BriefCta } from '@/components/brief-cta'
import { NewsHolidayHubLink } from '@/components/news-holiday-hub-link'
import { HOLIDAY_HUB_TITLE } from '@/lib/holiday-hub'
import { NEWS_HOLIDAY_SOURCE, newsHolidayHubVisible } from '@/lib/news-holiday-callout'

/**
 * Server-rendered callout for /news/[id]. The holiday hub link follows
 * NEWS_HOLIDAY_CALLOUT_THROUGH; the Daily Brief signup stays after that date.
 */
export function NewsHolidayCallout({ now = new Date() }: { now?: Date }) {
  const showHub = newsHolidayHubVisible(now)
  return (
    <div className="mt-6 space-y-4">
      {showHub ? (
        <section id="news-holiday-hub" aria-labelledby="news-holiday-hub-heading" className="rounded-xl border border-border bg-secondary/40 p-5">
          <h2 id="news-holiday-hub-heading" className="text-lg font-bold">{HOLIDAY_HUB_TITLE}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            <NewsHolidayHubLink />
          </p>
        </section>
      ) : null}
      <BriefCta source={NEWS_HOLIDAY_SOURCE} className="mt-0" />
    </div>
  )
}
