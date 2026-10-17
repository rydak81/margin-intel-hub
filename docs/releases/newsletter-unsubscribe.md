# Daily Brief unsubscribe repair (review pending)

Current main `e761b69` built daily HTML with a literal `{{email}}` placeholder.
The daily sender supplied only the subscriber name and sent HTML without doing
placeholder interpolation. There was no separate plain-text body in this path.
The unsubscribe handler treated a successful zero-row delete as a removal.

The patch supplies each recipient's normalized, URL-encoded address to both HTML
and an explicit plain-text body. GET renders a confirmation form without accessing subscribers; only an explicit
POST removes a subscription, so link scanners cannot unsubscribe recipients.
Validation accepts the same email shapes as signup and escapes form values.
The handler rejects malformed/placeholder or
ambiguous query parameters before constructing a database client, requests the
exact affected-row count, and confirms removal only for a positive result.
An absent/already removed subscription gets an explicit no-change response;
unconfirmed counts and errors do not claim success. Responses are not cached,
and the submitted email is no longer interpolated into HTML or logged on success.

Validation uses synthetic example.com recipients, a mocked email HTTP transport
and mocked database operations. No live subscriber lookup/deletion, campaign,
credential, database schema, merge or production deployment was performed.
Already delivered placeholder links cannot recover the intended recipient from
that URL; after deployment they show an invalid-link explanation instead of a
false success. Live delivery and owner-approved production acceptance remain
unverified. Rollback is a revert of this application-only change.

Local validation: 92 Vitest tests and 43 Node tests pass. Lint is blocked by the
repository's missing ESLint executable. Default Turbopack build cannot follow
the isolated checkout's external dependency symlink; webpack validation is run
separately. No dependency manifests or production settings were changed.
