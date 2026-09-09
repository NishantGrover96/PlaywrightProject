# SPIFF (Flip to Samsung) - Module Discovery

Generated: 2026-09-09
Environment discovered against: UAT - `https://samsungportaluat.channel-fusion.com`
Discovery method: source read (`AddClaim.cshtml`/`.cs`, `ProcessClaims.cshtml`/`.cs`, `SearchClaim.cshtml`/`.cs`) + live Playwright MCP walkthrough (login, claim submission x4 users, DOM inspection via `page.evaluate`)

---

## 1. Module Summary

"SPIFF" is the internal/code name for the Samsung HVAC "Flip to Samsung" sales-associate claim-submission program. A Sales Associate (or Dist Admin / DDA / Spec Rep Dist acting on their behalf) submits a claim against an active SPIFF campaign, attaching supporting documents and per-refrigerant-category tonnage. Admin/SCF roles search, review, and approve/deny/hold submitted claims.

The UAT environment used for discovery explicitly displays: *"This is a test site. Profile updates and claims submitted here will not be processed. To submit a new claim, please go to https://portal.samsunghvac.com."* - confirmed present on the live `AddClaim` page (`.alert.alert-warning`). Claims submitted here get a real tracking number and go through the real submit flow, but are not processed downstream.

## 2. Screens / Routes

| Screen | Route | Purpose |
|---|---|---|
| Current SPIFF | `/Rewards/Spiff/CurrentSpiff` | Lists active SPIFF campaigns (table: SPIFF Name, Start/End Date, Documentation, "Submit a Claim" action) |
| Submit a Claim | `/Rewards/Spiff/AddClaim?seq={encryptedSeq}` | Claim submission form (see Section 4) |
| Search Claim / Claim History | `/Rewards/SPIFF/SearchClaim` (`?action=process` for admin mode) | SA's own claim history, or admin claim search |
| Process Claims | `/Rewards/SPIFF/ProcessClaims?RebateId={encrypted}` | Admin approve/deny/hold per claim line |
| Registration | `/Rewards/Spiff/Registration` | Company Representative self-registration (linked from login page; **not automated - see Gaps**) |

`AddClaim` cannot be deep-linked directly with a hand-built URL - `seq` is an encrypted campaign identifier rendered server-side on `CurrentSpiff`'s "Submit a Claim" link. The confirmed real navigation path is: **login -> CurrentSpiff -> click "Submit a Claim" on the active campaign row -> AddClaim**.

## 3. Navigation Path (confirmed live)

```
Login (/account/login)
  |
  v
Index (home) - tile grid: Co-op Management / Dealer Incentives / Reports / Resources / Support
  (no direct "SPIFF" tile observed for the Dist Admin role tested - reached via direct URL)
  |
  v
Current SPIFF (/Rewards/Spiff/CurrentSpiff)
  - table row: "2026 Flip to Samsung" | 03/23/2026 - 12/31/2026 | [Submit a Claim] | [doc PDF]
  |
  v
Submit a Claim (/Rewards/Spiff/AddClaim?seq=...)
  - fill form -> Add line item -> accept terms -> Submit your claim
  |
  v
Congratulations panel (#dvClaimSubmit) - claim tracking # (.spnClaimNumber)
  - "View Claim History" -> /Rewards/SPIFF/SearchClaim
  - "Submit Another Claim" -> /Rewards/SPIFF/CurrentSPIFF
```

Note: the home page tile grid did **not** show a distinct "SPIFF" entry for the Dist Admin role exercised live - SPIFF was reached by navigating directly to `/Rewards/Spiff/CurrentSpiff`. Whether a nav link exists for other roles (e.g. a dedicated SA/Company Representative role) was not confirmed - flagged as a gap.

## 4. Submit a Claim - Form Inventory (confirmed via `page.evaluate` DOM dump + `AddClaim.cshtml` source)

