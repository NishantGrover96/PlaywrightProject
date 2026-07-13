# Co-op Submit Claim - Migration Mapping

**Module:** Co-op
**Feature:** Submit Claim
**Phase:** 3 - Migration Mapping

---

## Overview

This document maps every Legacy component to its Modern equivalent and assesses migration risk.

**Legend:**
- Risk: `Low` | `Medium` | `High` | `Blocker`
- Status: `Mapped` | `Partial` | `Gap` | `New`

---

## Razor Page Mapping

| Functional Unit | Legacy Location | Modern Location | Risk | Status | Notes |
|---|---|---|---|---|---|
| Submit Claim Page | `Pages/Coop/SubmitClaim.cshtml` | `Pages/Coop/SubmitClaim.cshtml` | Low | Mapped | Same page; backend calls changed |
| Page Model | `SubmitClaim.cshtml.cs::SubmitClaimModel` | `SubmitClaim.cshtml.cs::SubmitClaimModel` | Medium | Partial | DLL calls replaced with `ICoopApiClient` injections |
| Save Draft Handler | `OnPostSaveDraftAsync()` | `OnPostSaveDraftAsync()` -> `PUT /api/coop/claims/{id}/draft` | Low | Mapped | |
| Submit Handler | `OnPostSubmitAsync()` | `OnPostSubmitAsync()` -> `POST /api/coop/claims/{id}/submit` | High | Mapped | Entire submit pipeline moved to API |
| Upload Attachment | `OnPostUploadAttachmentAsync()` | `OnPostUploadAttachmentAsync()` -> `POST /api/coop/claims/{id}/attachments` | Medium | Mapped | |
| Delete Attachment | `OnPostDeleteAttachmentAsync()` | `OnPostDeleteAttachmentAsync()` -> `DELETE /api/coop/claims/{id}/attachments/{id}` | Low | Mapped | |

---

## Business Logic DLL -> REST API Mapping

| Functional Unit | Legacy: DLL Method | Modern: API Endpoint | Risk | Status | Notes |
|---|---|---|---|---|---|
| Create Claim | `ClaimService.CreateClaim(ClaimHeader)` | `POST /api/coop/claims` | Medium | Mapped | Request body must include all header fields |
| Save Draft | `ClaimService.SaveDraft(header, details)` | `PUT /api/coop/claims/{id}/draft` | Low | Mapped | |
| Submit Claim | `ClaimService.SubmitClaim(claimId, userId)` | `POST /api/coop/claims/{id}/submit` | **High** | Mapped | Validation + workflow + audit all in API |
| Get Claim | `ClaimService.GetClaimById(claimId)` | `GET /api/coop/claims/{id}` | Low | Mapped | Response schema must match VM shape |
| Get Programs for Dealer | `FundService.GetActiveProgramsForDealer(dealerId)` | `GET /api/coop/programs?dealerId={id}` | Medium | Mapped | Eligibility filter must match |
| Validate Fund Availability | `FundService.ValidateFundAvailability(programId, amount)` | `GET /api/coop/programs/{id}/funds` + API validation | **High** | Mapped | Fund balance calculation critical |
| Validate Claim (Business Rules) | `ValidationService.ValidateClaim(ClaimHeader)` | Business logic in `ClaimController` + `ClaimValidationService` | **High** | Partial | All 8 business rules must be migrated |
| Upload Attachment | `AttachmentService.UploadAttachment(claimId, file)` | `POST /api/coop/claims/{id}/attachments` | Medium | Mapped | |
| Delete Attachment | `AttachmentService.DeleteAttachment(attachmentId)` | `DELETE /api/coop/claims/{id}/attachments/{attachId}` | Low | Mapped | |
| Initiate Workflow | `WorkflowService.InitiateApprovalWorkflow(claimId)` | Called internally within API submit handler | **High** | Partial | Verify routing table populated correctly |
| Log Audit | `AuditService.LogAction(entity, id, action)` | Called internally within API action handlers | Medium | Partial | Verify all fields captured |
| Send Notification | `NotificationService.SendSubmissionNotification(claimId)` | Notification service called from API handler | Medium | Mapped | Email template parity `[VERIFY]` |

---

## Validation Rules Mapping

