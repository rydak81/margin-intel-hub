# Affiliate link readiness

`lib/affiliates.ts` accepts merchant-issued HTTPS referral URLs through the six
`NEXT_PUBLIC_AFF_*_URL` variables listed in that file. Without a valid URL distinct
from the vendor homepage, recommendations remain direct vendor links. Their
clicks use `vendor_link_click`; configured referral destinations use
`affiliate_click` and an individual affiliate disclosure.

Configuration is not proof of merchant approval, attribution or payout readiness.
These events measure outbound clicks only, never commissions or conversions.
Do not populate these settings with guessed tags, application URLs, credentials,
or another publisher's referral links. Public environment variables are public.

Before configuring a link, verify the existing account, merchant approval for
this website and traffic channel, the exact issued link, current program terms,
and payout-onboarding status with the account owner. Record status separately:
account exists, program approved, link issued, site configured, attribution
verified, payout ready. Unknown is not approved. New agreements and sensitive
account setup require the owner's applicable approval.

Next.js can inline these settings at build time. A future authorized configuration
change requires a fresh approved build/deployment and read-only inspection of the
rendered href. Never manufacture clicks or purchases to test attribution. Use
merchant-supported diagnostics and genuine reporting, if authorized.

Regression coverage uses synthetic domains and verifies missing, malformed,
unsafe and homepage-only configuration, preservation of referral parameters,
mixed-list disclosure and separate direct/affiliate click events. This change
does not enroll in any program, set a referral URL or activate monetization.
