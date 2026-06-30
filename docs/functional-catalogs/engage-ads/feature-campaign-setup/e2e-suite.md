# EngageAds — Campaign Setup — E2E Suite

Generated: 2026-06-19 | Pipeline: Step 4

Total: 4 E2E flows (all @mutation — skip on production)

| TC ID | Flow | Steps |
|---|---|---|
| CS-E2E-001 | Complete new campaign setup | Navigate → Step 1 contact → Step 2 business → Step 3 campaign → Step 4 review+terms → Submit → Verify OrderConfirmation |
| CS-E2E-002 | Complete edit flow | Load existing setup via orderSeq → verify Edit Mode alert → modify fields → Update → Verify OrderConfirmation |
| CS-E2E-003 | Flow with logo upload and Facebook URL | Step 1→2 with logo upload → Step 3 with Facebook Yes + URL → Step 4 → Submit → Verify OrderConfirmation |
| CS-E2E-004 | Admin full flow | Admin auth → access dealer order → complete all steps → Submit → Verify OrderConfirmation |
