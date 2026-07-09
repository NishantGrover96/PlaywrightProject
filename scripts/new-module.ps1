<#
.SYNOPSIS
    Scaffold a new module or add a feature to an existing module for a specific client.

.PARAMETER Client
    Client ID in kebab-case (e.g. "demoportal", "certainteed", "samsung").
    Determines which client folder the feature is created under.

.PARAMETER Module
    Module name in kebab-case (e.g. "coop", "rebate", "rewards").

.PARAMETER Feature
    Feature name in kebab-case (e.g. "submit-claim", "submit-preapproval").

.PARAMETER Label
    Human-readable label for the feature (e.g. "Submit Claim"). Used in generated file headers.

.EXAMPLE
    .\scripts\new-module.ps1 -Client certainteed -Module rebate -Feature submit-rebate -Label "Submit Rebate"

.EXAMPLE
    .\scripts\new-module.ps1 -Client demoportal -Module coop -Feature submit-preapproval -Label "Submit Preapproval"
#>

param(
    [Parameter(Mandatory)][string]$Client,
    [Parameter(Mandatory)][string]$Module,
    [Parameter(Mandatory)][string]$Feature,
    [Parameter(Mandatory)][string]$Label
)

$root      = $PSScriptRoot | Split-Path
$templates = "$root\templates"
$modLabel  = (Get-Culture).TextInfo.ToTitleCase($Module)
$modUpper  = $Module.ToUpper() -replace '-', '_'

function New-Dir($path) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
}