| Field | Label | id | name | Notes |
|---|---|---|---|---|
| Document upload | Upload Documents * | `#dropzone_fuBGImage` (container), hidden `input[type=file]` inside it | - | Dropzone.js; accepts multiple files in one native file-chooser call; PDF/XLS/DOC/image, 250MB max |
| Quote Number | Samsung Quote Number* | `#txtInvoiceNo` | `InvoiceNo` | placeholder `e.g. Q12345ABC` |
| Date of Sale | Date of Sale* | `#txtDateOfSale` | `DOS` | **readonly** - bootstrap-datepicker widget; `.fill()` fails, must click + pick a day from `.datepicker-days td.day` or drive via the datepicker's jQuery API |
| Project Name | Project Name* | `#txtProjectName` | `ProjectName` | |
| Project City | Project City* | `#txtProjectCity` | `ProjectCity` | |
| Project State | Project State* | `#txtProjectState` | `ProjectState` | free text, not a dropdown |
| Original BOD (Competitor) | Original BOD (Competitor)* | `#txtOriginalBOD` | `OriginalBOD` | placeholder `e.g. Carrier, Trane` |
| Engineering Firm Name | Engineering Firm Name* | `#txtEngineeringFirmName` | `EngineeringFirmName` | |
| Engineering Contact | Engineering Contact* | `#txtEngineeringContact` | `EngineeringContact` | |
| Engineering Phone | Engineering Phone* | `#txtEngineeringPhone` | `EngineeringPhone` | |
| Engineering Email | Engineering Email* | `#txtEngineeringEmail` | `EngineeringEmail` | |
| Submission Comments | Submission Comments / Notes | `#txtSubmissionComments` | `SubmissionComments` | optional, textarea |
| R410A - DVM tonnage | R410A - DVM ... * | `#txtQuantityR410A` | - | "0 if not applicable" |
| All Other Samsung Products tonnage | All Other Samsung Products ... * | `#txtQuantityOther` | - | "0 if not applicable" |
| Add line item | button | `#btnAddItem` | - | commits the header+tonnage fields as one claim line into `#tblClaimLines`; multiple lines supported |
| Accept T&Cs | checkbox | `#chkAccept` | `chkAccept[]` | plain visible checkbox, `.click()` works without `force` (contrary to the original page-object assumption of a CSS-hidden skin - corrected) |
| Submit your claim | button | `#btnAddClaim` | - | disabled/no-ops until required fields + terms are satisfied (exact client-side gating not exhaustively probed) |

### Static instructional panel (not live validation)

`.alert.alert-info` block "Please upload all three required documents before submitting: Project-Specification Document / Mechanical Schedule with Competitor's Product / Stamped Mechanical Schedule with Samsung Products" is a **static** panel (confirmed via `class` inspection - stays `alert-info`, does not toggle to an error state or update its text as files are added). Whether the app actually **enforces** a 3-document minimum server-side, or only instructs the user, was **not confirmed** - all 5 live submission attempts uploaded exactly 3 files, so the single-file/two-file case was never exercised.

### Upload confirmation UI (gap)

After a successful upload, Dropzone renders a per-file preview (check icon, "Remove" link, filename link to the stored document) for each of the 3 files. The single static element `#lblUploadedFileName` referenced in the original page-object build exists in markup but is a separate, legacy single-file element that appears to stay empty in this multi-document flow - it is **not** a reliable way to assert "N documents uploaded." The actual per-file preview markup's class names were not captured live (no plain-DOM dump was taken while files were attached, to avoid an extra live upload/submission). **Follow-up needed**: capture that markup once, then add a `getUploadedDocumentCount()` helper to `SpiffPage.ts`.

## 5. Success State (confirmed via source, `AddClaim.cshtml:400-407`)

```html
<div id="dvClaimSubmit">
  <div class="centerIcon success"><i class="fal fa-check-circle"></i></div>
  <h4> Congratulations! </h4>
  <p>Thank you for your claim submission. Your claim tracking # <b><span class="spnClaimNumber text-success"></span></b></p>
  <p>We will email you the status of your claim as it is being processed...</p>
</div>
```
`#dvClaimSubmit` / `.spnClaimNumber` (used by `SpiffPage.ts`'s `claimSubmittedPanel`/`claimNumberSpan`) are confirmed correct against source.

## 6. Roles Observed Live

| Role (as supplied) | Login result | Notes |
|---|---|---|
| Dist Admin (kleffew@aeshvacinc.com) | Success | Submitted claim, tracking # 6513764 |
| Dist Admin (ezajdel@aeshvacinc.com) | Success | Submitted claim, tracking # 6513765 |
| DDA (mbevan@aeshvacinc.com) | Success | Submitted claim, tracking # 6513766 |
| Spec Rep Dist (vicki@bplsales.ca) | Success | Submitted claim, tracking # 6513767 |
| Company Representative (ngrover@channel-fusion.com) | **Failed** - "Please enter valid login details." | Not resolved this session - see Coverage Report Automation Gaps |

All 4 successful logins reached the identical `CurrentSpiff` -> `AddClaim` flow with the same campaign (`2026 Flip to Samsung`, `seq=Yx96GpNq2y4Equal`) - no role-specific field differences were observed in the claim form itself. Whether the home-page tile grid or available claim-form fields differ for other roles (SA, SCF, BMADMIN, admin variants referenced in `test-data.json`) was **not** exercised live - only these 4 roles were.

## 7. Automation Gaps From This Discovery Pass

- Registration (`/Rewards/Spiff/Registration`) and tax-gating (`SaveW9TaxInformation`) screens - not explored live or automated (address-validation-heavy form per prior source-only review).
- Whether the "3 required documents" instructional panel is server/client enforced - unconfirmed.
- Dropzone per-file preview markup (for a reliable "N uploaded" assertion) - unconfirmed.
- Home-page navigation entry point for SPIFF (no distinct tile seen for Dist Admin) - not confirmed for other roles.
- Company Representative login failure for the supplied `ngrover@channel-fusion.com` account - unresolved (see Coverage Report).