| Rule | Legacy Location | Modern Location | Risk | Status |
|---|---|---|---|---|
| Dealer required | `ModelState` + `ValidationService` | API `[Required]` attribute | Low | Mapped |
| Program required | `ModelState` | API `[Required]` | Low | Mapped |
| Program eligibility | `FundService.ValidateFundAvailability` | `ClaimValidationService.ValidateEligibility` | **High** | `[VERIFY]` |
| Claim date required | `ModelState` | API `[Required]` | Low | Mapped |
| Claim date not future | `ValidationService` | `ClaimValidationService` | Medium | `[VERIFY]` |
| Claim date within period | `ValidationService` | `ClaimValidationService` | **High** | `[VERIFY]` |
| Amount required | `ModelState` | API `[Required]` | Low | Mapped |
| Amount > 0 | `ValidationService` | `ClaimValidationService` | Low | Mapped |
| Amount ≤ fund balance | `FundService.ValidateFundAvailability` | `ClaimValidationService` | **High** | `[VERIFY]` |
| Amount ≤ per-claim max | `ValidationService` | `ClaimValidationService` | **High** | `[VERIFY]` |
| Attachment required for submit | `ClaimService.SubmitClaim` pre-check | API submit endpoint pre-check | Medium | `[VERIFY]` |
| Description required | `ModelState` | API `[Required]` | Low | Mapped |
| Description max 500 chars | `ModelState` `[MaxLength(500)]` | API `[MaxLength(500)]` | Low | Mapped |
| Annual cap enforcement | `ValidationService.ValidateAnnualCap` | `ClaimValidationService` | **High** | `[VERIFY]` |
| Duplicate prevention | `ClaimService.CheckDuplicate` | `ClaimValidationService.CheckDuplicate` | Medium | `[VERIFY]` |

---

## Stored Procedure Mapping

| SP Name | Legacy Caller | Modern Caller | Changes | Risk | Status |
|---|---|---|---|---|---|
| `usp_Coop_CreateClaim` | `ClaimService.dll` | `ClaimController` (via EF/Dapper) | Refactored caller only | Medium | Mapped |
| `usp_Coop_SaveClaimDetails` | `ClaimService.dll` | `ClaimController` | Refactored caller only | Medium | Mapped |
| `usp_Coop_UpdateClaimStatus` | `ClaimService.dll` | `ClaimController` | None | Low | Mapped |
| `usp_Coop_GetActiveProgramsByDealer` | `FundService.dll` | `ProgramController` | None | Low | Mapped |
| `usp_Coop_ValidateClaimEligibility` | `ValidationService.dll` | `ClaimValidationService` | None | Low | Mapped |
| `usp_Coop_InsertWorkflowRecord` | `WorkflowService.dll` | `ClaimController.SubmitClaim` | None | **High** | `[VERIFY]` |
| `usp_Coop_InsertAuditRecord` | `AuditService.dll` | `ClaimController` action handlers | None | Medium | `[VERIFY]` |
| `usp_Coop_GetClaimById` | `ClaimService.dll` | `ClaimController` | None | Low | Mapped |
| `usp_Coop_AttachmentInsert` | `AttachmentService.dll` | `AttachmentController` | Refactored caller only | Low | Mapped |
| `usp_Coop_AttachmentDelete` | `AttachmentService.dll` | `AttachmentController` | None | Low | Mapped |

---

## Data Model Mapping

| Legacy Table | Modern Table | Changes | Notes |
|---|---|---|---|
| `dbo.CoopClaims` | `dbo.CoopClaims` | None | Same schema |
| `dbo.CoopClaimDetails` | `dbo.CoopClaimDetails` | None | Same schema |
| `dbo.CoopPrograms` | `dbo.CoopPrograms` | None | |
| `dbo.CoopFunds` | `dbo.CoopFunds` | None | |
| `dbo.CoopAttachments` | `dbo.CoopAttachments` | None | Verify storage path format |
| `dbo.CoopWorkflow` | `dbo.CoopWorkflow` | None | Verify all fields populated |
| `dbo.CoopAudit` | `dbo.CoopAudit` | None | Verify all fields populated |

---

## Gap Analysis

### Gaps - Legacy Features Not Yet Confirmed in Modern

| ID | Description | Priority |
|---|---|---|
| GAP-001 | Annual cap enforcement - verify `ClaimValidationService` has full logic | Blocker |
| GAP-002 | Duplicate claim detection - verify 24-hour window logic | High |
| GAP-003 | Workflow routing table - verify approver assignment rules | Blocker |
| GAP-004 | Email notification content - verify templates match | Medium |
| GAP-005 | Fund balance decrement - verify updated after submit | High |

### Gaps - Modern Features Without Legacy Equivalent

| ID | Description | Notes |
|---|---|---|
| NEW-001 | API rate limiting on `/api/coop/claims` | New capability, no functional impact |
| NEW-002 | Structured error response schema | Better error messages, verify UI handles them |

---

## Risk Summary

| Risk Level | Count | Items |
|---|---|---|
| Blocker | 2 | GAP-001, GAP-003 |
| High | 7 | Program eligibility, fund balance, per-claim max, annual cap, amount validation, workflow record, cross-dealer access |
| Medium | 6 | Duplicate prevention, attachment handling, audit completeness, period boundary, create claim, notification |
| Low | Remainder | Simple field mappings, ModelState validations |

---

*Mapping completed: [DATE]*
*Reviewer: [NAME]*
*Status: DRAFT - Requires source code verification*
