# Co-op Submit Claim — Functional Unit Catalog

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 2 — Functional Unit Discovery

---

## Summary

| Category | Count |
|---|---|
| Page Initialization | 4 |
| Form Behavior | 6 |
| Validation | 11 |
| Business Rules | 8 |
| File Attachments | 4 |
| Workflow Actions | 5 |
| Data Persistence | 6 |
| Security & Authorization | 5 |
| **Total** | **49** |

---

## Page Initialization

### COOP-CLAIM-001 — Load Submit Claim Page
**Description:** Authenticated dealer navigates to `/Coop/SubmitClaim` and the page renders successfully.
**Legacy:** `SubmitClaim.cshtml.cs → OnGetAsync()`
**Modern:** Same page + API pre-load calls
**Risk:** Low

---

### COOP-CLAIM-002 — Populate Program Dropdown
**Description:** Programs dropdown is populated with only the active programs the current dealer is enrolled in.
**Legacy:** `FundService.GetActiveProgramsForDealer(dealerId)` → `usp_Coop_GetActiveProgramsByDealer`
**Modern:** `GET /api/coop/programs?dealerId={id}`
**Risk:** Medium — Dealer eligibility filter must match exactly

---

### COOP-CLAIM-003 — Populate Fund Type Dropdown
**Description:** Fund type dropdown is populated based on the selected program.
**Legacy:** `FundService.GetFundTypesForProgram(programId)`
**Modern:** `GET /api/coop/programs/{id}/fundtypes`
**Risk:** Low

---

### COOP-CLAIM-004 — Redirect Unauthenticated User
**Description:** Unauthenticated request to the page redirects to login.
**Legacy:** `[Authorize]` attribute on PageModel
**Modern:** Same
**Risk:** Low

---

## Form Behavior

### COOP-CLAIM-005 — Display Remaining Fund Balance
**Description:** When a program is selected, the available fund balance for that program/period is displayed.
**Legacy:** `FundService.ValidateFundAvailability` → display remaining
**Modern:** `GET /api/coop/programs/{id}/funds`
**Risk:** Medium — Balance calculation must match

---

### COOP-CLAIM-006 — Conditional Attachment Section
**Description:** Attachment section is visible when form is in a submittable state; hidden in draft mode.
**Legacy:** JavaScript toggle based on form state
**Modern:** Same (client-side)
**Risk:** Low

---

### COOP-CLAIM-007 — Auto-populate Dealer Name
**Description:** Dealer name field auto-populates from the authenticated user's dealer association.
**Legacy:** `User.GetDealerId()` → dealer lookup
**Modern:** Same (from auth context)
**Risk:** Low

---

### COOP-CLAIM-008 — Date Picker Constraints
**Description:** Claim date picker restricts selection to dates within the selected program's active period.
**Legacy:** Min/max date set server-side, validated client-side
**Modern:** Same behavior expected
**Risk:** Medium — Period boundary enforcement must match

---

### COOP-CLAIM-009 — Currency Formatting
**Description:** Claim amount field formats input as currency (2 decimal places, comma separators).
**Legacy:** Client-side jQuery masking
**Modern:** Same or equivalent
**Risk:** Low

---

### COOP-CLAIM-010 — Character Counter for Description
**Description:** Description field shows remaining character count, enforces 500-character max.
**Legacy:** Client-side character counter
**Modern:** Same
**Risk:** Low

---

## Validation

### COOP-CLAIM-011 — Validate Dealer Required
**Description:** Submitting without dealer selection shows "Dealer is required" error.
**Legacy:** `ValidationService.ValidateClaim` → ModelState error
**Modern:** API 400 response with field error
**Risk:** Low

---

### COOP-CLAIM-012 — Validate Program Required
**Description:** Submitting without program selection shows "Program is required" error.
**Legacy:** Server-side validation
**Modern:** API 400 response
**Risk:** Low

---

