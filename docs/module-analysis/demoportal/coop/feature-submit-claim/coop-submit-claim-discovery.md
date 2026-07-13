# Co-op Submit Claim - Repository Discovery

**Module:** Co-op
**Feature:** Submit Claim
**Page Path:** `/Coop/SubmitClaim`
**Phase:** 1 - Repository Analysis

> **Note:** This document is a template populated with representative discovery findings.
> Update sections marked `[POPULATE FROM SOURCE]` after running analysis against actual repositories.

---

## 1. Legacy Implementation

### Razor Page

| Item | Value |
|---|---|
| Page | `Pages/Coop/SubmitClaim.cshtml` |
| Code Behind | `Pages/Coop/SubmitClaim.cshtml.cs` |
| Model | `SubmitClaimModel` |
| Base Class | `PageModel` |

**Page Model Properties** `[POPULATE FROM SOURCE]`
- `ClaimHeaderVM ClaimHeader`
- `IList<SelectListItem> Programs`
- `IList<SelectListItem> Dealers`
- `IList<SelectListItem> FundTypes`
- `IList<AttachmentVM> Attachments`

**Page Handlers**
- `OnGetAsync()` - Load claim form, populate dropdowns
- `OnPostSaveDraftAsync()` - Save as draft
- `OnPostSubmitAsync()` - Submit claim
- `OnPostUploadAttachmentAsync()` - Handle file upload
- `OnPostDeleteAttachmentAsync()` - Remove attachment

---

### Business Logic DLL Calls

| DLL | Namespace | Method | Purpose |
|---|---|---|---|
| `ClaimService.dll` | `DealerPlatform.Claims` | `CreateClaim(ClaimHeader)` | Insert claim header record |
| `ClaimService.dll` | `DealerPlatform.Claims` | `SaveDraft(ClaimHeader, List<ClaimDetail>)` | Save draft state |
| `ClaimService.dll` | `DealerPlatform.Claims` | `SubmitClaim(int claimId, string userId)` | Submit for approval |
| `ClaimService.dll` | `DealerPlatform.Claims` | `GetClaimById(int claimId)` | Retrieve claim |
| `FundService.dll` | `DealerPlatform.Funds` | `ValidateFundAvailability(int programId, decimal amount)` | Check fund balance |
| `FundService.dll` | `DealerPlatform.Funds` | `GetActiveProgramsForDealer(int dealerId)` | Load dealer programs |
| `ValidationService.dll` | `DealerPlatform.Validation` | `ValidateClaim(ClaimHeader)` | Run business rules |
| `AttachmentService.dll` | `DealerPlatform.Attachments` | `UploadAttachment(int claimId, IFormFile file)` | Store attachment |
| `AttachmentService.dll` | `DealerPlatform.Attachments` | `DeleteAttachment(int attachmentId)` | Remove attachment |
| `WorkflowService.dll` | `DealerPlatform.Workflow` | `InitiateApprovalWorkflow(int claimId)` | Start approval chain |
| `AuditService.dll` | `DealerPlatform.Audit` | `LogAction(string entity, int id, string action)` | Write audit record |
| `NotificationService.dll` | `DealerPlatform.Notifications` | `SendSubmissionNotification(int claimId)` | Email submitter + approver |

---

### Stored Procedures Called (Legacy)

| Procedure | Purpose |
|---|---|
| `usp_Coop_CreateClaim` | Insert ClaimHeader record |
| `usp_Coop_SaveClaimDetails` | Insert/update ClaimDetail records |
| `usp_Coop_UpdateClaimStatus` | Update status on ClaimHeader |
| `usp_Coop_GetActiveProgramsByDealer` | Fetch eligible programs |
| `usp_Coop_ValidateClaimEligibility` | Business rule validation |
| `usp_Coop_InsertWorkflowRecord` | Insert into workflow table |
| `usp_Coop_InsertAuditRecord` | Insert into audit table |
| `usp_Coop_GetClaimById` | Retrieve claim with details |
| `usp_Coop_AttachmentInsert` | Insert attachment record |
| `usp_Coop_AttachmentDelete` | Soft-delete attachment |

---

### Database Tables (Legacy)

| Table | Purpose |
|---|---|
| `dbo.CoopClaims` | Claim header records |
| `dbo.CoopClaimDetails` | Claim line item details |
| `dbo.CoopPrograms` | Co-op program definitions |
| `dbo.CoopFunds` | Fund balances per program/period |
| `dbo.CoopAttachments` | Claim attachment metadata |
| `dbo.CoopWorkflow` | Workflow/approval state |
| `dbo.CoopAudit` | Audit trail |
| `dbo.Dealers` | Dealer master data |
| `dbo.Users` | User accounts |
| `dbo.Roles` | Role definitions |
| `dbo.UserRoles` | User-role assignments |

---

### Validation Rules (Legacy)

| Field | Rule | Error Message |
|---|---|---|
| DealerID | Required | "Dealer is required" |
| ProgramID | Required | "Program is required" |
| ProgramID | Must be active, dealer-eligible | "You are not eligible for this program" |
| ClaimDate | Required | "Claim date is required" |
| ClaimDate | Cannot be future date | "Claim date cannot be in the future" |
| ClaimDate | Must be within program period | "Claim date is outside the program period" |
| ClaimAmount | Required | "Claim amount is required" |
| ClaimAmount | Must be > 0 | "Claim amount must be greater than zero" |
| ClaimAmount | Cannot exceed fund balance | "Insufficient fund balance for this claim" |
| ClaimAmount | Cannot exceed program max per claim | "Amount exceeds maximum allowed per claim" |
| Attachments | At least one required for submission | "At least one attachment is required to submit" |
| Description | Required | "Description is required" |
| Description | Max 500 characters | "Description cannot exceed 500 characters" |