function Copy-Template($src, $dst) {
    $content = Get-Content $src -Raw
    $content = $content `
        -replace '\{\{CLIENT\}\}',      $Client `
        -replace '\{\{MODULE\}\}',       $Module `
        -replace '\{\{FEATURE\}\}',      $Feature `
        -replace '\{\{MODULE_LABEL\}\}', $modLabel `
        -replace '\{\{FEATURE_LABEL\}\}',$Label `
        -replace '\{\{MODULE_UPPER\}\}', $modUpper `
        -replace '\{\{TABLE_NAME\}\}',   'TableName'
    New-Dir (Split-Path $dst)
    Set-Content -Path $dst -Value $content -Encoding utf8
    Write-Host "  created  $($dst.Replace($root, ''))"
}

Write-Host ""
Write-Host "Scaffolding client=$Client  module=$Module  feature=$Feature  label=`"$Label`""
Write-Host "---------------------------------------------------------"

# -- Playwright spec -----------------------------------------
Copy-Template `
    "$templates\feature-spec.ts" `
    "$root\tests\playwright\specs\$Client\$Module\feature-$Feature\$Feature.spec.ts"

# -- Page object ---------------------------------------------
$pageClass = (Get-Culture).TextInfo.ToTitleCase($Feature) -replace '-', ''
$pageFile  = "$root\tests\playwright\pages\$Client\$Module\feature-$Feature\${pageClass}Page.ts"
$pageSrc   = Get-Content "$templates\FeaturePage.ts" -Raw
$pageSrc   = $pageSrc `
    -replace '\{\{MODULE\}\}',  $Module `
    -replace '\{\{FEATURE\}\}', $Feature `
    -replace 'FeaturePage',     "${pageClass}Page"
New-Dir (Split-Path $pageFile)
Set-Content -Path $pageFile -Value $pageSrc -Encoding utf8
Write-Host "  created  $($pageFile.Replace($root, ''))"

# Fix spec import to use the real page class name
$specFile    = "$root\tests\playwright\specs\$Client\$Module\feature-$Feature\$Feature.spec.ts"
$specContent = Get-Content $specFile -Raw
$specContent = $specContent -replace 'FeaturePage', "${pageClass}Page"
Set-Content -Path $specFile -Value $specContent -Encoding utf8

# -- Helpers stub ---------------------------------------------
$helpersFile = "$root\tests\playwright\helpers\$Client\$Module\feature-$Feature\$Feature.helpers.ts"
New-Dir (Split-Path $helpersFile)
$helpersSrc = @"
import { type Page } from '@playwright/test';
import { ${pageClass}Page } from '../../../pages/$Client/$Module/feature-$Feature/${pageClass}Page';
import testData from '../../../data/$Client/$Module/feature-$Feature/test-data.json';

export async function goTo${pageClass}(page: Page): Promise<${pageClass}Page> {
  const featurePage = new ${pageClass}Page(page);
  await featurePage.navigate();
  return featurePage;
}

// TODO: add multi-step setup helpers used by 2+ tests
"@
Set-Content -Path $helpersFile -Value $helpersSrc -Encoding utf8
Write-Host "  created  $($helpersFile.Replace($root, ''))"

# -- Test data ------------------------------------------------
Copy-Template `
    "$templates\test-data.json" `
    "$root\tests\playwright\data\$Client\$Module\feature-$Feature\test-data.json"

# -- API spec -------------------------------------------------
Copy-Template `
    "$templates\feature-api.spec.ts" `
    "$root\tests\api\$Client\$Module\feature-$Feature\$Feature.api.spec.ts"

# -- Database script -------------------------------------------
Copy-Template `
    "$templates\verify-records.sql" `
    "$root\tests\database\$Client\$Module\feature-$Feature\verify-records.sql"

# -- Docs & Reports stubs --------------------------------------
$docFolders = @(
    "docs\migration-reports\$Client\$Module\feature-$Feature",
    "docs\module-analysis\$Client\$Module\feature-$Feature",
    "reports\readiness\$Client\$Module\feature-$Feature",
    "reports\test-results\$Client\$Module\feature-$Feature"
)
foreach ($d in $docFolders) {
    New-Dir "$root\$d"
    Write-Host "  created  \$d"
}

# -- Functional catalog HTML placeholder ----------------------
$catalogDir  = "$root\docs\functional-catalogs\$Client\$Module\feature-$Feature"
$catalogFile = "$catalogDir\functional-units.html"
New-Dir $catalogDir
$catalogHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>$Label - Functional Unit Catalog</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous" defer></script>
  <style>
    .tier-smoke      { background:#dbeafe; color:#1d4ed8; }
    .tier-regression { background:#ede9fe; color:#6d28d9; }
    .tier-e2e        { background:#d1fae5; color:#065f46; }
    .test-id         { font-family: monospace; font-weight: 700; white-space: nowrap; }
  </style>
</head>
<body class="bg-light">

<div class="bg-secondary text-white px-4 py-3">
  <h1 class="h4 mb-1">$Label — Functional Unit Catalog</h1>
  <p class="mb-0 small opacity-75">$Client | $Module module | feature-$Feature</p>
</div>

<div class="container-fluid px-4 py-4">

  <div class="alert alert-warning d-flex gap-3 align-items-start" role="alert">
    <span class="fs-4">⚠</span>
    <div>
      <strong>Catalog Not Yet Generated</strong>
      <p class="mb-1 mt-1">Run the <strong>functional-test-catalog</strong> skill in GitHub Copilot Chat to populate this file:</p>
      <code class="d-block bg-white border rounded px-2 py-1 small mt-2">
        @workspace /functional-test-catalog client=$Client module=$Module feature=$Feature
      </code>
      <p class="mt-2 mb-0 small text-muted">
        Module: <strong>$Module</strong> &nbsp;&bull;&nbsp;
        Feature: <strong>$Feature</strong> &nbsp;&bull;&nbsp;
        Client: <strong>$Client</strong>
      </p>
    </div>
  </div>

  <div class="card shadow-sm">
    <div class="card-header bg-light fw-semibold">Test Coverage — Placeholder</div>
    <div class="card-body p-0">
      <div class="table-responsive">
        <table class="table table-bordered table-striped table-hover table-sm align-middle mb-0">
          <thead class="table-dark">
            <tr>
              <th scope="col">Test ID</th>
              <th scope="col">Title</th>
              <th scope="col">Tier</th>
              <th scope="col">Priority</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="test-id text-muted">—</td>
              <td class="text-muted fst-italic">No tests generated yet. Run the functional-test-catalog skill.</td>
              <td></td>
              <td></td>
              <td><span class="badge bg-secondary">Pending</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</div>
</body>
</html>
"@
Set-Content -Path $catalogFile -Value $catalogHtml -Encoding utf8
Write-Host "  created  $($catalogFile.Replace($root, ''))"

Write-Host "---------------------------------------------------------"
Write-Host "Done. Next steps:"
Write-Host "  1. Fill in test-data.json with real test values"
Write-Host "  2. Replace locators in ${pageClass}Page.ts"
Write-Host "  3. Implement TODO blocks in $Feature.spec.ts"
Write-Host "  4. Generate catalog: run functional-test-catalog skill for client=$Client module=$Module feature=$Feature"
Write-Host ""
