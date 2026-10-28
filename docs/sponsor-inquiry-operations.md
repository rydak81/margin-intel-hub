# Sponsorship inquiry delivery

A visitor receives success only when the inquiry has been durably stored and
Resend has accepted a notification with a message ID. Acceptance is not proof of
inbox delivery. If either operation fails, the API returns 503 and an actionable
message; a saved inquiry stays in the database. The browser retains its fields
and a tab-scoped sessionStorage retry copy (when storage is available), including
its inquiry reference. Closing the tab can remove that copy.

An unchanged retry uses the same UUID. A duplicate database ID must match every
submitted field; it cannot overwrite an inquiry. A stored email receipt suppresses
resending, and Resend's Idempotency-Key protects concurrent/ambiguous sends for
24 hours. If saving the receipt fails, a retry after that window can notify twice.
Editing the inquiry creates a new reference. Legacy API callers without a UUID
still work but do not get retry deduplication. The honeypot remains an intentional
fake-success bot sink. Rate limiting remains per instance (five attempts/hour).

## Production configuration

1. Run `scripts/016_sponsor_inquiries.sql` before deploying this route. It can be
   reapplied and upgrades an existing table. RLS is enabled, public access is
   revoked, and only `service_role` receives select/insert/update privileges.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the
   same project. Never put the service key in a public variable or browser.
3. Set `SPONSOR_INQUIRY_TO` explicitly to one working owner inbox. The route
   intentionally does not fall back to `EMAIL_REPLY_TO`. Configure `RESEND_API_KEY`
   and a verified `EMAIL_FROM` sender. Redeploy after environment changes.
4. Submit a clearly labeled synthetic inquiry through `/sponsor` and `/pricing`.
   It must not request inventory, payment, or a real booking. Record the response
   inquiryId, then independently query that row and find the exact notification
   in the intended mailbox. Check its sender, recipient, Reply-To, source page,
   offer and message. A 200, Resend ID, or deployment READY is insufficient proof
   of delivery.

## Recovery and monitoring

The database is the durable intake record. Inspect new inquiries and pending
notifications in the Supabase dashboard; do not rely exclusively on inbox mail.

```sql
select id, created_at, source_page, notification_email_id, notification_accepted_at
from public.sponsor_inquiries
order by created_at desc;

select id, created_at, source_page
from public.sponsor_inquiries
where notification_email_id is null
order by created_at;
```

Null receipts mean pending or unconfirmed, including a possible receipt-write
failure. Find logs by `inquiryId`: `storage_failed`, `notification_pending`,
`notification_error`, or `notification_receipt_failed`. Inspect credentials,
recipient configuration and provider status without copying secrets into logs or
issues. Investigate accepted-but-missing mail using the saved Resend message ID:
check bounce/suppression/delivery status and the actual inbox/spam folder. A
provider acceptance timestamp must never be described as inbox delivery.

For a pending inquiry, retrieve the original details through authorized server
access. After fixing configuration, resubmit the same payload and `inquiryId` to
`POST /api/sponsor-inquiry`, respecting Retry-After. Confirm the row and mailbox
again. For accepted-but-bounced mail, contact the customer from a working inbox
or deliberately re-notify after investigating the provider record; normal form
retries suppress an already acknowledged notification. No automatic worker,
bounce webhook, or alert subscription is installed by this change.

## Verification commands

`npm ci`, `npm test`, `npm run build`, and `npx tsc --noEmit`.
The focused suite is:

```sh
npx vitest run lib/sponsor-inquiry.test.ts lib/email.test.ts components/sponsor-inquiry-form.test.tsx
node --import ./tests/register-ts.mjs --test tests/sponsor-inquiry-database.test.ts
```

The API tests inject both provider failures, partial failures, thrown errors,
missing receipts and configuration, duplicate retries and conflicting payloads.
DOM tests exercise actual form submissions, error responses, network/JSON errors,
reload recovery, editing, blocked session storage and success-only clearing.
PGlite tests execute the migration and verify privileges, unique IDs and retention.