---

### Business Rules (Legacy)

1. **Dealer Eligibility**: Dealer must be enrolled in the selected Co-op Program
2. **Period Validation**: Claim date must fall within an open program period
3. **Fund Availability**: Requested amount cannot exceed remaining fund balance
4. **Per-Claim Limit**: Individual claim amount cannot exceed program's per-claim maximum
5. **Annual Cap**: Total dealer claims for the period cannot exceed annual cap
6. **Duplicate Prevention**: No duplicate claims for same dealer/program/date within 24 hours
7. **Attachment Requirement**: At least one attachment required before submission (not for draft)
8. **Status Lock**: Once submitted, claim cannot be edited without being returned

---

### Status Transitions (Legacy)

```
[Draft] -> [Submitted] -> [Under Review] -> [Approved] -> [Payment Pending] -> [Paid]
                      -> [Returned]     -> [Draft]     (can re-submit)
                      -> [Rejected]
```

---

### Roles and Permissions (Legacy)

| Role | Can Submit | Can View Own | Can View All | Can Approve | Can Admin |
|---|---|---|---|---|---|
| Dealer | Yes | Yes | No | No | No |
| DealerAdmin | Yes | Yes | Yes (dealer) | No | No |
| CoopReviewer | No | No | Yes | Yes | No |
| CoopAdmin | No | No | Yes | Yes | Yes |
| SystemAdmin | No | No | Yes | Yes | Yes |

---

## 2. Modern Implementation

### Razor Page (Modern)

| Item | Value |
|---|---|
| Page | `Pages/Coop/SubmitClaim.cshtml` |
| Code Behind | `Pages/Coop/SubmitClaim.cshtml.cs` |
| Model | `SubmitClaimModel` |
| Change | DLL calls replaced with API calls via `ICoopApiClient` |

---

### REST API Endpoints (Modern)

| Method | Endpoint | Replaces DLL | Purpose |
|---|---|---|---|
| `POST` | `/api/coop/claims` | `ClaimService.CreateClaim` | Create claim header |
| `PUT` | `/api/coop/claims/{id}/draft` | `ClaimService.SaveDraft` | Save draft |
| `POST` | `/api/coop/claims/{id}/submit` | `ClaimService.SubmitClaim` | Submit claim |
| `GET` | `/api/coop/claims/{id}` | `ClaimService.GetClaimById` | Retrieve claim |
| `GET` | `/api/coop/programs?dealerId={id}` | `FundService.GetActiveProgramsForDealer` | Get programs |
| `GET` | `/api/coop/programs/{id}/funds` | `FundService.ValidateFundAvailability` | Check fund balance |
| `POST` | `/api/coop/claims/{id}/attachments` | `AttachmentService.UploadAttachment` | Upload attachment |
| `DELETE` | `/api/coop/claims/{id}/attachments/{attachId}` | `AttachmentService.DeleteAttachment` | Delete attachment |

---

### Stored Procedures Called (Modern)

| Procedure | Status | Notes |
|---|---|---|
| `usp_Coop_CreateClaim` | Refactored | Now called from API controller |
| `usp_Coop_SaveClaimDetails` | Refactored | Now called from API controller |
| `usp_Coop_UpdateClaimStatus` | Unchanged | Same SP, called from API |
| `usp_Coop_GetActiveProgramsByDealer` | Unchanged | Same SP |
| `usp_Coop_ValidateClaimEligibility` | Unchanged | Still called server-side |
| `usp_Coop_InsertWorkflowRecord` | Unchanged | Called after submit |
| `usp_Coop_InsertAuditRecord` | Unchanged | Called from API |
| `usp_Coop_GetClaimById` | Unchanged | Same SP |
| `usp_Coop_AttachmentInsert` | Refactored | Called from attachment API |
| `usp_Coop_AttachmentDelete` | Refactored | Called from attachment API |

---

## 3. Discovery Summary

| Category | Legacy | Modern | Delta |
|---|---|---|---|
| Razor Pages | 1 | 1 | None |
| DLL Methods | 12 | 0 (replaced by API) | All replaced |
| API Endpoints | 0 | 8 | New |
| Stored Procedures | 10 | 10 | Same (some refactored) |
| Database Tables | 11 | 11 | None |
| Validation Rules | 11 | 11 | `[VERIFY]` |
| Business Rules | 8 | 8 | `[VERIFY]` |
| Status Values | 7 | 7 | `[VERIFY]` |
| Roles | 5 | 5 | `[VERIFY]` |

---

## 4. Risk Assessment

| Risk | Level | Notes |
|---|---|---|
| Business rule parity between DLL and API | High | Must verify each rule individually |
| Stored procedure behavioral changes | Medium | Some SPs were "refactored" - verify outputs |
| Fund availability calculation | High | Financial impact if incorrect |
| Duplicate claim detection logic | Medium | Was in DLL, must be in API |
| Audit record completeness | Medium | Must verify same fields captured |
| Workflow routing logic | High | Approval chain must match exactly |
| Error message parity | Low | Messages may differ, document all variances |

---

*Document generated: [DATE]*
*Legacy Repo: `[POPULATE]`*
*Modern Repo: `[POPULATE]`*
