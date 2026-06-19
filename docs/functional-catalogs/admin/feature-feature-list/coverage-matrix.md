# Coverage Matrix — Admin / Feature List

**Generated:** 2026-06-19

| FU ID | Functional Unit | Tier | UI ✓ | Validation ✓ | Business Rule ✓ | DB/API ✓ | Security ✓ | Gap |
|-------|-----------------|------|------|--------------|-----------------|-----------|------------|-----|
| 1.1 | Page load + module tabs render | Smoke | ✅ | — | ✅ | ✅ | — | None |
| 1.2 | First tab active + features load | Smoke | ✅ | — | ✅ | ✅ | — | None |
| 1.3 | Tab click loads features | Regression | ✅ | — | ✅ | ✅ | — | None |
| 1.4 | Tab count badges | Regression | ✅ | — | ✅ | ✅ | — | None |
| 1.5 | URL param pre-selects tab | Regression | ✅ | — | ✅ | — | — | None |
| 2.1 | Feature table columns | Smoke | ✅ | — | — | — | — | None |
| 2.2 | Search text filter | Regression | ✅ | — | ✅ | — | — | None |
| 2.3 | Status filter | Regression | ✅ | — | ✅ | — | — | None |
| 2.4 | Combined filter + tab counts | Regression | ✅ | — | ✅ | ✅ | — | None |
| 2.5 | Reset filter shows all | Regression | ✅ | — | ✅ | — | — | None |
| 3.1 | Edit mode opens PIN modal | Smoke | ✅ | — | ✅ | — | ✅ | None |
| 3.2 | Correct PIN enables edit mode | Smoke | ✅ | ✅ | ✅ | ✅ | ✅ | None |
| 3.3 | Wrong PIN shows error | Regression | ✅ | ✅ | ✅ | ✅ | ✅ | None |
| 3.4 | Empty PIN client validation | Regression | ✅ | ✅ | — | — | — | None |
| 3.5 | Disable edit mode resets PIN | Regression | ✅ | — | ✅ | ✅ | ✅ | None |
| 3.6 | Action columns hidden off edit | Regression | ✅ | — | — | — | — | None |
| 4.1 | Toggle Off→On | Smoke | ✅ | — | ✅ | ✅ | ✅ | GAP-M01 (API) |
| 4.2 | Toggle On→Off | Smoke | ✅ | — | ✅ | ✅ | ✅ | GAP-M01 (API) |
| 4.3 | Toggle requires edit mode | Regression | ✅ | — | ✅ | — | ✅ | None |
| 4.4 | Toggle error reverts checkbox | Regression | ✅ | — | ✅ | ✅ | — | None |
| 5.1 | Role modal loads roles/div/country | Regression | ✅ | — | ✅ | ✅ | — | GAP-M02, GAP-M03 |
| 5.2 | Existing roles pre-checked | Regression | ✅ | — | ✅ | ✅ | — | None |
| 5.3 | "All" checkbox sync | Regression | ✅ | — | ✅ | — | — | None |
| 5.4 | Save user group | Regression | ✅ | — | ✅ | ✅ | — | GAP-M01 (API) |
| 5.5 | Cancel role modal | Low | ✅ | — | — | — | — | None |
| 6.1 | Scope modal loads | Regression | ✅ | — | ✅ | ✅ | — | GAP-M03 |
| 6.2 | Save scope | Regression | ✅ | — | ✅ | ✅ | — | GAP-M01 (API) |
| 6.3 | Cancel scope modal | Low | ✅ | — | — | — | — | None |
| 7.1 | Description modal opens | Regression | ✅ | — | — | — | — | None |
| 7.2 | Save valid description | Regression | ✅ | ✅ | ✅ | ✅ | — | GAP-M01 (API) |
| 7.3 | Empty description validation | Regression | ✅ | ✅ | — | — | — | None |
| 7.4 | Missing seq → status:2 | Regression | — | ✅ | ✅ | — | — | None |
| 8.1 | Add Feature modal opens | Regression | ✅ | — | — | — | ✅ | None |
| 8.2 | Valid add feature creates record | Regression | ✅ | ✅ | ✅ | ✅ | ✅ | GAP-M01 (API) |
| 8.3 | Duplicate Feature Key rejected | Regression | ✅ | ✅ | ✅ | ✅ | — | None |
| 8.4 | Duplicate Property Name rejected | Regression | ✅ | ✅ | ✅ | ✅ | — | None |
| 8.5 | Required fields validation | Regression | ✅ | ✅ | — | — | — | None |
| 8.6 | Module dropdown populated | Regression | ✅ | — | ✅ | — | — | None |
| 8.7 | Active Flag read-only default Y | Low | ✅ | — | — | — | — | None |
| 9.1 | Download Excel all flags | Regression | ✅ | — | ✅ | ✅ | ✅ | None |
| 9.2 | Export filename format | Low | ✅ | — | — | — | — | None |
| 9.3 | Import rejects non-xlsx | Regression | ✅ | ✅ | — | — | — | None |
| 9.4 | Import rejects empty file | Regression | ✅ | ✅ | — | — | — | None |
| 9.5 | Valid import updates features | Regression | ✅ | ✅ | ✅ | ✅ | — | GAP-M01 (API) |
| 9.6 | Status normalization Y/N variants | Regression | — | ✅ | ✅ | — | — | None |
| 9.7 | Import response shape | Regression | — | — | ✅ | ✅ | — | None |
| 9.8 | Missing keys as warnings | Regression | ✅ | — | ✅ | — | — | None |
| 9.9 | Download/Upload hidden off edit | Regression | ✅ | — | — | — | ✅ | None |
| 10.1 | Module list loads paginated | Smoke | ✅ | — | ✅ | ✅ | — | None |
| 10.2 | Search module name | Regression | ✅ | — | ✅ | ✅ | — | None |
| 10.3 | Status filter module list | Regression | ✅ | — | ✅ | ✅ | — | None |
| 10.4 | Toggle shows confirm dialog | Smoke | ✅ | — | ✅ | — | — | None |
| 10.5 | Confirm toggle updates + reload | Smoke | ✅ | — | ✅ | ✅ | — | None |
| 10.6 | Cancel reverts toggle | Regression | ✅ | — | ✅ | — | — | None |
| 10.7 | No data → empty state | Regression | ✅ | — | — | — | — | None |
| 10.8 | Pagination controls | Regression | ✅ | — | — | — | — | None |