### COOP-CLAIM-013 — Validate Program Eligibility
**Description:** Selecting a program the dealer is not enrolled in returns eligibility error.
**Legacy:** `FundService.ValidateFundAvailability` + eligibility check
**Modern:** API 422 with business error
**Risk:** High — Eligibility logic moved from DLL to API

---

### COOP-CLAIM-014 — Validate Claim Date Required
**Description:** Submitting without claim date shows "Claim date is required" error.
**Legacy:** ModelState validation
**Modern:** API 400 response
**Risk:** Low

---

### COOP-CLAIM-015 — Validate Claim Date Not Future
**Description:** Claim date in the future shows "Claim date cannot be in the future" error.
**Legacy:** ValidationService rule
**Modern:** API 400 or 422 response
**Risk:** Medium — Rule must be in API

---

### COOP-CLAIM-016 — Validate Claim Date Within Program Period
**Description:** Claim date outside program period shows "Claim date is outside the program period" error.
**Legacy:** ValidationService rule
**Modern:** API 422 business error
**Risk:** High — Period boundary calculation must match

---

### COOP-CLAIM-017 — Validate Claim Amount Required
**Description:** Submitting without claim amount shows "Claim amount is required" error.
**Legacy:** ModelState
**Modern:** API 400
**Risk:** Low

---

### COOP-CLAIM-018 — Validate Claim Amount Greater Than Zero
**Description:** Claim amount of 0 or negative shows "Claim amount must be greater than zero."
**Legacy:** ValidationService
**Modern:** API 400
**Risk:** Low

---

### COOP-CLAIM-019 — Validate Claim Amount Does Not Exceed Fund Balance
**Description:** Claiming more than available fund balance shows "Insufficient fund balance" error.
**Legacy:** `FundService.ValidateFundAvailability`
**Modern:** API 422 business error
**Risk:** High — Fund balance check is financial-critical

---

### COOP-CLAIM-020 — Validate Claim Amount Does Not Exceed Per-Claim Maximum
**Description:** Claim amount exceeding program's per-claim max shows "Amount exceeds maximum allowed" error.
**Legacy:** ValidationService rule against program config
**Modern:** API 422
**Risk:** High

---

### COOP-CLAIM-021 — Validate Description Required
**Description:** Submitting without description shows "Description is required" error.
**Legacy:** ModelState
**Modern:** API 400
**Risk:** Low

---

## Business Rules

### COOP-CLAIM-022 — Enforce Attachment Requirement for Submission
**Description:** Attempting to submit (not draft) without at least one attachment is blocked with "At least one attachment is required."
**Legacy:** `ClaimService.SubmitClaim` pre-check
**Modern:** API 422 on POST `/submit`
**Risk:** Medium

---

### COOP-CLAIM-023 — Enforce Annual Cap Per Dealer
**Description:** If total dealer claims for the period would exceed the annual cap, submission is blocked.
**Legacy:** `ValidationService.ValidateAnnualCap`
**Modern:** API 422 business error
**Risk:** High — Financial cap enforcement

---

### COOP-CLAIM-024 — Prevent Duplicate Claim Submission
**Description:** A duplicate claim (same dealer/program/date) submitted within 24 hours is blocked.
**Legacy:** `ClaimService.CheckDuplicate`
**Modern:** API 409 Conflict or 422 business error
**Risk:** Medium

---

### COOP-CLAIM-025 — Lock Submitted Claim for Editing
**Description:** A submitted claim's fields are read-only and cannot be modified.
**Legacy:** Page render checks claim status, shows read-only view
**Modern:** Same page behavior + API returns 409 on edit attempt
**Risk:** Medium

---

### COOP-CLAIM-026 — Allow Edit After Return
**Description:** A claim returned by a reviewer reverts to Draft status and becomes editable.
**Legacy:** Status check on page load
**Modern:** Same
**Risk:** Medium

---

### COOP-CLAIM-027 — Calculate Claim Amount Limits Display
**Description:** Maximum allowable amount is calculated and displayed to the user before submission.
**Legacy:** Client-side from server-provided data
**Modern:** From API fund data
**Risk:** Low

---

