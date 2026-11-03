import { notFound } from 'next/navigation'

// Retired coverage has no equivalent AI article. Return an honest 404 rather than
// redirecting unrelated story URLs to a new topic or continuing publisher fetches.
export default function RetiredManufacturingStory() { notFound() }
