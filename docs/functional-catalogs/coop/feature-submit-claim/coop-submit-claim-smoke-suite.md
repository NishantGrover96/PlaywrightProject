# Co-op Submit Claim — Smoke Suite

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 5 — Smoke Suite

---

## Purpose

The Smoke Suite verifies that the minimum viable functionality is operational after each deployment. These tests must pass before any further testing proceeds.

**Run Time Target:** < 5 minutes
**Failure Policy:** Any smoke test failure blocks deployment verification

---

## Smoke Tests

### COOP-SMOKE-001 — Login

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~15s

**Preconditions:** Test user credentials configured in `.env.{ENV}`

**Steps:**
1. Navigate to application login page
2. Enter test dealer credentials
3. Click Login

**Expected Result:**
- Successful authentication
- Redirected to dashboard or home page
- User identity visible (username/dealer name in header)

**Migration Check:** Login behavior identical between legacy and modern

---

### COOP-SMOKE-002 — Navigate to Submit Claim Page

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~10s

**Preconditions:** User is authenticated (SMOKE-001 passed)

**Steps:**
1. Navigate to `/Coop/SubmitClaim`

**Expected Result:**
- Page loads without error (HTTP 200)
- Form elements visible: Program dropdown, Date field, Amount field, Description, Submit button
- Program dropdown populated with at least one program

**Migration Check:** Page structure and form elements match between legacy and modern

---

### COOP-SMOKE-003 — Program Dropdown Populated

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~5s

**Preconditions:** User authenticated as enrolled dealer

**Steps:**
1. On Submit Claim page, open the Program dropdown

**Expected Result:**
- At least one active program appears
- Program names are readable

**Migration Check:** Same programs returned from legacy DLL and modern API

---

### COOP-SMOKE-004 — Create Draft Claim

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~20s

**Preconditions:** Dealer enrolled in at least one active program

**Steps:**
1. Select a program
2. Enter a claim date within the program period
3. Enter amount: $100
4. Enter description: "Smoke test draft"
5. Click "Save Draft"

**Expected Result:**
- Success message displayed
- Claim saved with status = "Draft"
- ClaimID returned (visible in URL or response)

**Migration Check:** Draft record created in database in both legacy and modern

---

### COOP-SMOKE-005 — Upload Attachment to Draft Claim

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~15s

**Preconditions:** Draft claim created (SMOKE-004)

**Steps:**
1. Open the draft claim
2. Upload a small PDF test file (from `tests/playwright/data/coop/test-attachment.pdf`)
3. Verify attachment appears in list

**Expected Result:**
- Attachment listed with filename
- No error

**Migration Check:** Attachment stored and retrievable in both environments

---

### COOP-SMOKE-006 — Submit Claim

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~20s

**Preconditions:** Draft claim with attachment exists (SMOKE-004, SMOKE-005)

**Steps:**
1. Open draft claim with attachment
2. Click "Submit"
3. Confirm any confirmation dialog

**Expected Result:**
- Success message: "Claim submitted successfully" (or equivalent)
- Claim status = "Submitted"

**Migration Check:** Submit action completes in both legacy and modern

---

### COOP-SMOKE-007 — Verify Submitted Status

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~10s

**Preconditions:** Claim submitted (SMOKE-006)

**Steps:**
1. Navigate to the submitted claim's detail page
2. Check the status field

**Expected Result:**
- Status = "Submitted"
- Form fields are read-only
- Submit button no longer shown

**Migration Check:** Status display matches between legacy and modern

---

### COOP-SMOKE-008 — Unauthenticated Access Blocked

**Tag:** `@smoke`
**Priority:** P0
**Duration:** ~5s

**Preconditions:** No active session

**Steps:**
1. Navigate to `/Coop/SubmitClaim` without being logged in

**Expected Result:**
- Redirect to login page (302) or 401 response
- Claim form not accessible

**Migration Check:** Authentication requirement enforced in both environments

---

## Smoke Suite Execution Matrix

| Test | Legacy | Modern | Match Required |
|---|---|---|---|
| COOP-SMOKE-001 Login | ✓ | ✓ | Yes |
| COOP-SMOKE-002 Page Load | ✓ | ✓ | Yes |
| COOP-SMOKE-003 Programs Load | ✓ | ✓ | Yes |
| COOP-SMOKE-004 Save Draft | ✓ | ✓ | Yes |
| COOP-SMOKE-005 Upload Attachment | ✓ | ✓ | Yes |
| COOP-SMOKE-006 Submit Claim | ✓ | ✓ | Yes |
| COOP-SMOKE-007 Verify Status | ✓ | ✓ | Yes |
| COOP-SMOKE-008 Auth Required | ✓ | ✓ | Yes |

**Pass Threshold:** 8/8 required

---

## Running the Smoke Suite

```bash
# Against legacy
npm run test:legacy -- --grep @smoke

# Against modern
npm run test:modern -- --grep @smoke

# Both (comparison mode)
npm run test:compare -- --grep @smoke
```
