# Coop — Submit Pre-Approval — Gap Analysis

> Module: `coop` | Feature: `submit-preapproval`
> Generated: 2026-06-19 | Pipeline: Step 2.5 (Gap Analysis — Re-run)
> Input: `docs/functional-catalogs/coop/feature-submit-preapproval/functional-units.md`
>         `docs/migration-reports/coop/feature-submit-preapproval/mapping.md`

---

## Missing Functional Units

_None. All 47 FUs have coverage in modern. FU-047 is new in modern (additional behavior)._

---

## Partial Coverage / Gaps

### FU-036 — Shows & Events Record — MEDIUM

| Dimension | Legacy | Modern | Gap |
|---|---|---|---|
| `ShowName` | Persisted | ✅ Passed to `LinkShowToPreapprovalAsync` | No gap |
| `ShowLocation` | Persisted | ✅ Passed to `LinkShowToPreapprovalAsync` | No gap |
| `StartDate` | Persisted | ✅ Passed as `showDate` | No gap |
| `ShowType` | Persisted (IndvShow/GrpShow) | ✅ Passed to `LinkShowToPreapprovalAsync` | No gap |
| `EquipmentList` | Persisted via `DealerShows.EquipmentList` | ❌ NOT passed to API | **Gap** |
| `Dealers` (group participating) | Persisted via `DealerShows.Dealers` | ❌ NOT passed to API | **Gap** |
| `Cost` / `ShowCost` | Persisted via `DealerShows.Cost` | ❌ NOT passed to API | **Gap** |
| `DlrRacf` (submitter user ID) | Persisted via `DealerShows.DlrRacf` | ❌ NOT passed to API | **Gap** |
| `Email` (submitter TO email) | Persisted via `DealerShows.Email` | ❌ NOT passed to API | **Gap** |
| `DlrFormStatus` | Set to `"SUBMITTED"` | ❌ Not controlled from page model | **Gap** |

**Assessment**: The core preapproval record IS created and the show is linked. Missing fields are supplemental `dealer_shows` record fields. These affect:
- Shows & Events reporting (equipment list display, cost tracking)
- Group show participant visibility
- Audit trail (who submitted, from which email)

**Impact Level**: **Medium** — Core preapproval flow succeeds. Affected users: IndvShow and GrpShow branch users only. The preapproval number IS issued and email IS sent; the supplemental dealer_shows record is incomplete.

---

## Different Implementations (Functionally Equivalent)

### FU-029 — Media Type Requirements (N+1 vs Batch) — LOW

| Aspect | Legacy | Modern |
|---|---|---|
| API call pattern | 1 batch call: `GetAllMediaTypesRequirementByProgramSeq` | N calls per media type: `GetMediaTypesRequirementByProgramSeqAsync` |
| Result | All requirements for all media types | Same requirements, fetched individually |
| Output to client | Identical | Identical |

**Impact**: Performance regression for programs with many media types (e.g., 10 media types = 10 API calls instead of 1). No functional difference in output. **Low** impact for automation testing.

---

### FU-033 — Campaign Child Preapproval Processing — LOW

| Aspect | Legacy | Modern |
|---|---|---|
| Pattern | Server-side foreach, each child processed as separate `ProcessPreApproval` call | Children nested in `ChildPreapprovals` property of `SubmitPreapprovalApiModel`, processed by API in single call |
| Parent linking | Each child explicitly linked with `lngParentSeq` | API handles parent-child relationship internally |
| Result | Multiple preapproval records created | Same multiple preapproval records created |

**Impact**: Functionally identical from UI perspective. Same DB records produced. **Low** impact.

---

### FU-047 — Media Types Re-loaded on POST (New in Modern) — LOW

| Aspect | Legacy | Modern |
|---|---|---|
| On POST | No media type reload | `GetMediaType(SelectedFiscalYear)` called before mapping |
| Purpose | N/A | Required to populate `MediaTypes` list used by `MapToSubmitPreapprovalApiModel` |
| Additional API calls | 0 extra | N+1 extra (same as page load) |

**Testing implication**: Modern submission depends on `SelectedFiscalYear` being correctly bound from form. If binding fails (e.g., missing hidden field), media type mapping may use wrong fiscal year. Test must verify `hdnSelectedFiscalYear` is correctly submitted.

---

## Validation Coverage

All 19 DataEntry FUs (FU-007 through FU-025) confirmed present in both legacy and modern. Validation is implemented entirely client-side (JavaScript in `jsSubmitPreApproval.js`) and the `.cshtml` files are identical between legacy and modern. No validation gaps.