### COOP-CLAIM-028 — Validate Description Max Length
**Description:** Description exceeding 500 characters is truncated or rejected with an error.
**Legacy:** ModelState MaxLength attribute
**Modern:** API 400 with length error
**Risk:** Low

---

### COOP-CLAIM-029 — Support Multiple Claim Line Items
**Description:** A single claim can have multiple detail line items (e.g., multiple expense types).
**Legacy:** `ClaimService.SaveDraft(header, List<ClaimDetail>)`
**Modern:** API request body includes `details[]` array
**Risk:** Medium — Array handling parity

---

## File Attachments

### COOP-CLAIM-030 — Upload Attachment
**Description:** User can upload a file (PDF, JPG, PNG) and it is associated with the claim.
**Legacy:** `AttachmentService.UploadAttachment` → `usp_Coop_AttachmentInsert`
**Modern:** `POST /api/coop/claims/{id}/attachments`
**Risk:** Medium

---

### COOP-CLAIM-031 — Display Uploaded Attachments
**Description:** Uploaded attachments are listed with filename, size, and delete option.
**Legacy:** Attachment list from DB via DLL
**Modern:** From API `GET /api/coop/claims/{id}` attachments collection
**Risk:** Low

---

### COOP-CLAIM-032 — Delete Attachment
**Description:** User can remove an attachment while claim is in Draft status.
**Legacy:** `AttachmentService.DeleteAttachment` → `usp_Coop_AttachmentDelete`
**Modern:** `DELETE /api/coop/claims/{id}/attachments/{attachId}`
**Risk:** Low

---

### COOP-CLAIM-033 — Restrict Attachment File Types
**Description:** Only PDF, JPG, PNG, and DOCX file types are accepted; other types are rejected.
**Legacy:** Client-side and server-side file type check
**Modern:** API 400 on invalid file type
**Risk:** Low

---

## Workflow Actions

### COOP-CLAIM-034 — Save as Draft
**Description:** Clicking "Save Draft" saves the claim in Draft status without triggering validation for attachment or completion.
**Legacy:** `ClaimService.SaveDraft`
**Modern:** `PUT /api/coop/claims/{id}/draft`
**Risk:** Low

---

### COOP-CLAIM-035 — Submit Claim
**Description:** Clicking "Submit" runs full validation and, if passing, transitions claim to Submitted status.
**Legacy:** `ClaimService.SubmitClaim → UpdateClaimStatus → InitiateApprovalWorkflow`
**Modern:** `POST /api/coop/claims/{id}/submit`
**Risk:** High — Entire submit pipeline

---

### COOP-CLAIM-036 — Create Workflow Record on Submit
**Description:** Upon successful submission, a workflow record is created routing the claim to the approver.
**Legacy:** `WorkflowService.InitiateApprovalWorkflow → usp_Coop_InsertWorkflowRecord`
**Modern:** Triggered within API submit handler
**Risk:** High — Approval chain must be created correctly

---

### COOP-CLAIM-037 — Send Submission Notification
**Description:** Upon successful submission, an email notification is sent to the submitter confirming submission, and to the approver queue.
**Legacy:** `NotificationService.SendSubmissionNotification`
**Modern:** API submit handler triggers notification service
**Risk:** Medium

---

### COOP-CLAIM-038 — Create Audit Record on Submit
**Description:** Submission creates an audit record with action type "Submit", old status, new status, timestamp, and user.
**Legacy:** `AuditService.LogAction`
**Modern:** API submit handler calls audit endpoint
**Risk:** Medium — Audit completeness must match legacy

---

## Data Persistence

### COOP-CLAIM-039 — Create Claim Header Record
**Description:** A new claim header record is written to `dbo.CoopClaims` with correct dealer, program, status, and dates.
**Legacy:** `ClaimService.CreateClaim → usp_Coop_CreateClaim`
**Modern:** API `POST /api/coop/claims → usp_Coop_CreateClaim`
**Risk:** Medium

---

