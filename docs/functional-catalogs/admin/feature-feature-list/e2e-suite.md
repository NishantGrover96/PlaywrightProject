# E2E Suite — Admin / Feature List

**Tier:** E2E  
**Status:** Planned (not yet implemented)  
**Depends on:** Smoke + Regression passing

## Planned E2E Scenarios

| Scenario | Description | Steps |
|----------|-------------|-------|
| E2E-FL-001 | Full feature flag lifecycle | Login → navigate → enable edit mode → toggle feature Off → verify Off → toggle On → verify On → disable edit mode |
| E2E-FL-002 | Add Feature end-to-end | Login → enable edit mode → open Add Feature modal → fill all fields → save → verify new feature appears in correct module tab |
| E2E-FL-003 | Excel export-import roundtrip | Login → enable edit → download flags → modify status in downloaded file → import → verify updated statuses in UI |
| E2E-FL-004 | User Group assignment end-to-end | Login → enable edit → open role modal for a feature → assign role → save → verify role label updated in table |
| E2E-FL-005 | Module toggle lifecycle | Navigate to Module List → toggle module inactive → confirm → verify status changes to No → toggle active again |
| E2E-FL-006 | Search + filter + export flow | Apply search filter → verify filtered rows → export filtered flags → verify export filename and content |

## Run Command (when implemented)
```bash
npx playwright test tests/playwright/specs/admin/feature-feature-list/feature-list.spec.ts --grep "@e2e"
```