| Validation Rule | Legacy | Modern | Status |
|---|---|---|---|
| Campaign title required | JS `#spnErrorCampaingTitle` | Same JS + same .cshtml | ✅ Full |
| Ad title required | JS `#spnErrorAdTitle` | Same | ✅ Full |
| URL required (per media) | JS `#spnAdlandingPageURL` | Same | ✅ Full |
| Multiple URL format | JS `ValidateMultipleUrl()` | Same | ✅ Full |
| Show name required | JS `#spnErrorShowsAdTitle` | Same | ✅ Full |
| Show location required | JS address/city/state/zip spans | Same | ✅ Full |
| Show dates required | JS date picker validation | Same | ✅ Full |
| Show cost required | JS `#spnErrorShowsEquipmentCost` | Same | ✅ Full |
| Group dealer number required | JS `#spnErrorGroupDealerNumber` | Same | ✅ Full |
| Sponsorship name required | JS `#spnErrorSponsorshipAdTitle` | Same | ✅ Full |
| File upload required | JS `#spnErrorFile` + Dropzone | Same | ✅ Full |
| Email (me) required | JS `#spnEmailToMe` | Same | ✅ Full |
| Dealer ID (conditional) | JS per `dealeridtextrequiredflag` | Same | ✅ Full |

---

## Workflow Coverage

| Transition | Legacy | Modern | Status |
|---|---|---|---|
| Submit → Submitted status | `GetPreApprovalStatusByBranch` → `Submitted` | Same method, identical code | ✅ Full |
| Submit → AwaitingCSR (shows/sponsor/webseo) | Same method | Same | ✅ Full |
| Dealer linked after create | `UpdatePreApprovalDealer` | `LinkDealerToPreapprovalAsync` | ✅ Full |
| Parent dealer linked | Conditional `UpdatePreApprovalDealer` | Conditional `LinkDealerToPreapprovalAsync` | ✅ Full |
| Shows record created | `UpdateDealerShows` (12 fields) | `LinkShowToPreapprovalAsync` (6 fields) | ⚠️ Partial |
| URL saved | `SaveAdditionalInfoToPreApproval` | `SaveAdditionalInfoAsync` | ✅ Full |
| Comment saved | `updateComment` | `UpdateCommentAsync` | ✅ Full |
| Confirmation email sent | `SendPreApprovalEmail` | Same method | ✅ Full |

---

## Database Operations Coverage

| Operation | Legacy Table | Modern | Status |
|---|---|---|---|
| Preapproval header | `preapproval` table | API creates equivalent record | ✅ Full |
| Preapproval dealer | `preapproval_dealer` table | `LinkDealerToPreapprovalAsync` | ✅ Full |
| Dealer shows (core) | `dealer_shows` table (ShowName, Location, StartDate, ShowType) | `LinkShowToPreapprovalAsync` | ✅ Partial (5 fields missing) |
| Document image | `document_image` table | `UpdateDocumentImageAsync` | ✅ Full |
| Comment | `comment` table | `UpdateCommentAsync` | ✅ Full |
| Contact (email) | `contact` table | `UpdateContactAsync` | ✅ Full |
| Additional info | `preapproval_additional_info` | `SaveAdditionalInfoAsync` | ✅ Full |
| Product link | `preapproval_product` | `LinkProductToPreapprovalAsync` | ✅ Full |

---

## Security Rules Coverage

| Rule | Legacy | Modern | Status |
|---|---|---|---|
| Auth gate | `BasePageModel` `[Authorize]` | Same `BasePageModel` | ✅ Full |
| Dealer role — own dealer only | `UserSession.Dealer_number_seq` binding | Same session binding | ✅ Full |
| Corp/Admin — dealer search required | `SearchCorporateDealer()` | Same | ✅ Full |
| Dealer number seq encrypted | `IEncryptDecrypt.Encrypt/Decrypt` | Same | ✅ Full |
| `pdts` param (dealer type) encrypted | Same `_encryptDecrypt` | Same | ✅ Full |
| File path traversal prevention | GUID-based temp file naming | Same `Guid.NewGuid()` pattern | ✅ Full |

---

## Gap Classification Summary

| Level | Count | Items |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | FU-036: Shows & Events — EquipmentList, Dealers, Cost, DlrRacf, Email not persisted via `LinkShowToPreapprovalAsync` |
| Low | 3 | FU-029: N+1 media requirements API calls; FU-033: Campaign child processing pattern; FU-047: Media re-load on POST |

---

## Metrics

- **Functional Coverage**: 97.9% (46/47 FUs fully or partially covered; 1 partial)
- **Validation Coverage**: 100% (13/13 validation rules — identical .cshtml + JS)
- **Workflow Coverage**: 85.7% (6/7 workflow FUs — FU-036 partial)
- **Database Coverage**: 93.8% (7.5/8 operations — dealer_shows partial)
- **Security Coverage**: 100% (6/6 rules)
- **Critical gaps**: 0
- **High gaps**: 0
- **Medium gaps**: 1
- **Low gaps**: 3