### COOP-CLAIM-040 — Create Claim Detail Records
**Description:** Claim detail line items are written to `dbo.CoopClaimDetails`.
**Legacy:** `ClaimService.SaveDraft → usp_Coop_SaveClaimDetails`
**Modern:** API includes details in request body
**Risk:** Medium

---

### COOP-CLAIM-041 — Update Claim Status in Database
**Description:** Status field on claim header is updated to "Submitted" after successful submission.
**Legacy:** `usp_Coop_UpdateClaimStatus`
**Modern:** Same SP called from API
**Risk:** Low

---

### COOP-CLAIM-042 — Store Attachment Record
**Description:** Attachment metadata (filename, size, storage path) is written to `dbo.CoopAttachments`.
**Legacy:** `AttachmentService.UploadAttachment → usp_Coop_AttachmentInsert`
**Modern:** `POST /api/coop/claims/{id}/attachments`
**Risk:** Low

---

### COOP-CLAIM-043 — Create Workflow Record
**Description:** A workflow record is written to `dbo.CoopWorkflow` with the initial approval step.
**Legacy:** `WorkflowService.InitiateApprovalWorkflow → usp_Coop_InsertWorkflowRecord`
**Modern:** Same SP via API
**Risk:** High

---

### COOP-CLAIM-044 — Create Audit Record in Database
**Description:** Audit record written to `dbo.CoopAudit` with all required fields.
**Legacy:** `AuditService.LogAction → usp_Coop_InsertAuditRecord`
**Modern:** Same SP via API
**Risk:** Medium

---

## Security & Authorization

### COOP-CLAIM-045 — Require Authentication
**Description:** Unauthenticated users cannot access the Submit Claim page or API endpoints.
**Legacy:** `[Authorize]` on PageModel
**Modern:** `[Authorize]` on PageModel + JWT bearer on API
**Risk:** Low

---

### COOP-CLAIM-046 — Require Dealer Role
**Description:** Only users with the Dealer or DealerAdmin role can access Submit Claim.
**Legacy:** `[Authorize(Roles = "Dealer,DealerAdmin")]`
**Modern:** Same page policy + API authorization policy
**Risk:** Low

---

### COOP-CLAIM-047 — Prevent Cross-Dealer Data Access
**Description:** A dealer can only view and submit claims for their own dealership; accessing another dealer's claims returns 403 or 404.
**Legacy:** Data scoping via `GetCurrentDealerId()` in all DLL calls
**Modern:** API enforces dealer scope via auth context
**Risk:** High — Data isolation is critical

---

### COOP-CLAIM-048 — Prevent CoopReviewer from Submitting
**Description:** Users with only CoopReviewer role cannot access the Submit Claim page.
**Legacy:** Role check on page
**Modern:** Same
**Risk:** Low

---

### COOP-CLAIM-049 — Prevent Injection via Input Fields
**Description:** All text inputs are sanitized; no SQL injection or XSS is possible through claim submission.
**Legacy:** Parameterized SPs, HTML encoding
**Modern:** Same + API model binding
**Risk:** Medium

---

## High-Risk Units Summary

The following functional units require extra verification due to financial impact or complex logic migration:

| ID | Title | Risk | Reason |
|---|---|---|---|
| COOP-CLAIM-013 | Validate Program Eligibility | High | Logic moved from DLL to API |
| COOP-CLAIM-016 | Validate Claim Date Within Period | High | Period boundary calculation |
| COOP-CLAIM-019 | Validate Amount vs Fund Balance | High | Financial-critical |
| COOP-CLAIM-020 | Validate Per-Claim Maximum | High | Financial-critical |
| COOP-CLAIM-023 | Enforce Annual Cap | High | Financial cap enforcement |
| COOP-CLAIM-035 | Submit Claim (full pipeline) | High | Multi-step SP chain |
| COOP-CLAIM-036 | Create Workflow Record | High | Approval routing |
| COOP-CLAIM-043 | Create Workflow Record in DB | High | Data persistence |
| COOP-CLAIM-047 | Prevent Cross-Dealer Access | High | Data isolation |
