# EngageAds — Campaign Setup — Smoke Suite

Generated: 2026-06-19 | Pipeline: Step 4

Total: 6 smoke tests

| TC ID | Title | Auth | Mutation |
|---|---|---|---|
| CS-SMOKE-001 | Authenticated dealer without orderSeq redirects to BundledAdPackages | Dealer | No |
| CS-SMOKE-002 | Unauthenticated user is redirected to login | None | No |
| CS-SMOKE-003 | 4-step wizard rendered with package info header | Dealer | No |
| CS-SMOKE-004 | Step 1 required fields show validation errors when blank | Dealer | No |
| CS-SMOKE-005 | Step 4 TermsAccepted required to submit | Dealer | No |
| CS-SMOKE-006 | Successful form submission redirects to OrderConfirmation | Dealer | Yes — @mutation, skip on prod |
